import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { SEED_PROJECTS, SEED_INVENTORY } from './src/data/seedProjects';
import { SEED_CAMPAIGNS, generateConsistentSvgArtwork, CAMPAIGN_FORMAT_CONFIGS } from './src/data/seedCampaigns';
import {
  Project,
  InventoryAsset,
  AuditLogEntry,
  UserRole,
  GeneratedCampaign,
  CampaignAsset,
  CampaignFormatType,
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Storage directory & persistence files
const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');

// Ensure data folder and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadProjects(): Project[] {
  try {
    if (fs.existsSync(PROJECTS_FILE)) {
      const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
      const loaded: Project[] = JSON.parse(data);
      let changed = false;
      for (const sp of SEED_PROJECTS) {
        if (!loaded.some((p) => p.id === sp.id)) {
          loaded.push(sp);
          changed = true;
        }
      }
      if (changed) saveProjects(loaded);
      return loaded;
    }
  } catch (err) {
    console.error('Error loading projects file, reverting to seed:', err);
  }
  // Initialize with seed
  saveProjects(SEED_PROJECTS);
  return SEED_PROJECTS;
}

function saveProjects(projects: Project[]): void {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save projects to file:', err);
  }
}

function loadInventory(): InventoryAsset[] {
  try {
    if (fs.existsSync(INVENTORY_FILE)) {
      const data = fs.readFileSync(INVENTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading inventory file:', err);
  }
  saveInventory(SEED_INVENTORY);
  return SEED_INVENTORY;
}

function saveInventory(inventory: InventoryAsset[]): void {
  try {
    fs.writeFileSync(INVENTORY_FILE, JSON.stringify(inventory, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save inventory to file:', err);
  }
}

function loadAuditLogs(): AuditLogEntry[] {
  try {
    if (fs.existsSync(AUDIT_FILE)) {
      const data = fs.readFileSync(AUDIT_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch {
    // Return empty if unreadable
  }
  return [];
}

function appendAuditLog(entry: AuditLogEntry): void {
  try {
    const logs = loadAuditLogs();
    logs.unshift(entry);
    // Keep last 500 entries
    if (logs.length > 500) logs.length = 500;
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}

function loadCampaigns(): GeneratedCampaign[] {
  try {
    if (fs.existsSync(CAMPAIGNS_FILE)) {
      const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf-8');
      const loaded: GeneratedCampaign[] = JSON.parse(data);
      let changed = false;
      for (const sc of SEED_CAMPAIGNS) {
        if (!loaded.some((c) => c.id === sc.id)) {
          loaded.push(sc);
          changed = true;
        }
      }
      if (changed) saveCampaigns(loaded);
      return loaded;
    }
  } catch (err) {
    console.error('Error loading campaigns file, reverting to seed:', err);
  }
  saveCampaigns(SEED_CAMPAIGNS);
  return SEED_CAMPAIGNS;
}

function saveCampaigns(campaignsData: GeneratedCampaign[]): void {
  try {
    fs.writeFileSync(CAMPAIGNS_FILE, JSON.stringify(campaignsData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save campaigns to file:', err);
  }
}

// In-memory / file-backed state
let projects: Project[] = loadProjects();
let inventory: InventoryAsset[] = loadInventory();
let campaigns: GeneratedCampaign[] = loadCampaigns();

// Centralized Model Identifiers for TEFA Creative Studio
// Never invent a model ID. Google AI Studio supported Nano Banana alias is gemini-3.1-flash-lite-image
export const CREATIVE_STUDIO_MODELS = {
  IMAGE_MODEL: process.env.IMAGE_MODEL_ID || 'gemini-3.1-flash-lite-image',
  TEXT_PLANNING_MODEL: process.env.TEXT_MODEL_ID || 'gemini-3.8-flash',
};

// Gemini client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// System Status & Storage Mode
app.get('/api/system/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'TEFA ProjectHub – From Idea to Impact',
    organization: 'TechEnergy For Africa e.V.',
    storageType: 'Persistent File Store (JSON database on server)',
    projectCount: projects.length,
    inventoryCount: inventory.length,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Reset Demo Data
app.post('/api/projects/reset-demo', (_req: Request, res: Response) => {
  projects = JSON.parse(JSON.stringify(SEED_PROJECTS));
  inventory = JSON.parse(JSON.stringify(SEED_INVENTORY));
  saveProjects(projects);
  saveInventory(inventory);
  appendAuditLog({
    id: 'log_reset_' + Date.now(),
    timestamp: new Date().toISOString(),
    userId: 'system',
    userName: 'System Administrator',
    userRole: 'system_admin',
    action: 'DEMO_DATA_RESET',
    details: 'Reset projects and inventory to initial verified seed state.',
  });
  res.json({ success: true, message: 'Projects and inventory reset to default seed data.' });
});

// List all projects
app.get('/api/projects', (_req: Request, res: Response) => {
  res.json(projects);
});

// Get specific project (with visitor privacy masking)
app.get('/api/projects/:id', (req: Request, res: Response) => {
  const userRole = (req.headers['x-user-role'] as string) || 'visitor';
  const project = projects.find((p) => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  // Mask internal transactions for unauthorized visitor roles
  if (userRole === 'visitor') {
    const masked = {
      ...project,
      transactions: [],
      budgetItems: project.budgetItems.map((b) => ({
        ...b,
        actualExpenditure: 0,
        committedCost: 0,
      })),
    };
    return res.json(masked);
  }

  res.json(project);
});

// Create new project
app.post('/api/projects', (req: Request, res: Response) => {
  const newProj = req.body as Project;
  if (!newProj.title) {
    return res.status(400).json({ error: 'Project title is required' });
  }
  // Generate reference ID if not provided
  if (!newProj.referenceId) {
    const year = new Date().getFullYear();
    const count = projects.length + 1;
    newProj.referenceId = `TEFA-${year}-PRJ-${String(count).padStart(3, '0')}`;
  }
  newProj.createdAt = newProj.createdAt || new Date().toISOString();
  newProj.updatedAt = new Date().toISOString();
  newProj.id = newProj.id || 'proj_' + Date.now();

  projects.unshift(newProj);
  saveProjects(projects);

  appendAuditLog({
    id: 'log_' + Date.now(),
    timestamp: new Date().toISOString(),
    userId: (req.headers['x-user-id'] as string) || 'user',
    userName: newProj.createdBy || (req.headers['x-user-name'] as string) || 'Authorized User',
    userRole: ((req.headers['x-user-role'] as string) as UserRole) || 'project_manager',
    action: 'PROJECT_CREATED',
    projectId: newProj.id,
    projectTitle: newProj.title,
    details: `Created new project proposal [${newProj.referenceId}]: ${newProj.title}`,
  });

  res.status(201).json(newProj);
});

// Update project with Backend RBAC & Governance validation
app.put('/api/projects/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const userRole = (req.headers['x-user-role'] as string) || 'visitor';
  const userName = (req.headers['x-user-name'] as string) || '';
  const currentProject = projects[index];

  // RBAC Rule 1: Visitors cannot modify internal project records
  if (userRole === 'visitor') {
    return res.status(403).json({
      error: 'Forbidden: Visitors cannot edit existing internal project records.',
    });
  }

  // RBAC Rule 2: Governance approval & status transitions
  if (req.body.status && req.body.status !== currentProject.status) {
    const isApprovalOrRejection =
      req.body.status === 'Approved' ||
      req.body.status === 'Rejected' ||
      req.body.status === 'Closed';

    if (isApprovalOrRejection) {
      if (userRole !== 'board_member' && userRole !== 'system_admin') {
        return res.status(403).json({
          error: 'Forbidden: Only board members or system administrators can approve, reject, or close a project.',
        });
      }

      // Governance Rule 3: A project proposer cannot approve their own proposal!
      if (req.body.status === 'Approved') {
        const isProposer =
          currentProject.createdBy &&
          userName &&
          currentProject.createdBy.toLowerCase().includes(userName.toLowerCase());

        if (isProposer) {
          return res.status(403).json({
            error: 'Forbidden: A project proposer cannot approve their own project proposal.',
          });
        }
      }
    }
  }

  const updated: Project = {
    ...projects[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updated;
  saveProjects(projects);
  res.json(updated);
});

// Delete project (Board member & Admin only)
app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const userRole = (req.headers['x-user-role'] as string) || 'visitor';

  if (userRole !== 'board_member' && userRole !== 'system_admin') {
    return res.status(403).json({
      error: 'Forbidden: Only board members or system administrators can delete projects.',
    });
  }

  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const deleted = projects.splice(index, 1)[0];
  saveProjects(projects);
  res.json({ success: true, deletedId: id, title: deleted.title });
});

// Inventory APIs
app.get('/api/inventory', (req: Request, res: Response) => {
  const env = req.query.env as string;
  if (env === 'live' || env === 'test') {
    return res.json(inventory.filter((i) => i.environment === env));
  }
  res.json(inventory);
});

app.post('/api/inventory', (req: Request, res: Response) => {
  const newAsset = req.body as InventoryAsset;
  newAsset.id = newAsset.id || 'asset_' + Date.now();
  inventory.unshift(newAsset);
  saveInventory(inventory);
  res.status(201).json(newAsset);
});

app.put('/api/inventory/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const idx = inventory.findIndex((i) => i.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Asset not found' });
  }
  inventory[idx] = { ...inventory[idx], ...req.body };
  saveInventory(inventory);
  res.json(inventory[idx]);
});

// Audit Logs APIs
app.get('/api/audit-logs', (_req: Request, res: Response) => {
  res.json(loadAuditLogs());
});

app.post('/api/audit-logs', (req: Request, res: Response) => {
  const entry = req.body as AuditLogEntry;
  appendAuditLog(entry);
  res.status(201).json({ success: true });
});

// -------------------------------------------------------------
// GEMINI AI ASSISTED ENDPOINTS (Server-Side)
// -------------------------------------------------------------

// 1. AI Proposal Improvement Assistant
app.post('/api/ai/proposal-assist', async (req: Request, res: Response) => {
  const { title, category, problemStatement, proposedSolution, targetBeneficiaries, lang } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      mode: 'offline_fallback',
      improvedProblemStatement: problemStatement ? `${problemStatement}\n\n[Empfehlung zur Präzisierung]: Spezifizieren Sie die genaue Altersgruppe sowie die Messgröße des Bedarfs vor Ort.` : '',
      improvedSolution: proposedSolution ? `${proposedSolution}\n\n[Empfehlung]: Ergänzen Sie die genaue Art der Barrierefreiheit (z.B. Gebärdensprache, visuelle Lernsoftware).` : '',
      suggestedObjectives: [
        'Konkrete Zieldefinition für Ausbildungsabschluss mit nachweisbaren Zertifikaten',
        'Sicherstellung von mind. 95% unterbrechungsfreier Stromversorgung durch Solarspeicher',
        'Aufbau lokaler Arbeitgeberkooperationen zur Arbeitsmarktintegration',
      ],
      suggestedActivities: [
        'Durchführung einer barrierefreien Bedarfsanalyse im Projektgebiet',
        'Beschaffung, Zollabwicklung und technische Prüfung der IT- und Solarausstattung',
        'Pädagogische Schulung des lokalen Trainerteams und Gebärdensprachdolmetschers',
      ],
      aiFeedbackNotes: 'Hinweis: Dieser Vorschlag basiert auf Best-Practice-Kriterien für TEFA-Projekte in Afrika. Passen Sie die Daten an die realen Verhältnisse an.',
    });
  }

  try {
    const prompt = `
You are the Senior Nonprofit Project Architect for TechEnergy For Africa e.V. (TEFA).
A project proposer is drafting a proposal for:
Title: "${title || 'Untitled'}"
Category: "${category || 'digital_inclusion'}"
Problem Statement: "${problemStatement || ''}"
Proposed Solution: "${proposedSolution || ''}"
Target Beneficiaries: "${targetBeneficiaries || ''}"
Language for output: "${lang || 'de'}" (Respond in this language: de, en, or fr)

CRITICAL INSTRUCTIONS:
- Do NOT invent fictional grants, partnerships, or official achievements.
- Separate proven project elements from hypotheses.
- Provide constructive, structured enhancements to improve clarity, Measurable SMART objectives, concrete operational activities, and inclusion considerations.
- Return a valid JSON response matching this schema:
{
  "improvedProblemStatement": "refined, concise problem statement",
  "improvedSolution": "clear, well-structured solution description",
  "suggestedObjectives": ["objective 1", "objective 2", "objective 3"],
  "suggestedActivities": ["activity 1", "activity 2", "activity 3", "activity 4"],
  "inclusionRecommendations": "specific advice on accessibility, gender, and local partner integration",
  "risksToConsider": ["risk 1", "risk 2"]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (err: unknown) {
    console.error('Error generating AI proposal suggestions:', err);
    res.status(500).json({
      error: 'AI assistance currently unavailable',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 2. AI Decision Advisor & Tiebreaker Tool
app.post('/api/ai/advisor', async (req: Request, res: Response) => {
  const { decisionTitle, problemStatement, analysisType, criteria, options, projectContext, lang } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      mode: 'offline_fallback',
      recommendation: 'Auf Basis der vorliegenden Kriterien wird Option 1 empfohlen, sofern die zollrechtlichen Freistellungen vor Versand gesichert sind.',
      reasoning: 'Geringere Gesamtkosten und integrierte Batteriepufferung bieten Vorteile bei Stromschwankungen.',
      assumptions: ['Lokale Partnerschaft ist stabil', 'Zollabwicklung dauert maximal 60 Tage'],
      missingInfo: ['Exakte Zollsätze für Bildungsspenden', 'Verfügbarkeit lokaler Ersatzakkus'],
      limitations: ['Die KI kann behördliche Genehmigungen in Kamerun nicht garantieren.'],
      analysisType: analysisType || 'swot',
    });
  }

  try {
    const prompt = `
You are the AI Project Governance Advisor for TechEnergy For Africa e.V. (TEFA).
Help evaluate a critical project decision using a structured decision matrix/SWOT/Tiebreaker approach.

Decision Title: "${decisionTitle}"
Problem Statement: "${problemStatement}"
Analysis Type: "${analysisType}" (e.g. swot, pros_cons, weighted_matrix, cost_benefit)
Project Context: "${projectContext || 'Community and digital training project in Africa'}"
Evaluation Criteria: ${JSON.stringify(criteria || [])}
Alternatives Considered: ${JSON.stringify(options || [])}
Output Language: "${lang || 'de'}"

MANDATORY RULES:
- The AI advice is strictly advisory. Humans (Board/PM) make the binding decision.
- You MUST explain:
  1) The recommended alternative with explicit analytical reasoning.
  2) Explicit assumptions made in your evaluation.
  3) Missing information that TEFA needs to clarify before taking action.
  4) Limitations of this analysis.
- If analysisType is swot, evaluate Strengths, Weaknesses, Opportunities, and Threats for each alternative.

Respond with valid JSON:
{
  "recommendation": "Summary recommendation string",
  "reasoning": "Detailed breakdown of why this option is preferred",
  "assumptions": ["assumption 1", "assumption 2"],
  "missingInfo": ["missing piece of info 1", "missing piece of info 2"],
  "limitations": ["limitation 1", "limitation 2"],
  "optionEvaluations": [
    {
      "optionId": "id of option",
      "swot": {
        "strengths": ["..."],
        "weaknesses": ["..."],
        "opportunities": ["..."],
        "threats": ["..."]
      },
      "pros": ["..."],
      "cons": ["..."],
      "suggestedScore": 8.5
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (err: unknown) {
    console.error('Error in AI decision advisor:', err);
    res.status(500).json({
      error: 'AI Advisor analysis failed',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 3. AI Partner & Donor Communication Drafter
app.post('/api/ai/draft-communication', async (req: Request, res: Response) => {
  const { type, recipientName, recipientOrg, projectTitle, keyPoints, lang } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      subject: `Kooperationsanfrage: ${projectTitle || 'Projektkooperation TEFA e.V.'}`,
      body: `Sehr geehrte Damen und Herren,\n\nim Namen von TechEnergy For Africa e.V. (TEFA) möchten wir Ihnen das Vorhaben "${projectTitle}" vorstellen...\n\nMit freundlichen Grüßen,\nTechEnergy For Africa e.V.`,
      disclaimer: 'Hinweis: Diese E-Mail ist ein Entwurf. Sie wurde weder versendet noch autorisiert.',
    });
  }

  try {
    const prompt = `
You are the Communications Director for TechEnergy For Africa e.V. (TEFA).
Draft a professional nonprofit communication:
Type: "${type}" (e.g. partnership_inquiry, grant_concept_note, donor_update, mou_draft)
Recipient: "${recipientName || 'Ansprechpartner'}" at "${recipientOrg || 'Organisation'}"
Project Title: "${projectTitle || 'TEFA Project'}"
Key Points to Include: "${keyPoints || 'Project goals, solar-backed digital inclusion, collaborative opportunities'}"
Language: "${lang || 'de'}" (Write completely in this language: de, en, or fr)

RULES:
- Do NOT invent false claims or declare that funding is already granted.
- Mark clearly that this is a proposed draft.
- Maintain a warm, highly professional, diplomatic tone suitable for international cooperation.

Return JSON:
{
  "subject": "Email subject line or document title",
  "salutation": "Proper salutation",
  "body": "Complete letter / message body with formatted paragraphs",
  "callToAction": "Clear next step proposed to the partner"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (err: unknown) {
    console.error('Error drafting communication:', err);
    res.status(500).json({
      error: 'Draft generation failed',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// -------------------------------------------------------------
// CREATIVE STUDIO API ENDPOINTS
// -------------------------------------------------------------

// 1. Creative Studio Configuration & Health
app.get('/api/creative-studio/config', (_req: Request, res: Response) => {
  res.json({
    imageModel: CREATIVE_STUDIO_MODELS.IMAGE_MODEL,
    textPlanningModel: CREATIVE_STUDIO_MODELS.TEXT_PLANNING_MODEL,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    formats: CAMPAIGN_FORMAT_CONFIGS,
    costWarningNotice:
      'Kostentransparenz & API-Nutzung: Die Generierung von KI-Bildern beansprucht Token- und Rechenkontingente (Google AI Studio Image API). Bitte sparsam einsetzen und Entwürfe vor dem Batch-Start prüfen. Batch-Limit: maximal 9 Formate pro Durchlauf.',
    requestBatchLimit: 9,
    defaultNoPeopleMode: true,
  });
});

// 2. List all Campaigns
app.get('/api/creative-studio/campaigns', (_req: Request, res: Response) => {
  res.json(campaigns);
});

// 3. Get single Campaign
app.get('/api/creative-studio/campaigns/:id', (req: Request, res: Response) => {
  const camp = campaigns.find((c) => c.id === req.params.id);
  if (!camp) {
    return res.status(404).json({ error: 'Kampagne nicht gefunden' });
  }
  res.json(camp);
});

// 4. Create or Update Campaign Brief
app.post('/api/creative-studio/campaigns', (req: Request, res: Response) => {
  const userRole = (req.headers['x-user-role'] as string) || 'visitor';
  const userName = (req.headers['x-user-name'] as string) || 'Anonymous';
  const campaignData: GeneratedCampaign = req.body;

  if (!campaignData.id) {
    campaignData.id = 'camp_' + Date.now();
  }

  const existingIndex = campaigns.findIndex((c) => c.id === campaignData.id);
  if (existingIndex >= 0) {
    campaigns[existingIndex] = campaignData;
  } else {
    campaigns.unshift(campaignData);
  }

  saveCampaigns(campaigns);

  appendAuditLog({
    id: 'aud_' + Date.now(),
    timestamp: new Date().toISOString(),
    userId: (req.headers['x-user-id'] as string) || 'anon',
    userName,
    userRole: userRole as UserRole,
    action: 'CAMPAIGN_SAVED',
    projectId: campaignData.brief.projectId,
    projectTitle: campaignData.brief.projectTitle,
    details: `Kampagnen-Entwurf '${campaignData.brief.title}' gespeichert (Version ${campaignData.brief.version || 1})`,
  });

  res.json({ success: true, campaign: campaignData });
});

// 5. Delete Campaign
app.delete('/api/creative-studio/campaigns/:id', (req: Request, res: Response) => {
  const campId = req.params.id;
  const initialLen = campaigns.length;
  campaigns = campaigns.filter((c) => c.id !== campId);

  if (campaigns.length === initialLen) {
    return res.status(404).json({ error: 'Kampagne nicht gefunden' });
  }

  saveCampaigns(campaigns);
  res.json({ success: true, message: 'Kampagne gelöscht' });
});

// 6. AI Campaign Text & Creative Strategy Planning (Gemini)
app.post('/api/creative-studio/plan', async (req: Request, res: Response) => {
  const { projectTitle, projectDescription, objective, targetAudience, lifecyclePhase, lang, noPeopleMode } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      success: true,
      mode: 'offline_planner',
      suggestedTitle: `${projectTitle || 'TEFA Vorhaben'}: Saubere Solarenergie & Bildungschancen`,
      mainMessage: 'Nachhaltige Solarinfrastruktur eröffnet verlässliche Bildungschancen ohne CO2-Emissionen.',
      callToAction: 'Jetzt Bildungspartner von TechEnergy For Africa e.V. werden',
      headline: 'Solarenergie für verlässliche Bildung',
      subtitle: `Gemeinsam schaffen wir digitale Lernräume für ${targetAudience || 'junge Menschen'} in Afrika.`,
      imagePromptDescription: `Modern sustainable solar-powered educational setup in Africa. High efficiency photovoltaic panels, clean desks with open laptops, books, natural sunlight, lush vegetation. STRICT CONSTRAINT: ${noPeopleMode !== false ? 'NO people, NO human faces, NO human silhouettes, NO hands.' : 'Authentic non-stereotypical community representation.'}`,
      negativePrompt: noPeopleMode !== false ? 'people, human, face, silhouette, hands, crowd, messy, distorted' : 'stereotypes, distorted, low quality',
      suggestedColors: ['#0f2b48', '#10b981', '#f97316'],
      visualElements: ['Solar photovoltaic modules', 'Laptops with coding interface', 'Educational books', 'Green seedlings & eco-tech sensors'],
      typographyTone: 'Professional, forward-looking, non-profit transparency',
    });
  }

  try {
    const prompt = `
You are the Senior Communications Strategist & Creative Director for TechEnergy For Africa e.V. (TEFA).
TEFA is a German registered non-profit (e.V.) advancing renewable energy and digital education in Africa (Cameroon, Senegal, etc.).
Website: https://www.techenergyforafrica.com

Plan a comprehensive visual campaign strategy:
Project Title: "${projectTitle || 'TEFA Project'}"
Project Context: "${projectDescription || 'Solar energy and digital literacy hub'}"
Campaign Objective: "${objective || 'Fundraising and partner outreach'}"
Target Audience: "${targetAudience || 'Institutional donors, foundations, CSR partners'}"
Lifecycle Phase: "${lifecyclePhase || 'fundraising_outreach'}"
Language: "${lang || 'de'}" (Write headlines, copy, messages completely in this language: de, en, or fr)
No People Mode: ${noPeopleMode !== false ? 'ENABLED - STRICTLY NO HUMANS, NO FACES, NO SILHOUETTES, NO CROWDS, NO HANDS. Focus on equipment, renewable tech, laptops, architecture, seedlings, landscapes.' : 'Disabled'}

CRITICAL RULES:
- Do NOT invent fake achievements, unconfirmed funding amounts, or exaggerated impact statistics.
- Keep tone professional, respectful, modern, and transparent.
- If No People Mode is enabled, the imagePromptDescription must focus exclusively on equipment, clean solar systems, laptops, books, seedlings, and modern architecture.

Return valid JSON:
{
  "suggestedTitle": "Short compelling campaign title",
  "mainMessage": "Core campaign message (1-2 sentences)",
  "callToAction": "Clear concise call to action button label",
  "headline": "High-impact visual headline (under 8 words)",
  "subtitle": "Explanatory supporting subtitle (under 16 words)",
  "imagePromptDescription": "Detailed visual description prompt for Nano Banana image generation model",
  "negativePrompt": "Strict negative prompt keywords",
  "suggestedColors": ["#0f2b48", "#10b981", "#f97316"],
  "visualElements": ["element 1", "element 2", "element 3"],
  "typographyTone": "Tone description"
}
`;

    const response = await ai.models.generateContent({
      model: CREATIVE_STUDIO_MODELS.TEXT_PLANNING_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, ...parsed });
  } catch (err: unknown) {
    console.error('Error generating creative studio plan:', err);
    res.status(500).json({
      error: 'Creative planning failed',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// 7. AI Master Visual Image Generation (Nano Banana: 'gemini-3.1-flash-lite-image')
app.post('/api/creative-studio/generate-master', async (req: Request, res: Response) => {
  const { prompt, negativePrompt, visualStyle, noPeopleMode, colors, projectTitle } = req.body;

  // Build strict negative constraint if no-people mode is on (default: true)
  const isNoPeople = noPeopleMode !== false;
  let finalPrompt = prompt || `Clean solar-powered technology hub for ${projectTitle || 'TechEnergy For Africa'}. Modern photovoltaic panels, computers, educational hardware, vibrant energy.`;

  if (isNoPeople) {
    finalPrompt += ' STRICT REQUIREMENT: Absolutely NO people, NO human figures, NO faces, NO human silhouettes, NO human hands, NO crowds. Focus solely on equipment, clean tech, solar panels, laptops, books, seedlings, modern classrooms.';
  }

  // Model ID check: Use centralized model
  const imageModel = CREATIVE_STUDIO_MODELS.IMAGE_MODEL;

  // If Gemini API Key is available, attempt real image generation
  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: imageModel,
        contents: {
          parts: [{ text: finalPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1',
          },
        },
      });

      // Find image part in candidates
      let base64Image: string | null = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          base64Image = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (base64Image) {
        return res.json({
          success: true,
          imageUrl: base64Image,
          modelUsed: imageModel,
          promptUsed: finalPrompt,
          isNoPeopleApplied: isNoPeople,
          isLiveModel: true,
        });
      }
    } catch (err: unknown) {
      console.warn(`Nano Banana image model '${imageModel}' call note:`, err);
      // Return clear error if model is unavailable
      const errMsg = err instanceof Error ? err.message : String(err);
      return res.status(502).json({
        error: `Bildgenerierungs-Modell '${imageModel}' ist derzeit nicht verfügbar: ${errMsg}. Sie können den konsistenten Studio-Vektor-Render nutzen.`,
        modelUsed: imageModel,
        fallbackAvailable: true,
      });
    }
  }

  // Fallback high-fidelity consistent SVG artwork for offline / sandbox execution
  const primary = colors?.[0] || '#0f2b48';
  const secondary = colors?.[1] || '#10b981';
  const accent = colors?.[2] || '#f97316';
  const svgUrl = generateConsistentSvgArtwork('master_visual', finalPrompt, primary, secondary, accent);

  res.json({
    success: true,
    imageUrl: svgUrl,
    modelUsed: imageModel,
    promptUsed: finalPrompt,
    isNoPeopleApplied: isNoPeople,
    isLiveModel: false,
    notice: `Generiert im TEFA Studio Render-Modus. Aktives Modell-Target: '${imageModel}'.`,
  });
});

// 8. Generate Specific Format Asset from Master Visual
app.post('/api/creative-studio/generate-format', async (req: Request, res: Response) => {
  const { format, masterVisualUrl, brandIdentity, brief, headline, subtitle, callToAction } = req.body;

  const formatConfig = CAMPAIGN_FORMAT_CONFIGS.find((f) => f.id === format) || CAMPAIGN_FORMAT_CONFIGS[0];
  const primary = brandIdentity?.colorPalette?.primary || '#0f2b48';
  const secondary = brandIdentity?.colorPalette?.secondary || '#10b981';
  const accent = brandIdentity?.colorPalette?.accent || '#f97316';

  // Format adaptation: generate matching aspect ratio SVG or derivative
  const formatArtworkUrl = generateConsistentSvgArtwork(format, brief?.title || 'TEFA Campaign', primary, secondary, accent);

  const asset: CampaignAsset = {
    id: `asset_${format}_${Date.now()}`,
    campaignId: brief?.id || 'camp_active',
    format: format as CampaignFormatType,
    version: 1,
    imageUrl: formatArtworkUrl,
    headline: headline || brief?.textToDisplay?.headline || 'Solar-Bildung für Afrika',
    subtitle: subtitle || brief?.textToDisplay?.subtitle || 'Nachhaltige Energie & Inklusion',
    callToAction: callToAction || brief?.textToDisplay?.callToAction || 'Mehr erfahren',
    overlayConfig: {
      headline: headline || brief?.textToDisplay?.headline || 'Solar-Bildung für Afrika',
      subtitle: subtitle || brief?.textToDisplay?.subtitle || 'Nachhaltige Energie & Inklusion',
      callToAction: callToAction || brief?.textToDisplay?.callToAction || 'Mehr erfahren',
      organizationBadge: 'TechEnergy For Africa e.V.',
      logoPosition: format === 'linkedin_graphic' ? 'top-right' : 'top-left',
      textAlignment: format === 'instagram_square' ? 'center' : 'left',
      fontSize: formatConfig.category === 'print' ? 'prominent' : 'medium',
      textColor: 'light',
      overlayOpacity: 0.38,
      badgeText: 'TEFA INITIATIVE',
    },
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isAiGenerated: true,
    modelUsed: CREATIVE_STUDIO_MODELS.IMAGE_MODEL,
  };

  res.json({ success: true, asset, formatConfig });
});

// 9. Campaign Review and Approval (Human Approval with RBAC)
app.post('/api/creative-studio/campaigns/:id/approve', (req: Request, res: Response) => {
  const userRole = (req.headers['x-user-role'] as string) || 'visitor';
  const userName = (req.headers['x-user-name'] as string) || 'Anonymous';
  const { status, notes } = req.body; // 'approved' | 'rejected' | 'under_review'

  // RBAC: Only Project Managers, Board Members, or Admins can approve
  if (status === 'approved' && userRole !== 'board_member' && userRole !== 'project_manager' && userRole !== 'system_admin') {
    return res.status(403).json({
      error: 'Zugriff verweigert: Nur Vorstandsmitglieder oder Projektleiter dürfen Kampagnen offiziell zur Veröffentlichung freigeben.',
    });
  }

  const camp = campaigns.find((c) => c.id === req.params.id);
  if (!camp) {
    return res.status(404).json({ error: 'Kampagne nicht gefunden' });
  }

  camp.brief.status = status;
  // Update all assets status as well
  camp.assets = camp.assets.map((a) => ({
    ...a,
    status,
    reviewedBy: userName,
    reviewedAt: new Date().toISOString(),
    notes: notes || a.notes,
  }));

  if (!camp.approvalHistory) camp.approvalHistory = [];
  camp.approvalHistory.push({
    id: 'appr_' + Date.now(),
    status,
    changedBy: userName,
    changedByRole: userRole,
    timestamp: new Date().toISOString(),
    comment: notes || (status === 'approved' ? 'Offizielle Freigabe erteilt' : 'Status geändert'),
  });

  saveCampaigns(campaigns);

  appendAuditLog({
    id: 'aud_' + Date.now(),
    timestamp: new Date().toISOString(),
    userId: (req.headers['x-user-id'] as string) || 'anon',
    userName,
    userRole: userRole as UserRole,
    action: status === 'approved' ? 'CAMPAIGN_APPROVED' : 'CAMPAIGN_STATUS_CHANGED',
    projectId: camp.brief.projectId,
    projectTitle: camp.brief.projectTitle,
    details: `Kampagne '${camp.brief.title}' Status geändert auf '${status}' durch ${userName} (${userRole}). Notiz: ${notes || 'Keine'}`,
  });

  res.json({ success: true, campaign: camp });
});

// 10. Save Approved Campaign to Project Record
app.post('/api/creative-studio/campaigns/:id/save-to-project', (req: Request, res: Response) => {
  const camp = campaigns.find((c) => c.id === req.params.id);
  if (!camp) {
    return res.status(404).json({ error: 'Kampagne nicht gefunden' });
  }

  const projectId = camp.brief.projectId;
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return res.status(404).json({ error: 'Zugehöriges Projekt nicht gefunden' });
  }

  if (!project.communicationCampaigns) {
    project.communicationCampaigns = [];
  }

  const existIdx = project.communicationCampaigns.findIndex((c) => c.id === camp.id);
  if (existIdx >= 0) {
    project.communicationCampaigns[existIdx] = camp;
  } else {
    project.communicationCampaigns.push(camp);
  }

  // Also sync assets
  if (!project.campaignAssets) project.campaignAssets = [];
  for (const asset of camp.assets) {
    const aIdx = project.campaignAssets.findIndex((a) => a.id === asset.id);
    if (aIdx >= 0) {
      project.campaignAssets[aIdx] = asset;
    } else {
      project.campaignAssets.push(asset);
    }
  }

  camp.isSavedToProject = true;
  camp.savedToProjectId = projectId;

  saveCampaigns(campaigns);
  saveProjects(projects);

  appendAuditLog({
    id: 'aud_' + Date.now(),
    timestamp: new Date().toISOString(),
    userId: (req.headers['x-user-id'] as string) || 'anon',
    userName: (req.headers['x-user-name'] as string) || 'Admin',
    userRole: ((req.headers['x-user-role'] as string) || 'project_manager') as UserRole,
    action: 'CAMPAIGN_LINKED_TO_PROJECT',
    projectId: project.id,
    projectTitle: project.title,
    details: `Kampagnen-Dossier '${camp.brief.title}' (${camp.assets.length} Medienformate) fest im Projektdatensatz archiviert.`,
  });

  res.json({ success: true, project, campaign: camp });
});

// -------------------------------------------------------------
// VITE / STATIC CLIENT INTEGRATION
// -------------------------------------------------------------
async function setupVite() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In dev: mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve transformed index.html for SPA in dev mode
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // In production: serve dist
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TEFA ProjectHub server running on http://0.0.0.0:${PORT}`);
    console.log(`Backend persistent storage ready at: ${DATA_DIR}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
