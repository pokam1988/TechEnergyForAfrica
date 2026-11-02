import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { SEED_PROJECTS, SEED_INVENTORY } from './src/data/seedProjects';
import { SEED_ORGANIZATIONS, SEED_PROGRAMMES } from './src/data/seedOrganizations';
import { SEED_CAMPAIGNS, generateConsistentSvgArtwork, CAMPAIGN_FORMAT_CONFIGS } from './src/data/seedCampaigns';
import {
  Project,
  InventoryAsset,
  AuditLogEntry,
  UserRole,
  GeneratedCampaign,
  CampaignAsset,
  CampaignFormatType,
  Organization,
  Programme,
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use(express.static(path.join(__dirname, 'public')));

// Storage directory & persistence files
const DATA_DIR = path.join(__dirname, 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json');
const ORGANIZATIONS_FILE = path.join(DATA_DIR, 'organizations.json');
const PROGRAMMES_FILE = path.join(DATA_DIR, 'programmes.json');

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
        const idx = loaded.findIndex((p) => p.id === sp.id);
        if (idx === -1) {
          loaded.push(sp);
          changed = true;
        } else if (sp.isDemoOrHypothetical) {
          loaded[idx] = sp;
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
      const loaded: InventoryAsset[] = JSON.parse(data);
      let changed = false;
      for (const si of SEED_INVENTORY) {
        const idx = loaded.findIndex((i) => i.id === si.id);
        if (idx === -1) {
          loaded.push(si);
          changed = true;
        } else if (si.environment === 'test') {
          loaded[idx] = si;
          changed = true;
        }
      }
      if (changed) saveInventory(loaded);
      return loaded;
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

function loadOrganizations(): Organization[] {
  try {
    if (fs.existsSync(ORGANIZATIONS_FILE)) {
      const data = fs.readFileSync(ORGANIZATIONS_FILE, 'utf-8');
      const loaded: Organization[] = JSON.parse(data);
      let changed = false;
      for (const so of SEED_ORGANIZATIONS) {
        if (!loaded.some((o) => o.id === so.id)) {
          loaded.push(so);
          changed = true;
        }
      }
      if (changed) saveOrganizations(loaded);
      return loaded;
    }
  } catch (err) {
    console.error('Error loading organizations file:', err);
  }
  saveOrganizations(SEED_ORGANIZATIONS);
  return SEED_ORGANIZATIONS;
}

function saveOrganizations(orgs: Organization[]): void {
  try {
    fs.writeFileSync(ORGANIZATIONS_FILE, JSON.stringify(orgs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save organizations:', err);
  }
}

function loadProgrammes(): Programme[] {
  try {
    if (fs.existsSync(PROGRAMMES_FILE)) {
      const data = fs.readFileSync(PROGRAMMES_FILE, 'utf-8');
      const loaded: Programme[] = JSON.parse(data);
      let changed = false;
      for (const sp of SEED_PROGRAMMES) {
        if (!loaded.some((p) => p.id === sp.id)) {
          loaded.push(sp);
          changed = true;
        }
      }
      if (changed) saveProgrammes(loaded);
      return loaded;
    }
  } catch (err) {
    console.error('Error loading programmes file:', err);
  }
  saveProgrammes(SEED_PROGRAMMES);
  return SEED_PROGRAMMES;
}

function saveProgrammes(progs: Programme[]): void {
  try {
    fs.writeFileSync(PROGRAMMES_FILE, JSON.stringify(progs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save programmes:', err);
  }
}

// In-memory / file-backed state
let projects: Project[] = loadProjects();
let inventory: InventoryAsset[] = loadInventory();
let campaigns: GeneratedCampaign[] = loadCampaigns();
let organizations: Organization[] = loadOrganizations();
let programmes: Programme[] = loadProgrammes();

export const CREATIVE_STUDIO_MODELS = {
  IMAGE_MODEL: process.env.IMAGE_MODEL_ID || 'gemini-3.1-flash-lite-image',
  IMAGE_HIGH_QUALITY_MODEL: 'gemini-nano-banana-2.1',
  VIDEO_MODEL: 'gemini-omni-1.1-flash',
  MUSIC_MODEL: 'lyria-3-clip-preview',
  TRANSCRIBE_MODEL: 'gemini-3.5-transcribe',
  VOICE_BRIEFING_MODEL: 'gemini-3.8-flash-lite-tts',
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

// Helper to extract inline image data from Gemini candidates parts
export function extractImageFromResponse(response: any): string | null {
  const parts = response?.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      const mime = part.inlineData.mimeType || 'image/png';
      return `data:${mime};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

// Helper to resolve reference image for Nano Banana image-to-image / editing
export function resolveReferenceImage(imageUrl?: string | null): { data: string; mimeType: string } | null {
  if (!imageUrl || typeof imageUrl !== 'string') return null;

  // Case 1: Base64 Data URL (e.g., data:image/png;base64,...)
  const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      data: match[2],
    };
  }

  // Case 2: Local relative file path (e.g. /assets/images/...)
  const cleanPath = imageUrl.replace(/^\/+/, '');
  const candidatePaths = [
    path.join(__dirname, 'public', cleanPath),
    path.join(__dirname, 'src', cleanPath),
    path.join(__dirname, cleanPath),
  ];

  for (const cp of candidatePaths) {
    if (fs.existsSync(cp)) {
      try {
        const ext = path.extname(cp).toLowerCase();
        let mimeType = 'image/jpeg';
        if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.webp') mimeType = 'image/webp';
        else if (ext === '.svg') mimeType = 'image/svg+xml';

        const buffer = fs.readFileSync(cp);
        return {
          mimeType,
          data: buffer.toString('base64'),
        };
      } catch (err) {
        console.warn(`Failed reading reference image from ${cp}:`, err);
      }
    }
  }

  return null;
}

// Helper to format actionable image generation errors
export function formatImageGenerationError(err: unknown, model: string): { status: number; error: string; code: string; details?: string } {
  const errMsg = err instanceof Error ? err.message : String(err);
  const lower = errMsg.toLowerCase();

  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota') || lower.includes('rate limit')) {
    return {
      status: 429,
      error: `Google AI Studio API-Ratenlimit erreicht (429: Resource Exhausted) für Modell '${model}'. Bitte warten Sie einen Moment oder prüfen Sie Ihr Google AI Studio Kontingent.`,
      code: 'RATE_LIMIT_EXCEEDED',
      details: errMsg,
    };
  }

  if (lower.includes('api_key') || lower.includes('401') || lower.includes('unauthenticated') || lower.includes('permission_denied') || lower.includes('403')) {
    return {
      status: 401,
      error: `Google AI Studio Authentifizierungsfehler: Der konfigurierte GEMINI_API_KEY ist ungültig oder nicht für das Bildmodell '${model}' autorisiert.`,
      code: 'AUTH_ERROR',
      details: errMsg,
    };
  }

  return {
    status: 502,
    error: `Das konfigurierte Bildmodell '${model}' ist derzeit nicht verfügbar: ${errMsg}. Überprüfen Sie API-Verbindung und Modellberechtigungen.`,
    code: 'MODEL_UNAVAILABLE',
    details: errMsg,
  };
}

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// System Status & Storage Mode
app.get('/api/system/status', (req: Request, res: Response) => {
  const orgId = (req.headers['x-organization-id'] as string) || 'org_tefa';
  const org = organizations.find((o) => o.id === orgId) || organizations[0];
  res.json({
    status: 'online',
    appName: 'ImpactFlow – From Idea to Impact',
    platform: 'Universal NGO Project Lifecycle Platform',
    organization: org.name,
    organizationId: org.id,
    website: org.website,
    storageType: 'Persistent File Store (JSON database on server)',
    projectCount: projects.filter((p) => (p.organizationId || 'org_tefa') === org.id).length,
    totalProjectCount: projects.length,
    inventoryCount: inventory.length,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Organization & Programme Routes (Universal SaaS)
app.get('/api/organizations', (_req: Request, res: Response) => {
  res.json(organizations);
});

app.post('/api/organizations', (req: Request, res: Response) => {
  const org = req.body as Organization;
  if (!org.name) {
    return res.status(400).json({ error: 'Organization name is required' });
  }
  org.id = org.id || 'org_' + Date.now();
  org.createdAt = org.createdAt || new Date().toISOString();
  organizations.push(org);
  saveOrganizations(organizations);
  res.status(201).json(org);
});

app.put('/api/organizations/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const idx = organizations.findIndex((o) => o.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Organization not found' });
  }
  organizations[idx] = { ...organizations[idx], ...req.body, id };
  saveOrganizations(organizations);
  res.json(organizations[idx]);
});

app.get('/api/programmes', (req: Request, res: Response) => {
  const orgId = (req.headers['x-organization-id'] as string) || (req.query.orgId as string);
  if (orgId) {
    return res.json(programmes.filter((p) => p.organizationId === orgId));
  }
  res.json(programmes);
});

app.post('/api/programmes', (req: Request, res: Response) => {
  const prog = req.body as Programme;
  if (!prog.name) {
    return res.status(400).json({ error: 'Programme name is required' });
  }
  prog.id = prog.id || 'prog_' + Date.now();
  prog.createdAt = prog.createdAt || new Date().toISOString();
  programmes.push(prog);
  saveProgrammes(programmes);
  res.status(201).json(prog);
});

// Reset Demo Data
app.post('/api/projects/reset-demo', (_req: Request, res: Response) => {
  projects = JSON.parse(JSON.stringify(SEED_PROJECTS));
  inventory = JSON.parse(JSON.stringify(SEED_INVENTORY));
  organizations = JSON.parse(JSON.stringify(SEED_ORGANIZATIONS));
  programmes = JSON.parse(JSON.stringify(SEED_PROGRAMMES));
  saveProjects(projects);
  saveInventory(inventory);
  saveOrganizations(organizations);
  saveProgrammes(programmes);
  appendAuditLog({
    id: 'log_reset_' + Date.now(),
    timestamp: new Date().toISOString(),
    userId: 'system',
    userName: 'System Administrator',
    userRole: 'system_admin',
    action: 'DEMO_DATA_RESET',
    details: 'Reset projects, organizations and inventory to initial verified seed state.',
  });
  res.json({ success: true, message: 'Projects, organizations and inventory reset to default seed data.' });
});

// List all projects (optionally filtered by organization header)
app.get('/api/projects', (req: Request, res: Response) => {
  const orgId = (req.headers['x-organization-id'] as string) || (req.query.orgId as string);
  if (orgId) {
    const orgProjects = projects.filter((p) => (p.organizationId || 'org_tefa') === orgId);
    return res.json(orgProjects);
  }
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
  const orgId = newProj.organizationId || (req.headers['x-organization-id'] as string) || 'org_tefa';
  newProj.organizationId = orgId;

  // Generate reference ID if not provided
  if (!newProj.referenceId) {
    const year = new Date().getFullYear();
    const count = projects.length + 1;
    const prefix = orgId === 'org_tefa' ? 'TEFA' : orgId.replace('org_', '').toUpperCase().slice(0, 6);
    newProj.referenceId = `${prefix}-${year}-PRJ-${String(count).padStart(3, '0')}`;
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

// Delete project (Authorized team roles)
app.delete('/api/projects/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const userRole = (req.headers['x-user-role'] as string) || 'visitor';

  if (userRole === 'visitor' || userRole === 'project_reviewer') {
    return res.status(403).json({
      error: 'Forbidden: Visitors and external reviewers cannot delete projects.',
    });
  }

  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  const deleted = projects.splice(index, 1)[0];
  saveProjects(projects);

  appendAuditLog({
    id: 'log_del_' + Date.now(),
    timestamp: new Date().toISOString(),
    userId: (req.headers['x-user-id'] as string) || 'user',
    userName: (req.headers['x-user-name'] as string) || 'Authorized User',
    userRole: (userRole as UserRole) || 'board_member',
    action: 'PROJECT_DELETED',
    projectId: id,
    projectTitle: deleted.title,
    details: `Deleted project [${deleted.referenceId}]: ${deleted.title}`,
  });

  res.json({ success: true, deletedId: id, title: deleted.title });
});

// Clean Platform for Official Production Use (Removes demo/test projects)
app.post('/api/projects/clean-official', (req: Request, res: Response) => {
  const userRole = (req.headers['x-user-role'] as string) || 'visitor';
  if (userRole === 'visitor') {
    return res.status(403).json({ error: 'Forbidden: Visitors cannot clean platform data.' });
  }

  // Retain only non-demo and non-test projects
  projects = projects.filter((p) => !p.isDemoOrHypothetical && p.title.toLowerCase() !== 'test');

  // If TEFA has no projects left, initialize an official flagship project
  const tefaHasProj = projects.some((p) => (p.organizationId || 'org_tefa') === 'org_tefa');
  if (!tefaHasProj) {
    const officialTefaProject: Project = {
      id: 'proj_tefa_official_001',
      organizationId: 'org_tefa',
      programmeId: 'prog_tgiep',
      referenceId: 'TEFA-2026-OFFICIAL-001',
      title: 'TechEnergy For Africa – Offizielles Solar- & Digitalbildungsprogramm 2026',
      shortDescription: 'Offizielles Vorhaben von TechEnergy For Africa e.V. zur Realisierung nachhaltiger Solarinselsysteme und inklusiver IT-Schulungslabore für junge Menschen.',
      category: 'renewable_energy',
      country: 'Cameroon',
      locationDetails: 'Douala & Yaoundé, Kamerun / Berlin, Deutschland',
      lifecyclePhase: 'planning',
      status: 'Approved',
      isDemoOrHypothetical: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: (req.headers['x-user-name'] as string) || 'Dr. Frederic Pokam (TEFA Board Member)',
      proposal: {
        problemStatement: 'Mangel an verlässlicher Stromversorgung und digitaler Ausbildungsinfrastruktur in ländlichen und städtischen Ausbildungszentren in Kamerun.',
        targetBeneficiaries: 'Jugendliche, Auszubildende und Lehrkräfte (min. 50% weiblich)',
        beneficiaryCountPlanned: 120,
        proposedSolution: 'Aufbau von 2 solargestützten IT-Ausbildungslaboren mit 25 Rechnerarbeitsplätzen und zertifizierten Trainern vor Ort.',
        objectives: [
          'Inbetriebnahme von 2 Solar-Inselanlagen mit 10 kWp und Batteriespeichern.',
          'Ausbildung von 120 Teilnehmenden in digitalen Basiskompetenzen und Bürosoftware.',
          'Aufbau langfristiger Wartungsverträge mit lokalen Handwerksbetrieben.',
        ],
        expectedResults: [
          '100% autarke Stromversorgung während der Unterrichtszeiten.',
          'Zertifizierung von 120 Jugendlichen innerhalb von 12 Monaten.',
        ],
        activities: [
          'Standortbegutachtung und Partnervereinbarung (MoU).',
          'Beschaffung, Transport und zollfreie Einfuhr der Solarkomponenten.',
          'Installation und Sicherheitsprüfung.',
          'Curriculum-Entwicklung und Trainerausbildung.',
        ],
        durationMonths: 12,
        estimatedBudgetEUR: 50000,
        potentialPartners: ['Lokale Berufsbildungszentren Douala', 'GIZ / Deutsche Botschaft'],
        sustainabilityPlan: 'Eigenfinanzierung von Wartung und Betrieb über lokale Solardienstleistungen.',
        inclusionAccessibilityNeeds: 'Barrierefreie Zugangsrampen und barrierearme Schulungsunterlagen.',
        proposerName: (req.headers['x-user-name'] as string) || 'Dr. Frederic Pokam',
        proposerEmail: 'frederic.pokam@techenergyforafrica.org',
        submissionDate: new Date().toISOString().split('T')[0],
      },
      feasibilityChecks: [],
      decisions: [],
      milestones: [
        {
          id: 'm1',
          title: 'Offizieller Projektstart & Partnervereinbarungen',
          description: 'Abschluss der Kooperationsverträge mit lokalen Partnern in Douala.',
          phase: 'planning',
          targetDate: '2026-03-31',
          isCompleted: true,
          completedDate: '2026-03-25',
          deliverables: ['Unterzeichnetes MoU'],
          responsiblePerson: 'Marc Tagne',
        },
        {
          id: 'm2',
          title: 'Beschaffung & Verschiffung Solaranlagen',
          description: 'Solarmodule, Wechselrichter und Lithium-Batteriespeicher.',
          phase: 'planning',
          targetDate: '2026-06-30',
          isCompleted: false,
          deliverables: ['Zolldokumente & Lieferscheine'],
          responsiblePerson: 'Marc Tagne',
        },
      ],
      tasks: [],
      risks: [
        {
          id: 'r1',
          category: 'operational',
          description: 'Verzögerungen bei Zollabfertigung im Hafen von Douala.',
          impact: 'medium',
          probability: 'medium',
          mitigationStrategy: 'Frühzeitige Beantragung der Zollbefreiung über Ministerium.',
          status: 'active',
          responsiblePerson: 'Marc Tagne',
        },
      ],
      budgetItems: [
        {
          id: 'b1',
          category: 'Equipment & Hardware',
          description: 'Solar-PV-Anlagen, Inverter & 25 Schulungsrechner',
          plannedCost: 35000,
          approvedBudget: 35000,
          actualExpenditure: 0,
          committedCost: 0,
          currency: 'EUR',
        },
        {
          id: 'b2',
          category: 'Personnel',
          description: 'Ausbildungsleitung, Dozenten & Solartechniker',
          plannedCost: 15000,
          approvedBudget: 15000,
          actualExpenditure: 0,
          committedCost: 0,
          currency: 'EUR',
        },
      ],
      fundingSources: [
        {
          id: 'f1',
          name: 'TechEnergy For Africa e.V. Projektfond & Kofinanzierung',
          type: 'grant',
          amount: 50000,
          currency: 'EUR',
          status: 'confirmed',
          isRestricted: false,
        },
      ],
      transactions: [],
      impactIndicators: [
        {
          id: 'ind1',
          name: 'Anzahl ausgebildeter Jugendlicher',
          category: 'energy',
          definition: 'Jugendliche mit erfolgreichem Zertifikatsabschluss im Solar- & IT-Programm.',
          baseline: 0,
          target: 120,
          actual: 0,
          unit: 'Personen',
          reportingPeriod: '2026',
          evidenceSource: 'Teilnehmerlisten & Abschlussprüfungen',
          evidenceStatus: 'verified',
          responsiblePerson: 'Marc Tagne',
        },
      ],
      closure: {
        deliverablesAccepted: false,
        financialReconciliationDone: false,
        commitmentsReviewed: false,
        assetsHandedOver: false,
        finalPartnerReportReceived: false,
        lessonsLearnedDocumented: false,
        impactEvaluationComplete: false,
        donorReportingFinalized: false,
        boardApprovedClosure: false,
        archiveRetentionConfigured: false,
      },
      simulationParams: {
        beneficiariesCount: 120,
        trainersCount: 4,
        trainingDurationMonths: 12,
        usableWorkstations: 25,
        studentsPerWorkstation: 2,
        donatedHardwareCount: 10,
        hardwareUnitPurchaseCostEUR: 250,
        logisticsCustomsCostEUR: 2000,
        infrastructureSolarCostEUR: 12000,
        monthlyOperatingCostEUR: 500,
        accessibilityInterpreterCostEUR: 1500,
        maintenanceReservePct: 10,
        confirmedGrantsEUR: 50000,
        pendingGrantsEUR: 0,
      },
    };
    projects.unshift(officialTefaProject);
  }

  saveProjects(projects);

  appendAuditLog({
    id: 'log_clean_' + Date.now(),
    timestamp: new Date().toISOString(),
    userId: (req.headers['x-user-id'] as string) || 'user',
    userName: (req.headers['x-user-name'] as string) || 'Authorized User',
    userRole: (userRole as UserRole) || 'board_member',
    action: 'PLATFORM_CLEANED',
    details: 'Removed demo and test projects. Platform is configured for official production use.',
  });

  res.json({ success: true, message: 'Platform cleaned for official use.', projects });
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

// 4. Universal NGO Project Lifecycle AI Companion Chat (Gemini & ChatGPT Ready)
app.post('/api/ai/companion-chat', async (req: Request, res: Response) => {
  const {
    messages = [],
    query,
    projectContext,
    orgContext,
    provider = 'gemini',
    lang = 'de',
  } = req.body;

  const userQuery = query || (messages.length > 0 ? messages[messages.length - 1].content : '');

  if (!userQuery) {
    return res.status(400).json({ error: 'Query or messages are required' });
  }

  const projTitle = projectContext?.title || 'NGO Vorhaben';
  const projPhase = projectContext?.lifecyclePhase || 'proposal';
  const projStatus = projectContext?.status || 'Draft';
  const projRef = projectContext?.referenceId || 'PRJ-NEW';
  const projCountry = projectContext?.country || 'International';
  const plannedBudget = projectContext?.totalPlanned || 0;
  const confirmedFunding = projectContext?.confirmedFunding || 0;
  const fundingGap = projectContext?.fundingGap || 0;
  const beneficiaries = projectContext?.beneficiaries || 0;
  const orgName = orgContext?.name || 'TechEnergy For Africa e.V.';
  const orgCurrency = orgContext?.defaultCurrency || 'EUR';

  const systemPrompt = `
You are the Senior NGO Project Lifecycle Companion & Strategic In-App Guide inside the ImpactFlow platform.
You assist project leaders, coordinators, board members, and finance officers across international NGOs, associations, and social enterprises (including ${orgName}).

ACTIVE PROJECT CONTEXT:
- Organization: ${orgName} (${orgCurrency})
- Active Project: [${projRef}] "${projTitle}"
- Project Country / Location: ${projCountry}
- Current Lifecycle Phase: ${projPhase} (12-Phase Model: idea, proposal, feasibility, planning, approval, fundraising, implementation, monitoring, financial_accounting, evaluation, closure, impact_reporting)
- Project Status: ${projStatus}
- Planned Budget: ${plannedBudget} ${orgCurrency}
- Confirmed Financing: ${confirmedFunding} ${orgCurrency}
- Net Funding Gap: ${fundingGap} ${orgCurrency}
- Planned Beneficiaries: ${beneficiaries}

APPLICATION CAPABILITIES & IN-APP NAVIGATION:
You know how every part of the ImpactFlow web application works and guide users to use it accordingly.
Whenever you recommend an action or feature, ALWAYS include the matching clickable action token in your reply:
- [[nav:dashboard|Zur Projekt-Übersicht]]: Portfolio KPIs, Launch Countdown, and Governance status workflow.
- [[nav:proposal|Zum Antrags-Assistenten]]: Drafting problem statements, solutions, SMART objectives, and accessibility details.
- [[nav:advisor|Zum KI-Entscheidungsberater]]: AI SWOT analyses, weighted criteria matrices, and formal human decision records.
- [[nav:feasibility|Zur Machbarkeitsprüfung]]: 7-dimension risk & governance checklist (Technical, Financial, Legal, Partner, Environmental, Socio-cultural, Operational).
- [[nav:planning|Zur Planung (Gantt & Kanban)]]: Milestone scheduling, work package assignment, and deadline tracking.
- [[nav:budget|Zu Budget & Finanzierung]]: Cost item breakdown, approved vs planned budgets, and currency management.
- [[nav:simulator|Zum Finanzsimulator]]: Dynamic sliders for participants, computers, solar infrastructure, and scenario presets.
- [[nav:partners|Zu Partner & Fundraising]]: Donor relations, foundation pipelines, grant applications, and partner MoUs.
- [[nav:creative_studio|Zum Creative Studio]]: Generating campaign flyers, social media banners, and community outreach assets.
- [[nav:inventory|Zum IT- & Solar-Inventar]]: Equipment tracking, operational readiness status, serial numbers, and 3D Interactive Solar Lab.
- [[nav:monitoring|Zum Umsetzungs-Dashboard]]: Milestone execution tracking, status updates, and early-warning indicators.
- [[nav:finance|Zu Finanzen & Belegen]]: General ledger, transaction logging, receipt attachment, and official Verwendungsnachweis (VwN) draft.
- [[nav:impact|Zu Wirkung & KPI-Monitoring]]: Indicator evaluation, SDG alignment, and target vs. actual outcome measurement.
- [[nav:closure|Zum Projektabschluss]]: Formal 10-point closure checklist, asset handover, and final donor reporting.
- [[nav:audit|Zum Revisions-Audit-Trail]]: Revisionssicheres logging of all user activities and status approvals.
- [[action:export|Dossier exportieren]]: Exporting official donor dossiers and printable PDF summaries.
- [[action:new_project|Neues Projekt anlegen]]: Creating a new project proposal modal.
- [[action:profile|Benutzerprofil verwalten]]: Switching or creating custom user profiles.

GOVERNANCE & FOUR-EYES APPROVAL RULES:
- Proposers cannot self-approve their own proposals. Approvals must be made by a Board Member or Administrator.
- To approve a project, navigate to the Dashboard Governance box and click "Projekt formell genehmigen (Vorstand)".
- Role permissions: Board Member (full approvals), Project Manager (planning & implementation), Finance Officer (budget & receipts audit), Reviewer (inspection), Visitor (read-only without financial internals).

CORE DIRECTIVES:
1. Provide actionable, high-quality, professional guidance tailored to this project's current phase and context.
2. If the user asks how to use the app, explain the exact steps and buttons to click, including the relevant [[nav:...]] or [[action:...]] tokens.
3. Structure your reply cleanly using Markdown: bold headers, concise bullet points, and clear next steps.
4. Respond in the requested language: ${lang} (de = German, en = English, fr = French).
`;

  // Check if OpenAI provider requested and if OPENAI_API_KEY is available
  if ((provider === 'openai' || provider === 'chatgpt') && process.env.OPENAI_API_KEY) {
    try {
      const openAiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map((m: any) => ({
          role: m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      ];

      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: openAiMessages,
          temperature: 0.7,
        }),
      });

      if (openAiRes.ok) {
        const data = await openAiRes.json();
        const text = data.choices?.[0]?.message?.content || '';
        return res.json({
          success: true,
          provider: 'openai',
          model: 'gpt-4o-mini',
          reply: text,
        });
      }
    } catch (openAiErr) {
      console.warn('OpenAI call failed, falling back to Gemini:', openAiErr);
    }
  }

  // Primary Google Gemini Execution
  if (process.env.GEMINI_API_KEY) {
    try {
      const contents = [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUSER INQUIRY:\n${userQuery}` }],
        },
      ];

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 6500)
      );

      const response = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            temperature: 0.4,
          },
        }),
        timeoutPromise,
      ]);

      const replyText = response.text || '';
      return res.json({
        success: true,
        provider: provider === 'openai' || provider === 'chatgpt' ? 'openai-bridge-gemini' : 'gemini',
        model: 'gemini-3.8-flash',
        reply: replyText,
      });
    } catch (geminiErr: any) {
      console.error('Error generating AI Companion chat with Gemini:', geminiErr);
    }
  }

  // Structured Intent-Based Offline Fallback Engine (Reliable, app-aware NGO guidance)
  const queryLower = userQuery.toLowerCase();
  let offlineReply = '';

  const isAppHelp = queryLower.includes('wie nutze') || queryLower.includes('how to use') || queryLower.includes('comment utiliser') || queryLower.includes('anleitung') || queryLower.includes('hilfe');
  const isApprovalHelp = queryLower.includes('genehmig') || queryLower.includes('approve') || queryLower.includes('approbation') || queryLower.includes('freigabe');
  const isSimulatorHelp = queryLower.includes('simulator') || queryLower.includes('simulier');
  const isExportHelp = queryLower.includes('export') || queryLower.includes('dossier') || queryLower.includes('pdf') || queryLower.includes('druck');
  const isFinanceHelp = queryLower.includes('beleg') || queryLower.includes('receipt') || queryLower.includes('rechnung') || queryLower.includes('justificatif') || queryLower.includes('buchung');
  const isInventoryHelp = queryLower.includes('inventar') || queryLower.includes('hardware') || queryLower.includes('solar') || queryLower.includes('gerät');

  if (lang === 'fr') {
    if (isApprovalHelp) {
      offlineReply = `### Comment approuver ou modifier le statut d'un projet ?
1. **Rôle requis :** Seul un **Membre du Conseil (Board Member)** ou un **Administrateur** peut formellement approuver un projet.
2. **Règle des 4 yeux :** Le porteur du projet ne peut jamais approuver sa propre proposition.
3. **Procédure :**
   - Accédez à la **Vue générale & Portefeuille**.
   - Dans le bloc noir **Gouvernance & Workflow de statut**, cliquez sur le bouton vert **"Approuver formellement le projet"**.
   - Le statut passera à "Approved" et la phase active deviendra la planification.

[[nav:dashboard|Ouvrir la Vue générale]] [[nav:planning|Consulter la Planification]]`;
    } else if (isSimulatorHelp) {
      offlineReply = `### Comment utiliser le Simulateur Financier Interactif ?
1. Accédez au **Simulateur financier** via le menu latéral ou le lien ci-dessous.
2. Ajustez les curseurs interactifs (Nombre de participants, postes informatiques, formation, solaire).
3. Visualisez en temps réel le coût total, le coût par bénéficiaire et le déficit net.
4. Cliquez sur **"Enregistrer comme scénario actif"** pour mettre à jour automatiquement le budget de votre projet.

[[nav:simulator|Accéder au Simulateur financier]] [[nav:budget|Vérifier le Budget]]`;
    } else if (isExportHelp) {
      offlineReply = `### Comment exporter le Dossier de projet en PDF ?
1. Cliquez sur le bouton **"Dossier export"** dans l'en-tête supérieur ou ci-dessous.
2. Cochez les sections à inclure (Résumé exécutif, Tableau budgétaire, Jalons, Faisabilité).
3. Sélectionnez votre langue d'exportation (**Français**, **Anglais** ou **Allemand**).
4. Cliquez sur **"Drucken / PDF speichern"** pour générer un PDF professionnel aux normes des bailleurs de fonds.

[[action:export|Ouvrir la fenêtre d'export Dossier]]`;
    } else if (isAppHelp) {
      offlineReply = `### Guide d'utilisation d'ImpactFlow – De l'Idée à l'Impact
ImpactFlow vous permet de piloter l'ensemble du cycle de vie de votre ONG en 12 étapes :
- **1. Cadrage :** Rédigez vos objectifs dans le [[nav:proposal|Wizard de proposition]].
- **2. Décision & Faisabilité :** Évaluez les risques via la [[nav:feasibility|Liste de contrôle]].
- **3. Planification :** Définissez vos jalons dans la [[nav:planning|Planification (Gantt)]].
- **4. Budget & Financement :** Suivez vos financements dans [[nav:budget|Budget]] et simulez des scénarios avec le [[nav:simulator|Simulateur]].
- **5. Levée de fonds :** Gérez vos conventions bailleurs dans [[nav:partners|Partenaires & Fundraising]].
- **6. Exécution & Clôture :** Enregistrez vos factures dans [[nav:finance|Finances & Justificatifs]] et clôturez le projet dans [[nav:closure|Clôture]].

[[nav:dashboard|Tableau de bord]] [[action:export|Exporter le dossier]]`;
    } else {
      offlineReply = `### Recommandations méthodologiques pour "${projTitle}" (${projPhase})
- **Déficit budgétaire actuel :** ${fundingGap.toLocaleString()} ${orgCurrency} restant à financer sur un budget prévisionnel de ${plannedBudget.toLocaleString()} ${orgCurrency}.
- **Étape prioritaire (${projPhase}) :** Consolider la matrice de cadre logique (Logframe) et formaliser les accords de partenariat locaux.
- **Gouvernance & Conformité :** Veillez à respecter la règle des 4 yeux : le porteur de projet ne doit pas approuver lui-même sa demande de subvention.
- **Conseil bailleur :** Diversifiez les sources de cofinancement (fondations privées, coopération décentralisée, mécénat de compétences).

[[nav:proposal|Consulter la proposition]] [[nav:simulator|Simuler le budget]] [[action:export|Exporter le dossier]]`;
    }
  } else if (lang === 'en') {
    if (isApprovalHelp) {
      offlineReply = `### How to Approve or Transition Project Status?
1. **Required Role:** Only a **Board Member** or **System Administrator** has approval authority.
2. **Four-Eyes Governance:** The project proposer cannot approve their own application.
3. **Step-by-step:**
   - Go to the **Overview & Portfolio** dashboard.
   - Look for the dark **Governance & Status-Workflow** section.
   - Click the green button **"Formally Approve Project (Board)"**.
   - The status updates to "Approved" and unlocks implementation release.

[[nav:dashboard|Open Overview Dashboard]] [[nav:planning|Go to Planning]]`;
    } else if (isSimulatorHelp) {
      offlineReply = `### How to Use the Interactive Finance Simulator?
1. Open the **Finance Simulator** from the sidebar or using the button below.
2. Adjust the dynamic sliders (Beneficiaries, IT Workstations, Trainers, Solar Backup, Operating Costs).
3. The model instantly updates Total Cost, Cost per Student, and Net Funding Gap.
4. Click **"Save as Active Project Scenario"** to commit the numbers to your live project budget.

[[nav:simulator|Launch Finance Simulator]] [[nav:budget|View Project Budget]]`;
    } else if (isExportHelp) {
      offlineReply = `### How to Export Project Dossiers & Reports?
1. Click the **"Export"** button in the header or use the action below.
2. Select the report modules to include (Executive Summary, Budget Comparison, Milestone Timeline, Risk Matrix).
3. Choose your preferred report language (**English**, **German**, or **French**).
4. Click **"Print / Save PDF"** to produce an official donor dossier formatted with organization letterhead.

[[action:export|Open Dossier Export Window]]`;
    } else if (isAppHelp) {
      offlineReply = `### ImpactFlow Web Application User Guide
ImpactFlow guides non-profit teams through the complete 12-phase project lifecycle:
- **Phase 1-2 (Idea & Proposal):** Structure narrative in the [[nav:proposal|Proposal Wizard]] and compare options in [[nav:advisor|AI Tiebreaker]].
- **Phase 3-4 (Feasibility & Planning):** Verify criteria in [[nav:feasibility|Feasibility Checklist]] and schedule tasks in [[nav:planning|Gantt & Kanban Planning]].
- **Phase 5-6 (Budget & Simulation):** Manage budget lines in [[nav:budget|Budget]] and model scenarios in the [[nav:simulator|Finance Simulator]].
- **Phase 7-9 (Fundraising & Assets):** Track donors in [[nav:partners|Partners & Grants]] and hardware in [[nav:inventory|IT & Solar Inventory]].
- **Phase 10-12 (Execution to Impact):** Track progress in [[nav:monitoring|Execution Monitoring]], attach receipts in [[nav:finance|Finance]], and formalize evaluation in [[nav:closure|Project Closure]].

[[nav:dashboard|Back to Overview]] [[action:export|Export Project Dossier]]`;
    } else {
      offlineReply = `### Strategic Recommendations for "${projTitle}" (${projPhase})
- **Current Net Funding Gap:** ${fundingGap.toLocaleString()} ${orgCurrency} remaining to be funded out of ${plannedBudget.toLocaleString()} ${orgCurrency} total planned.
- **Immediate Priority (${projPhase}):** Align SMART milestones with the 12-phase project lifecycle and secure signed partner MoUs.
- **Governance & Four-Eyes Principle:** Ensure project proposers cannot self-approve their own budget applications.
- **Donor Readiness:** Prepare a concise Theory of Change and verified beneficiary counting criteria.

[[nav:proposal|Open Proposal Wizard]] [[nav:simulator|Test Scenarios]] [[action:export|Export Dossier]]`;
    }
  } else {
    // German (default)
    if (isApprovalHelp) {
      offlineReply = `### Wie funktioniert die formelle Projektgenehmigung?
1. **Benötigte Rolle:** Nur ein **Vorstandsmitglied (Board Member)** oder ein **Systemadministrator** ist berechtigt, Projekte formell zu genehmigen.
2. **Vier-Augen-Prinzip:** Ein Antragsteller darf seinen eigenen Antrag niemals selbst genehmigen!
3. **So gehen Sie vor:**
   - Wechseln Sie im Header zur Rolle **Vorstandsmitglied** (falls berechtigt).
   - Öffnen Sie die **Projekt-Übersicht**.
   - Im dunklen Kasten **"Governance & Status-Workflow"** finden Sie den grünen Button **"Projekt formell genehmigen (Vorstand)"**.
   - Nach Klick wechselt der Status auf *Approved* und gibt das Projekt für die Umsetzung frei.

[[nav:dashboard|Zur Projekt-Übersicht springen]] [[nav:planning|Zum Meilensteinplan]]`;
    } else if (isSimulatorHelp) {
      offlineReply = `### Wie funktioniert der interaktive Finanzsimulator?
1. Öffnen Sie das Modul **Finanzsimulator** über die Seitenleiste oder den Button unten.
2. Passen Sie die Schieberegler an:
   - Anzahl Teilnehmende / Begünstigte
   - IT-Arbeitsplätze & Hardware-Spenden
   - Ausbildungsdauer & monatliche Betriebskosten
   - Solaranlage & Inklusionsdolmetscher
3. Die Kennzahlen für **Gesamtkosten**, **Kosten pro Person** und **Netto-Finanzierungslücke** berechnen sich in Echtzeit.
4. Klicken Sie auf **"Als aktives Projektszenario speichern"**, um die simulierten Werte direkt in das Projektbudget zu übernehmen.

[[nav:simulator|Zum Finanzsimulator springen]] [[nav:budget|Zu Budget & Finanzierung]]`;
    } else if (isExportHelp) {
      offlineReply = `### Wie erstelle und exportiere ich ein Projekt-Dossier?
1. Klicken Sie oben im Header auf **Exportieren** oder nutzen Sie den Schnelllink unten.
2. Wählen Sie die gewünschten Abschnitte:
   - *Executive Summary & Deckblatt*
   - *Budget vs. Ist-Kosten Analyse*
   - *Meilenstein- und Terminplan*
   - *Machbarkeits- und Risikobericht*
3. Wählen Sie die Zielsprache (**Deutsch**, **Englisch** oder **Französisch**).
4. Klicken Sie auf **Drucken / PDF speichern**, um ein revisionssicheres Stiftungsdossier mit offiziellem Briefkopf zu erzeugen.

[[action:export|Dossier-Exportfenster öffnen]]`;
    } else if (isFinanceHelp) {
      offlineReply = `### Wie erfasse ich Ausgaben und Belege?
1. Öffnen Sie das Modul **Finanzen & Belegprüfung** über die Navigation.
2. Klicken Sie auf **"Ausgabe / Einnahme erfassen"**.
3. Geben Sie Betrag, Datum, Budgetkategorie und Währung (EUR / XAF) ein.
4. Fügen Sie Belegnummer und Beschreibung für den Verwendungsnachweis (VwN) hinzu.
5. Die Ausgaben fließen automatisch in den Soll-Ist-Vergleich und die Liquiditätsabstimmung ein.

[[nav:finance|Zu Finanzen & Belegprüfung springen]] [[nav:budget|Zum Budget]]`;
    } else if (isInventoryHelp) {
      offlineReply = `### Wo finde ich das IT- & Solarinventar?
1. Öffnen Sie das Modul **IT- & Anlagen-Inventar** in der Seitenleiste.
2. Hier verwalten Sie:
   - Einsatzbereite Laptops und Schulungsrechner mit Seriennummern und Standort.
   - Solarmodule, Wechselrichter und Batteriespeicher.
   - Das interaktive **3D Solar Lab** zur Visualisierung der Energieversorgung.
3. Nur verifizierte Geräte werden im Reifegrad-Radar als einsatzbereit gewertet.

[[nav:inventory|Zum IT- & Anlagen-Inventar springen]] [[nav:dashboard|Zum Dashboard]]`;
    } else if (isAppHelp) {
      offlineReply = `### Benutzerleitfaden: So nutzen Sie ImpactFlow optimal
ImpactFlow begleitet Sie über den gesamten 12-Phasen-Lebenszyklus:
- **1. Ideen & Anträge:** Formulieren Sie Problemstellung und SMART-Ziele im [[nav:proposal|Antrags-Assistenten]].
- **2. Machbarkeit & Risiken:** Prüfen Sie alle 7 Dimensionen in der [[nav:feasibility|Machbarkeitsprüfung]].
- **3. Planung & Meilensteine:** Strukturieren Sie Aufgaben im [[nav:planning|Gantt- & Kanban-Planer]].
- **4. Budget & Simulation:** Planen Sie Kostenstellen in [[nav:budget|Budget]] und testen Sie Szenarien im [[nav:simulator|Finanzsimulator]].
- **5. Partner & Spenden:** Verwalten Sie Förderstiftungen in [[nav:partners|Partner & Fundraising]].
- **6. Finanzen & Abschluss:** Buchen Sie Belege in [[nav:finance|Finanzbuchhaltung]] und schließen Sie das Projekt formal in [[nav:closure|Projektabschluss]] ab.

[[nav:dashboard|Zurück zur Übersicht]] [[action:export|Projekt-Dossier drucken]]`;
    } else {
      offlineReply = `### Strategische Handlungsempfehlungen für "${projTitle}" (Phase: ${projPhase})
- **Finanzierungsstatus:** Aktuell offene Lücke von € ${fundingGap.toLocaleString()} bei einem Gesamtbudget von € ${plannedBudget.toLocaleString()}.
- **Dringende Maßnahmen für Phase ${projPhase}:**
  1. **Antragsschärfung:** SMART-Ziele mit klaren Wirkungsindikatoren (z.B. ${beneficiaries} Teilnehmende) hinterlegen.
  2. **Machbarkeits-Prüfung:** Nachweise für Zollfreistellungen und Solarkapazitäten vor Ort einholen.
  3. **Governance-Regel:** Das Vier-Augen-Prinzip strikt einhalten – Anträge dürfen nur durch den Vorstand oder bevollmächtigte Reviewer freigegeben werden.
  4. **Fördermittel-Pipeline:** Parallelanträge bei Stiftungen und Kofinanzierungspartnern einreichen, um das Risiko abzufedern.

[[nav:proposal|Zum Antrags-Assistenten]] [[nav:simulator|Zum Finanzsimulator]] [[action:export|Dossier exportieren]]`;
    }
  }

  res.json({
    success: true,
    provider: 'offline-intelligence',
    model: 'ngo-lifecycle-rulebook',
    reply: offlineReply,
    isOffline: true,
  });
});

// -------------------------------------------------------------
// TEFA PROJECT INTELLIGENCE – INTERACTIVE ANALYTICS & ASSISTANT
// -------------------------------------------------------------

app.post('/api/intelligence/assistant', async (req: Request, res: Response) => {
  try {
    const { query, lang = 'de', filters = {}, conversationHistory = [], modelId = 'gemini-3.8-flash', useSearch = false, useMaps = false } = req.body;
    const userRole = (req.headers['x-user-role'] as string) || 'visitor';
    const isVisitor = userRole === 'visitor';

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    // Model selection validation
    const allowedModels = ['gemini-4-argon', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];
    const selectedModel = allowedModels.includes(modelId) ? modelId : 'gemini-3.8-flash';

    // Filter projects based on active filters
    let filteredProjects = [...projects];
    if (filters.projectId && filters.projectId !== 'all') {
      filteredProjects = filteredProjects.filter((p) => p.id === filters.projectId);
    }
    if (filters.country && filters.country !== 'all') {
      filteredProjects = filteredProjects.filter((p) => p.country === filters.country);
    }
    if (filters.category && filters.category !== 'all') {
      filteredProjects = filteredProjects.filter((p) => p.category === filters.category);
    }
    if (filters.status && filters.status !== 'all') {
      filteredProjects = filteredProjects.filter((p) => p.status === filters.status);
    }
    if (filters.environment === 'live') {
      filteredProjects = filteredProjects.filter((p) => !p.isDemoOrHypothetical);
    } else if (filters.environment === 'demo') {
      filteredProjects = filteredProjects.filter((p) => p.isDemoOrHypothetical);
    }

    // Build grounded facts
    const today = new Date().toISOString().split('T')[0];
    const projectSummaries = filteredProjects.map((p) => {
      const totalBudget = p.budgetItems?.reduce((sum, b) => sum + (b.approvedBudget || b.plannedCost || 0), 0) || p.proposal?.estimatedBudgetEUR || 0;
      const confirmedFunding = p.fundingSources?.filter((f) => f.status === 'confirmed').reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / 655.957) : f.amount), 0) || 0;
      const pendingFunding = p.fundingSources?.filter((f) => f.status === 'pending_application').reduce((sum, f) => sum + (f.currency === 'XAF' ? Math.round(f.amount / 655.957) : f.amount), 0) || 0;
      const actualSpend = p.budgetItems?.reduce((sum, b) => sum + (b.actualExpenditure || 0), 0) || 0;
      const fundingGap = Math.max(0, totalBudget - confirmedFunding);
      const overdueMilestones = p.milestones?.filter((m) => !m.isCompleted && m.targetDate < today) || [];
      const openHighRisks = p.risks?.filter((r) => r.status === 'active' && (r.impact === 'high' || r.probability === 'high')) || [];
      const verifiedBeneficiaries = p.impactIndicators?.filter((i) => i.evidenceStatus === 'verified').reduce((sum, i) => sum + (i.actual || 0), 0);
      const missingReceipts = p.transactions?.filter((t) => t.type === 'expense' && !t.receiptAttached) || [];

      return {
        id: p.id,
        referenceId: p.referenceId,
        title: p.title,
        country: p.country,
        category: p.category,
        status: p.status,
        phase: p.lifecyclePhase,
        isDemoOrHypothetical: p.isDemoOrHypothetical,
        totalBudgetEUR: totalBudget,
        confirmedFundingEUR: confirmedFunding,
        pendingFundingEUR: pendingFunding,
        fundingGapEUR: fundingGap,
        actualSpendEUR: actualSpend,
        overdueMilestonesCount: overdueMilestones.length,
        overdueMilestoneTitles: overdueMilestones.map((m) => `${m.title} (Fällig: ${m.targetDate})`),
        openHighRisksCount: openHighRisks.length,
        openHighRiskTitles: openHighRisks.map((r) => `${r.title || r.category}: ${r.description}`),
        verifiedBeneficiaries: verifiedBeneficiaries,
        missingReceiptsCount: isVisitor ? 0 : missingReceipts.length,
      };
    });

    // Check inventory status
    const liveAssets = inventory.filter((i) => i.environment === 'live');
    const operationalLive = liveAssets.filter((i) => i.donationStatus === 'approved_for_use').length;
    const pendingInspection = liveAssets.filter((i) => i.donationStatus === 'inspected' || i.donationStatus === 'arrived').length;
    const inTransit = liveAssets.filter((i) => i.donationStatus === 'in_transit' || i.donationStatus === 'customs_processing').length;

    // Call Gemini if API key available
    if (process.env.GEMINI_API_KEY) {
      // Build conversation turns if provided
      const historyContext = conversationHistory.length > 0
        ? `\nPREVIOUS CONVERSATION HISTORY:\n${conversationHistory.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')}\n`
        : '';

      const prompt = `
You are the Senior Business Intelligence and Financial Controlling Assistant for TechEnergy For Africa e.V. (TEFA).
Answer the user's question with complete accuracy based on the provided project records and inventory data.

User Question: "${query}"
Language: ${lang}
User Role: ${userRole}
${historyContext}
GROUND TRUTH DATA (Strictly verified):
Projects in current filter (${projectSummaries.length}):
${JSON.stringify(projectSummaries, null, 2)}

Live Hardware Inventory Summary:
Total live assets: ${liveAssets.length}, Approved operational: ${operationalLive}, Pending inspection/arrival: ${pendingInspection}, In transit/customs: ${inTransit}

CRITICAL RULES:
1. Provide a direct, factual answer.
2. CITE specific project Reference IDs in your text using "[Ref: TEFA-2026-...]" whenever referring to a project.
3. STRICTLY SEPARATE:
   - "facts": Exact quantitative and verified facts directly observable in the dataset.
   - "recommendations": Professional recommendations, next actions, and controlling advice.
4. FINANCES RULE: Never confuse pending grants with confirmed funding! Pending grants are NOT secured funding.
5. BENEFICIARIES RULE: Never invent beneficiary numbers. If unverified or planning phase, explicitly mention that.
6. "dataLimitations": Explicitly state any limitations (e.g. if IFOPSIM is in planning phase, if receipts are pending verification, or if fictional demo data is present).
7. Return ONLY valid JSON with keys:
   {
     "answer": "Comprehensive answer text in markdown format with clear headings and citations",
     "facts": ["Fact 1 with numbers and project ref", "Fact 2..."],
     "recommendations": ["Recommendation 1...", "Recommendation 2..."],
     "references": [{"id": "...", "referenceId": "...", "title": "...", "metric": "..."}],
     "dataLimitations": ["Limitation 1..."]
   }
`;

      const tools: any[] = [];
      if (useMaps) {
        // googleMaps grounding
        tools.push({ googleMaps: {} });
      } else if (useSearch) {
        // googleSearch grounding
        tools.push({ googleSearch: {} });
      }

      const requestConfig: any = {
        responseMimeType: 'application/json',
      };
      if (tools.length > 0) {
        requestConfig.tools = tools;
      }

      const aiResponse = await ai.models.generateContent({
        model: selectedModel,
        contents: prompt,
        config: requestConfig,
      });

      const parsed = JSON.parse(aiResponse.text || '{}');
      const grounding = aiResponse.candidates?.[0]?.groundingMetadata;

      return res.json({
        success: true,
        ...parsed,
        modelUsed: selectedModel,
        grounding: grounding ? {
          webSearchQueries: grounding.webSearchQueries,
          groundingChunks: grounding.groundingChunks?.slice(0, 3),
        } : null,
      });
    }

    // Deterministic Rule-Based Fallback when offline / without Gemini API Key
    const qLower = query.toLowerCase();
    const references: any[] = [];
    const facts: string[] = [];
    const recommendations: string[] = [];
    const dataLimitations: string[] = [];

    let answer = '';

    if (qLower.includes('attention') || qLower.includes('aufmerksamkeit') || qLower.includes('handlungsbedarf') || qLower.includes('board') || qLower.includes('vorstand')) {
      const needingAttention = projectSummaries.filter(
        (p) => p.status === 'Under Review' || p.overdueMilestonesCount > 0 || p.openHighRisksCount > 0 || p.missingReceiptsCount > 0
      );
      answer = `### Projekte mit unmittelbarem Steuerungs- & Managementbedarf\n\nBasierend auf den aktuellen Portfoliodaten erfordern **${needingAttention.length}** Projekte die Aufmerksamkeit des Vorstands bzw. der Projektleitung:\n\n`;
      needingAttention.forEach((p) => {
        const issues: string[] = [];
        if (p.status === 'Under Review') issues.push('Status: In Begutachtung (Freigabe ausstehend)');
        if (p.overdueMilestonesCount > 0) issues.push(`${p.overdueMilestonesCount} überfällige Meilensteine`);
        if (p.openHighRisksCount > 0) issues.push(`${p.openHighRisksCount} offene Hochrisiken`);
        if (p.missingReceiptsCount > 0) issues.push(`${p.missingReceiptsCount} Ausgaben ohne Beleg`);
        answer += `- **${p.title}** ([Ref: ${p.referenceId}]): ${issues.join('; ')}\n`;
        facts.push(`${p.title} (${p.referenceId}): ${issues.join(', ')}`);
        references.push({ id: p.id, referenceId: p.referenceId, title: p.title, metric: issues.join(' | ') });
      });
      recommendations.push('Vorstandssitzung zur formalen Beschlussfassung von anstehenden Freigaben und Meilenstein-Anpassungen anberaumen.');
      recommendations.push('Risikominderungspläne für technische und regulatorische Hochrisiken gemeinsam mit den Länderkoordinatoren prüfen.');
      dataLimitations.push('Planungs- und Demo-Datensätze (z.B. IFOPSIM) enthalten hypothetische Annahmen und stellen keine realen Zahlungsverpflichtungen dar.');
    } else if (qLower.includes('finanzierungslücke') || qLower.includes('gap') || qLower.includes('funding') || qLower.includes('budget') || qLower.includes('finanz')) {
      const sortedByGap = [...projectSummaries].sort((a, b) => b.fundingGapEUR - a.fundingGapEUR);
      const topGap = sortedByGap[0];
      answer = `### Analyse der Fördermittellücke im Projektportfolio\n\nDas Projekt mit der größten bestätigten Finanzierungslücke ist **${topGap?.title || 'Keines'}** ([Ref: ${topGap?.referenceId}]).\n\n`;
      sortedByGap.forEach((p) => {
        answer += `- **${p.title}** ([Ref: ${p.referenceId}]): Genehmigtes/Geplantes Budget: **${p.totalBudgetEUR.toLocaleString('de-DE')} €**, Bestätigt: **${p.confirmedFundingEUR.toLocaleString('de-DE')} €**, Offene Lücke: **${p.fundingGapEUR.toLocaleString('de-DE')} €** (Beantragt/Offen: ${p.pendingFundingEUR.toLocaleString('de-DE')} €)\n`;
        facts.push(`${p.title} (${p.referenceId}): Budget ${p.totalBudgetEUR.toLocaleString()} €, Bestätigt ${p.confirmedFundingEUR.toLocaleString()} €, Lücke ${p.fundingGapEUR.toLocaleString()} €`);
        references.push({ id: p.id, referenceId: p.referenceId, title: p.title, metric: `Lücke: ${p.fundingGapEUR.toLocaleString('de-DE')} €` });
      });
      recommendations.push('Beantragte Fördermittel (z.B. Stiftungsanträge) engmaschig nachfassen; keine Verträge vor formalem Förderbescheid schließen.');
      recommendations.push('Eigenmittel-Reserven und Kofinanzierungszusagen auf Währungsschwankungen (EUR/XAF Peg) absichern.');
      dataLimitations.push('Beantragte Förderanträge werden gemäß TEFA-Governance-Regeln strikt NICHT als bestätigte Deckung gewertet.');
    } else if (qLower.includes('meilenstein') || qLower.includes('milestone') || qLower.includes('überfällig') || qLower.includes('overdue')) {
      const withOverdue = projectSummaries.filter((p) => p.overdueMilestonesCount > 0);
      answer = `### Status überfälliger Meilensteine\n\nIm gefilterten Portfolio weisen **${withOverdue.length}** Projekte Terminverzögerungen auf:\n\n`;
      withOverdue.forEach((p) => {
        answer += `- **${p.title}** ([Ref: ${p.referenceId}]): ${p.overdueMilestoneTitles.join(', ')}\n`;
        facts.push(`${p.title} (${p.referenceId}): ${p.overdueMilestonesCount} überfällige Meilensteine (${p.overdueMilestoneTitles.join('; ')})`);
        references.push({ id: p.id, referenceId: p.referenceId, title: p.title, metric: `${p.overdueMilestonesCount} überfällig` });
      });
      recommendations.push('Projektzeitpläne mit den lokalen Partnern vor Ort nachjustieren und Pufferzeiten für Zoll- und Einfuhrgenehmigungen einplanen.');
      dataLimitations.push('Meilenstein-Fortschritte basieren auf den zuletzt im System gepflegten Statusberichten.');
    } else if (qLower.includes('beleg') || qLower.includes('receipt') || qLower.includes('nachweis') || qLower.includes('unreconciled')) {
      const withMissingReceipts = projectSummaries.filter((p) => p.missingReceiptsCount > 0);
      answer = `### Belegprüfung & Verwendungsnachweis-Audit\n\nEs wurden Buchungen ohne archivierte Originalbelege identifiziert:\n\n`;
      if (withMissingReceipts.length === 0) {
        answer += `Aktuell liegen für alle verbuchten Finanztransaktionen im geprüften Bereich die erforderlichen Belegnachweise vor.\n`;
        facts.push('Alle verbuchten Ausgaben im aktuellen Filter verfügen über Belegnachweise.');
      } else {
        withMissingReceipts.forEach((p) => {
          answer += `- **${p.title}** ([Ref: ${p.referenceId}]): **${p.missingReceiptsCount}** Ausgabenposten ohne Belegdatei.\n`;
          facts.push(`${p.title}: ${p.missingReceiptsCount} unvollständige Belege.`);
          references.push({ id: p.id, referenceId: p.referenceId, title: p.title, metric: `${p.missingReceiptsCount} Belege fehlen` });
        });
      }
      recommendations.push('Fehlende Originalquittungen und Bankbelege vor Abschluss des Quartalsberichts bei den Länderbeauftragten anfordern.');
      dataLimitations.push('Sensible Zahlungsempfängerdaten sind für nicht-autorisierte Rollen maskiert.');
    } else {
      answer = `### Portfolio-Zusammenfassung TEFA Project Intelligence\n\nDas gefilterte Portfolio umfasst **${filteredProjects.length}** Vorhaben. Gesamtes genehmigtes/geplantes Budget: **${projectSummaries.reduce((s, p) => s + p.totalBudgetEUR, 0).toLocaleString('de-DE')} €**, davon bestätigt finanziert: **${projectSummaries.reduce((s, p) => s + p.confirmedFundingEUR, 0).toLocaleString('de-DE')} €** (Offene Gesamtlücke: **${projectSummaries.reduce((s, p) => s + p.fundingGapEUR, 0).toLocaleString('de-DE')} €**).\n\n`;
      projectSummaries.forEach((p) => {
        answer += `- **${p.title}** ([Ref: ${p.referenceId}]): Phase *${p.phase}*, Status *${p.status}*, Budget: ${p.totalBudgetEUR.toLocaleString('de-DE')} €.\n`;
        facts.push(`${p.title} (${p.referenceId}): Status ${p.status}, Budget ${p.totalBudgetEUR.toLocaleString()} €.`);
        references.push({ id: p.id, referenceId: p.referenceId, title: p.title, metric: `Status: ${p.status}` });
      });
      recommendations.push('Regelmäßige Status-Reviews mit den operativen Projektleitern durchführen.');
      dataLimitations.push('Daten spiegeln den aktuellen Stand der TEFA-Datenbank wider.');
    }

    res.json({
      success: true,
      answer,
      facts,
      recommendations,
      references,
      dataLimitations,
    });
  } catch (err: unknown) {
    console.error('Error in Project Intelligence assistant:', err);
    res.status(500).json({
      error: 'Intelligence assistant failed',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// -------------------------------------------------------------
// AUDIO TRANSCRIPTION & EXECUTIVE VOICE BRIEFING ENDPOINTS
// -------------------------------------------------------------

// Audio Dictation & Meeting Transcription (Gemini 3.5 Transcribe)
app.post('/api/ai/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'audioData (base64) ist erforderlich' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        text: 'Welche Projekte weisen die größte bestätigte Finanzierungslücke auf?',
        isFallback: true,
      });
    }

    const cleanBase64 = audioData.replace(/^data:audio\/[^;]+;base64,/, '');

    const response = await ai.models.generateContent({
      model: CREATIVE_STUDIO_MODELS.TRANSCRIBE_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: 'Transkribiere diese Audioaufnahme exakt auf Deutsch. Gib ausschließlich den transkribierten Text ohne Anführungszeichen zurück.',
          },
        ],
      },
    });

    const text = response.text?.trim() || '';
    res.json({ success: true, text, modelUsed: CREATIVE_STUDIO_MODELS.TRANSCRIBE_MODEL });
  } catch (err: unknown) {
    console.error('Transcription error:', err);
    res.status(500).json({
      error: 'Audio-Transkription fehlgeschlagen',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// Executive Spoken Voice Briefing (Gemini 3.8 Flash Lite TTS)
app.post('/api/ai/live-briefing', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    const briefingText =
      text ||
      'Guten Tag. Hier ist das aktuelle TEFA Executive Portfolio-Briefing. Für das Vorhaben IFOPSIM in Kamerun ist die Vorstandsfreigabe sowie die Belegprüfung ausstehend. Alle übrigen Meilensteine liegen im Plan.';

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: true,
        isFallback: true,
        message: 'Sprachausgabe im Simulationsmodus (GEMINI_API_KEY nicht gesetzt).',
      });
    }

    const response = await ai.models.generateContent({
      model: CREATIVE_STUDIO_MODELS.VOICE_BRIEFING_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: briefingText,
              speechMetadata: {
                style: 'Clear, authoritative, warm nonprofit executive leadership tone',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        success: true,
        audioData: `data:audio/wav;base64,${base64Audio}`,
        mimeType: 'audio/wav',
        modelUsed: CREATIVE_STUDIO_MODELS.VOICE_BRIEFING_MODEL,
      });
    }

    res.status(502).json({ error: 'Keine Audiodaten generiert' });
  } catch (err: unknown) {
    console.error('Voice briefing error:', err);
    res.status(500).json({
      error: 'Voice Briefing fehlgeschlagen',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// -------------------------------------------------------------
// CREATIVE VIDEO, MUSIC & NANO BANANA EDITING ENDPOINTS
// -------------------------------------------------------------

// Video Generation & Animation (Gemini Omni Flash 1.1 via Interactions API)
app.post('/api/creative-studio/generate-video', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '16:9', imageBase64 } = req.body;
    const model = CREATIVE_STUDIO_MODELS.VIDEO_MODEL;
    const targetRatio = (aspectRatio === '9:16' ? '9:16' : '16:9') as '16:9' | '9:16';

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt oder Bild ist erforderlich für Videogenerierung' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(401).json({
        error: 'Google AI Studio API-Schlüssel nicht konfiguriert (GEMINI_API_KEY fehlt).',
        code: 'MISSING_API_KEY',
      });
    }

    let inputPayload: any;
    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');
      inputPayload = [
        {
          type: 'image',
          mime_type: 'image/png',
          data: cleanBase64,
        },
        {
          type: 'text',
          text:
            prompt ||
            'Gentle cinematic motion, natural lighting, modern high quality footage of renewable energy and vocational education in Africa.',
        },
      ];
    } else {
      inputPayload = prompt;
    }

    const interaction = await ai.interactions.create(
      {
        model,
        input: inputPayload,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: targetRatio,
          duration: '5s',
          resolution: '720p',
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      return res.json({
        success: true,
        videoUrl: `data:${videoPart.mime_type || 'video/mp4'};base64,${videoPart.data}`,
        mimeType: videoPart.mime_type || 'video/mp4',
        modelUsed: model,
        aspectRatio: targetRatio,
      });
    }

    res.status(502).json({ error: 'Keine Videodaten vom Modell zurückgegeben' });
  } catch (err: unknown) {
    console.error('Video generation error:', err);
    res.status(500).json({
      error: 'Videogenerierung fehlgeschlagen',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// Campaign Audio / Soundtrack Generation (Lyria Clip 3 Preview)
app.post('/api/creative-studio/generate-music', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    const model = CREATIVE_STUDIO_MODELS.MUSIC_MODEL;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(401).json({
        error: 'Google AI Studio API-Schlüssel nicht konfiguriert (GEMINI_API_KEY fehlt).',
        code: 'MISSING_API_KEY',
      });
    }

    const musicPrompt =
      prompt ||
      'Uplifting acoustic rhythms blended with modern cinematic ambient warmth, inspiring and optimistic for renewable energy and education.';

    const responseStream = await ai.models.generateContentStream({
      model,
      contents: musicPrompt,
    });

    let audioBase64 = '';
    let lyrics = '';
    let mimeType = 'audio/wav';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (!audioBase64 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioBase64 += part.inlineData.data;
        }
        if (part.text && !lyrics) {
          lyrics = part.text;
        }
      }
    }

    if (audioBase64) {
      return res.json({
        success: true,
        audioUrl: `data:${mimeType};base64,${audioBase64}`,
        mimeType,
        lyrics,
        modelUsed: model,
      });
    }

    res.status(502).json({ error: 'Keine Musik-Audiodaten generiert' });
  } catch (err: unknown) {
    console.error('Music generation error:', err);
    res.status(500).json({
      error: 'Musikgenerierung fehlgeschlagen',
      details: err instanceof Error ? err.message : String(err),
    });
  }
});

// High-Resolution Image Editing & Refinement (Nano Banana 2.1)
app.post('/api/creative-studio/edit-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, instruction, aspectRatio = '1:1' } = req.body;
    const model = CREATIVE_STUDIO_MODELS.IMAGE_HIGH_QUALITY_MODEL;

    if (!imageBase64 || !instruction) {
      return res.status(400).json({ error: 'imageBase64 und Bearbeitungsanweisung (instruction) sind erforderlich' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(401).json({
        error: 'Google AI Studio API-Schlüssel nicht konfiguriert (GEMINI_API_KEY fehlt).',
        code: 'MISSING_API_KEY',
      });
    }

    const refImage = resolveReferenceImage(imageBase64);
    if (!refImage) {
      return res.status(400).json({ error: 'Referenzbild konnte nicht verarbeitet werden' });
    }

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: refImage.data,
              mimeType: refImage.mimeType,
            },
          },
          {
            text: `Edit and refine this image based on the following instruction: ${instruction}. Maintain consistent photographic quality, professional lighting, and realistic nonprofit branding. STRICT: No human faces or persons unless explicitly stated.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '1:1') as any,
          imageSize: '1K',
        },
      },
    });

    const editedImage = extractImageFromResponse(response);
    if (editedImage) {
      return res.json({
        success: true,
        imageUrl: editedImage,
        modelUsed: model,
        instruction,
      });
    }

    res.status(502).json({ error: 'Keine Bilddaten nach Bearbeitung zurückgegeben' });
  } catch (err: unknown) {
    console.error('Image edit error:', err);
    const formatted = formatImageGenerationError(err, CREATIVE_STUDIO_MODELS.IMAGE_HIGH_QUALITY_MODEL);
    return res.status(formatted.status).json(formatted);
  }
});

// Import validation endpoint
app.post('/api/intelligence/import-validate', (req: Request, res: Response) => {
  try {
    const { rows = [] } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Rows array is required and must not be empty.' });
    }

    const errors: { row: number; field: string; message: string }[] = [];
    const warnings: { row: number; field: string; message: string }[] = [];
    const validRows: any[] = [];

    const existingRefs = new Set(projects.map((p) => p.referenceId.toLowerCase()));
    const existingTitles = new Set(projects.map((p) => p.title.toLowerCase()));

    rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      let isValid = true;

      if (!row.title || typeof row.title !== 'string' || row.title.trim().length < 3) {
        errors.push({ row: rowNum, field: 'title', message: 'Titel ist erforderlich (mindestens 3 Zeichen).' });
        isValid = false;
      }

      if (row.title && existingTitles.has(row.title.trim().toLowerCase())) {
        warnings.push({ row: rowNum, field: 'title', message: `Mögliches Duplikat: Titel '${row.title}' existiert bereits.` });
      }

      if (row.referenceId && existingRefs.has(row.referenceId.trim().toLowerCase())) {
        warnings.push({ row: rowNum, field: 'referenceId', message: `Referenz-ID '${row.referenceId}' existiert bereits und wird bei Import aktualisiert oder neu vergeben.` });
      }

      if (row.plannedBudgetEUR !== undefined && (isNaN(Number(row.plannedBudgetEUR)) || Number(row.plannedBudgetEUR) < 0)) {
        errors.push({ row: rowNum, field: 'plannedBudgetEUR', message: 'Budget muss eine gültige positive Zahl sein.' });
        isValid = false;
      }

      if (row.submissionDate && isNaN(Date.parse(row.submissionDate))) {
        errors.push({ row: rowNum, field: 'submissionDate', message: 'Ungültiges Datumsformat (erwartet YYYY-MM-DD).' });
        isValid = false;
      }

      if (isValid) {
        validRows.push(row);
      }
    });

    res.json({
      success: true,
      totalRows: rows.length,
      validRowsCount: validRows.length,
      invalidRowsCount: rows.length - validRows.length,
      errors,
      warnings,
      preview: rows.slice(0, 5),
    });
  } catch (err: unknown) {
    res.status(500).json({ error: 'Import validation failed', details: String(err) });
  }
});

// Import commit endpoint
app.post('/api/intelligence/import-commit', (req: Request, res: Response) => {
  try {
    const { rows = [], targetEnvironment = 'demo' } = req.body;
    const userRole = (req.headers['x-user-role'] as string) || 'project_manager';
    const userName = (req.headers['x-user-name'] as string) || 'TEFA Manager';
    const userId = (req.headers['x-user-id'] as string) || 'user_pm';

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No rows provided to commit.' });
    }

    const isDemo = targetEnvironment === 'demo';
    const importedProjects: Project[] = [];

    rows.forEach((row, idx) => {
      const year = new Date().getFullYear();
      const count = projects.length + idx + 1;
      const refId = row.referenceId || `TEFA-${year}-${isDemo ? 'DEMO' : 'PRJ'}-${String(count).padStart(3, '0')}`;

      const newProj: Project = {
        id: 'proj_imp_' + Date.now() + '_' + idx,
        referenceId: refId,
        title: row.title || `Importiertes Projekt ${count}`,
        shortDescription: row.shortDescription || 'Über TEFA Project Intelligence Datenimport angelegt.',
        category: row.category || 'digital_inclusion',
        country: row.country || 'Cameroon',
        locationDetails: row.locationDetails || 'Einsatzort im Antrag definiert',
        lifecyclePhase: row.lifecyclePhase || 'proposal',
        status: row.status || 'Draft',
        isDemoOrHypothetical: isDemo,
        demoDisclaimer: isDemo ? 'Synthetischer Demo-Datensatz zu Simulations- und Testzwecken.' : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: userName,
        proposal: {
          problemStatement: row.problemStatement || 'Bedarfsanalyse im Antragsdossier hinterlegt.',
          targetBeneficiaries: row.targetBeneficiaries || 'Jugendliche & Auszubildende',
          beneficiaryCountPlanned: Number(row.beneficiariesPlanned || row.beneficiaryCountPlanned || 25),
          proposedSolution: row.proposedSolution || 'Gezielte Bildungs- und Technologieförderung.',
          objectives: ['Aufbau von Fachkompetenz', 'Inklusive Bildungschancen schaffen'],
          expectedResults: ['Abschlusszertifikate', 'Erhöhte Beschäftigungsfähigkeit'],
          activities: ['Workshops', 'Praxistraining'],
          durationMonths: Number(row.durationMonths || 6),
          estimatedBudgetEUR: Number(row.plannedBudgetEUR || row.estimatedBudgetEUR || 20000),
          potentialPartners: ['Lokale Berufsschulen'],
          sustainabilityPlan: 'Langfristige lokale Übergabe an Partner.',
          inclusionAccessibilityNeeds: 'Barrierefreie Zugänglichkeit gewährleistet.',
          proposerName: userName,
          proposerEmail: 'controlling@techenergyforafrica.org',
          submissionDate: new Date().toISOString().split('T')[0],
        },
        feasibilityChecks: [],
        decisions: [],
        milestones: [
          {
            id: 'ms_' + Date.now() + '_1',
            title: 'Projektstart & Partner-Kickoff',
            description: 'Initiale Abstimmung und Vertragsunterzeichnung',
            phase: 'planning',
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isCompleted: false,
            responsiblePerson: userName,
            deliverables: ['Kick-off Protokoll'],
          },
        ],
        tasks: [],
        risks: [
          {
            id: 'rk_' + Date.now() + '_1',
            category: 'operational',
            description: 'Logistische Verzögerungen bei der Materialbeschaffung',
            probability: 'medium',
            impact: 'medium',
            mitigationStrategy: 'Pufferzeiten und lokale Beschaffungsalternativen prüfen',
            responsiblePerson: userName,
            status: 'active',
          },
        ],
        budgetItems: [
          {
            id: 'bi_' + Date.now() + '_1',
            category: 'Training & Pedagogy',
            description: 'Schulungsmaterial & Dozentenhonorare',
            plannedCost: Number(row.plannedBudgetEUR || 20000),
            approvedBudget: row.status === 'Approved' ? Number(row.plannedBudgetEUR || 20000) : 0,
            committedCost: 0,
            actualExpenditure: 0,
            currency: 'EUR',
          },
        ],
        fundingSources: row.confirmedFundingEUR
          ? [
              {
                id: 'fs_' + Date.now() + '_1',
                name: 'Bestätigte Kofinanzierung',
                type: 'grant',
                status: 'confirmed',
                amount: Number(row.confirmedFundingEUR),
                currency: 'EUR',
                isRestricted: true,
              },
            ]
          : [],
        transactions: [],
        impactIndicators: [
          {
            id: 'ii_' + Date.now() + '_1',
            name: 'Qualifizierte Teilnehmende',
            category: 'education',
            definition: 'Anzahl erfolgreich zertifizierter Jugendlicher',
            baseline: 0,
            target: Number(row.beneficiariesPlanned || 25),
            actual: 0,
            unit: 'Personen',
            reportingPeriod: '2026',
            evidenceSource: 'Teilnehmerlisten & Prüfungszeugnisse',
            evidenceStatus: 'user_provided_unverified',
            responsiblePerson: userName,
          },
        ],
        closure: {
          deliverablesAccepted: false,
          financialReconciliationDone: false,
          commitmentsReviewed: false,
          assetsHandedOver: false,
          finalPartnerReportReceived: false,
          lessonsLearnedDocumented: false,
          impactEvaluationComplete: false,
          donorReportingFinalized: false,
          boardApprovedClosure: false,
          archiveRetentionConfigured: false,
        },
        simulationParams: {
          beneficiariesCount: Number(row.beneficiariesPlanned || 25),
          trainersCount: 2,
          trainingDurationMonths: 6,
          usableWorkstations: 12,
          studentsPerWorkstation: 2,
          donatedHardwareCount: 0,
          hardwareUnitPurchaseCostEUR: 450,
          logisticsCustomsCostEUR: 1200,
          infrastructureSolarCostEUR: 3000,
          monthlyOperatingCostEUR: 800,
          accessibilityInterpreterCostEUR: 1500,
          maintenanceReservePct: 10,
          confirmedGrantsEUR: Number(row.confirmedFundingEUR || 0),
          pendingGrantsEUR: 0,
        },
      };

      projects.push(newProj);
      importedProjects.push(newProj);
    });

    saveProjects(projects);

    appendAuditLog({
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userRole: userRole as UserRole,
      action: 'INTELLIGENCE_DATA_IMPORTED',
      details: `${importedProjects.length} Datensätze in Umgebung '${targetEnvironment.toUpperCase()}' über Project Intelligence importiert.`,
    });

    res.json({
      success: true,
      importedCount: importedProjects.length,
      targetEnvironment,
      projects: importedProjects,
    });
  } catch (err: unknown) {
    console.error('Error committing imported intelligence records:', err);
    res.status(500).json({ error: 'Commit failed', details: String(err) });
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
  const project = req.body.project || {};
  const brief = req.body.brief || {};

  const projectTitle = req.body.projectTitle || project.title || brief.projectTitle || 'TEFA Vorhaben';
  const projectDescription = req.body.projectDescription || project.shortDescription || brief.mainMessage || '';
  const objective = req.body.objective || brief.objective || 'Öffentlichkeit und Förderpartner informieren';
  const targetAudience = req.body.targetAudience || brief.targetAudience || 'Junge Menschen, Schulen, Geber';
  const lifecyclePhase = req.body.lifecyclePhase || brief.lifecyclePhase || 'fundraising_outreach';
  const lang = req.body.lang || brief.language || 'de';
  const noPeopleMode = req.body.noPeopleMode !== undefined ? req.body.noPeopleMode : (brief.noPeopleMode !== false);

  if (!process.env.GEMINI_API_KEY) {
    const offlineResult = {
      suggestedTitle: `${projectTitle}: Saubere Solarenergie & Bildungschancen`,
      mainMessage: 'Nachhaltige Solarinfrastruktur eröffnet verlässliche Bildungschancen ohne CO2-Emissionen.',
      callToAction: 'Jetzt Bildungspartner von TechEnergy For Africa e.V. werden',
      headline: 'Solarenergie für verlässliche Bildung',
      subtitle: `Gemeinsam schaffen wir digitale Lernräume für ${targetAudience} in Afrika.`,
      imagePromptDescription: `Modern sustainable solar-powered educational setup in Africa. High efficiency photovoltaic panels, clean desks with open laptops, books, natural sunlight, lush vegetation. STRICT CONSTRAINT: ${noPeopleMode ? 'NO people, NO human faces, NO human silhouettes, NO hands.' : 'Authentic community equipment.'}`,
      negativePrompt: noPeopleMode ? 'people, human, face, silhouette, hands, crowd, messy, distorted' : 'stereotypes, distorted, low quality',
      suggestedColors: ['#0f2b48', '#10b981', '#f97316'],
      visualElements: ['Solar photovoltaic modules', 'Laptops with coding interface', 'Educational books', 'Green seedlings & eco-tech sensors'],
      typographyTone: 'Professional, forward-looking, non-profit transparency',
    };

    return res.json({
      success: true,
      mode: 'offline_planner',
      ...offlineResult,
      briefSuggestions: {
        title: offlineResult.suggestedTitle,
        mainMessage: offlineResult.mainMessage,
        callToAction: offlineResult.callToAction,
        objective,
        targetAudience,
        preferredColors: offlineResult.suggestedColors,
        imageDescription: offlineResult.imagePromptDescription,
        textToDisplay: {
          headline: offlineResult.headline,
          subtitle: offlineResult.subtitle,
          callToAction: offlineResult.callToAction,
        },
        visualStyle: 'photo_documentary',
      },
    });
  }

  try {
    const prompt = `
You are the Senior Communications Strategist & Creative Director for TechEnergy For Africa e.V. (TEFA).
TEFA is a German registered non-profit (e.V.) advancing renewable energy and digital education in Africa (Cameroon, Senegal, etc.).
Website: https://www.techenergyforafrica.org

Plan a comprehensive visual campaign strategy:
Project Title: "${projectTitle}"
Project Context: "${projectDescription}"
Campaign Objective: "${objective}"
Target Audience: "${targetAudience}"
Lifecycle Phase: "${lifecyclePhase}"
Language: "${lang}" (Write headlines, copy, messages completely in this language: de, en, or fr)
No People Mode: ${noPeopleMode ? 'ENABLED - STRICTLY NO HUMANS, NO FACES, NO SILHOUETTES, NO CROWDS, NO HANDS. Focus on equipment, renewable tech, laptops, architecture, seedlings, landscapes.' : 'Disabled'}

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
    const briefSuggestions = {
      title: parsed.suggestedTitle || `${projectTitle} – Kampagne`,
      mainMessage: parsed.mainMessage || projectDescription,
      callToAction: parsed.callToAction || 'Mehr erfahren',
      objective,
      targetAudience,
      preferredColors: parsed.suggestedColors || ['#0f2b48', '#10b981', '#f97316'],
      imageDescription: parsed.imagePromptDescription || '',
      textToDisplay: {
        headline: parsed.headline || projectTitle,
        subtitle: parsed.subtitle || projectDescription,
        callToAction: parsed.callToAction || 'Mehr erfahren',
      },
      visualStyle: 'photo_documentary',
    };

    res.json({
      success: true,
      ...parsed,
      briefSuggestions,
    });
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
  const brief = req.body.brief || {};
  const brandIdentity = req.body.brandIdentity || {};
  const projectTitle = req.body.projectTitle || brief.projectTitle || brandIdentity.projectName || 'TEFA Project';

  // Extract base prompt from explicit prompt or campaign brief/brand identity
  const prompt =
    req.body.prompt ||
    brief.imageDescription ||
    brief.creativeStrategy?.imagePromptDescription ||
    brandIdentity.coreVisualSubject ||
    `Clean solar-powered technology hub for ${projectTitle}. Modern photovoltaic panels, computers, educational hardware, vibrant energy.`;

  const negativePrompt =
    req.body.negativePrompt ||
    brief.negativePrompt ||
    'people, person, human, face, silhouette, hand, crowd, distorted equipment, low quality';

  const noPeopleMode = req.body.noPeopleMode !== undefined ? req.body.noPeopleMode : (brief.noPeopleMode !== false);
  const colors =
    req.body.colors ||
    brief.preferredColors ||
    (brandIdentity.colorPalette
      ? [brandIdentity.colorPalette.primary, brandIdentity.colorPalette.secondary, brandIdentity.colorPalette.accent]
      : ['#0f2b48', '#10b981', '#f97316']);

  const rawAspectRatio = req.body.aspectRatio || '1:1';
  const aspectRatio = (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(rawAspectRatio)
    ? rawAspectRatio
    : '1:1') as '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

  const imageModel = CREATIVE_STUDIO_MODELS.IMAGE_MODEL;

  let finalPrompt = prompt;
  if (noPeopleMode) {
    finalPrompt +=
      ' STRICT REQUIREMENT: Absolutely NO people, NO human figures, NO faces, NO human silhouettes, NO human hands, NO crowds. Focus solely on equipment, clean tech, solar panels, laptops, books, seedlings, modern classrooms.';
  }

  // Handle Missing API Key with clear actionable error (unless explicitly preview/simulation mode)
  if (!process.env.GEMINI_API_KEY) {
    if (req.body.previewOnly || req.headers['x-preview-mode'] === 'vector') {
      const primary = colors?.[0] || '#0f2b48';
      const secondary = colors?.[1] || '#10b981';
      const accent = colors?.[2] || '#f97316';
      const svgUrl = generateConsistentSvgArtwork('master_visual', finalPrompt, primary, secondary, accent);
      const masterVisual = {
        imageUrl: svgUrl,
        promptUsed: finalPrompt,
        negativePrompt,
        generatedAt: new Date().toISOString(),
        model: imageModel,
        isApprovedAsMaster: true,
      };

      return res.json({
        success: true,
        imageUrl: svgUrl,
        masterVisual,
        modelUsed: imageModel,
        promptUsed: finalPrompt,
        isNoPeopleApplied: noPeopleMode,
        isLiveModel: false,
        notice: `Offline Vektor-Vorschau. Konfigurieren Sie GEMINI_API_KEY für reale ${imageModel} Generierung.`,
      });
    }

    return res.status(401).json({
      error: `Google AI Studio API-Schlüssel nicht konfiguriert (GEMINI_API_KEY fehlt). Für die Bildgenerierung mit dem Nano Banana Modell '${imageModel}' ist ein gültiger API-Schlüssel erforderlich.`,
      code: 'MISSING_API_KEY',
      modelUsed: imageModel,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [{ text: finalPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    const base64Image = extractImageFromResponse(response);

    if (base64Image) {
      const masterVisual = {
        imageUrl: base64Image,
        promptUsed: finalPrompt,
        negativePrompt,
        generatedAt: new Date().toISOString(),
        model: imageModel,
        isApprovedAsMaster: true,
      };

      return res.json({
        success: true,
        imageUrl: base64Image,
        masterVisual,
        modelUsed: imageModel,
        promptUsed: finalPrompt,
        isNoPeopleApplied: noPeopleMode,
        isLiveModel: true,
      });
    }

    return res.status(502).json({
      error: `Das Bildmodell '${imageModel}' hat keine Bilddaten zurückgegeben. Bitte prüfen Sie den Prompt oder versuchen Sie es erneut.`,
      code: 'NO_IMAGE_RETURNED',
      modelUsed: imageModel,
    });
  } catch (err: unknown) {
    console.error(`Nano Banana image model '${imageModel}' error:`, err);
    const formatted = formatImageGenerationError(err, imageModel);
    return res.status(formatted.status).json(formatted);
  }
});

// 8. Generate Specific Format Asset from Master Visual (with reference-image-guided Nano Banana adaptation)
app.post('/api/creative-studio/generate-format', async (req: Request, res: Response) => {
  const { format, headline, subtitle, callToAction } = req.body;
  const brief = req.body.brief || {};
  const brandIdentity = req.body.brandIdentity || {};
  const masterVisual = req.body.masterVisual || {};
  const masterVisualUrl = req.body.masterVisualUrl || masterVisual.imageUrl || '';

  const formatConfig = CAMPAIGN_FORMAT_CONFIGS.find((f) => f.id === format) || CAMPAIGN_FORMAT_CONFIGS[0];
  const primary = brandIdentity?.colorPalette?.primary || brief?.preferredColors?.[0] || '#0f2b48';
  const secondary = brandIdentity?.colorPalette?.secondary || brief?.preferredColors?.[1] || '#10b981';
  const accent = brandIdentity?.colorPalette?.accent || brief?.preferredColors?.[2] || '#f97316';
  const isNoPeople = brief?.noPeopleMode !== false;
  const imageModel = CREATIVE_STUDIO_MODELS.IMAGE_MODEL;

  // Map to supported aspect ratio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9"
  const targetAspectRatio = (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(formatConfig.aspectRatio)
    ? formatConfig.aspectRatio
    : '1:1') as '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

  let formatImageUrl: string = '';
  let isLiveGenerated = false;

  // Reference image extraction from master visual (data URL or local file path)
  const refImage = resolveReferenceImage(masterVisualUrl);

  if (process.env.GEMINI_API_KEY) {
    try {
      const parts: any[] = [];
      let formatPrompt = `Campaign asset format: ${formatConfig.name} (${formatConfig.aspectRatio}). Subject: ${brief.title || brandIdentity.campaignName || 'TEFA Campaign'}. `;

      if (refImage) {
        // Nano Banana Reference Image Adaptation (Edit/Guided Composition)
        parts.push({
          inlineData: {
            data: refImage.data,
            mimeType: refImage.mimeType,
          },
        });
        formatPrompt += `Adapt this exact master campaign visual into the specified aspect ratio (${formatConfig.aspectRatio}). Maintain the exact same visual subject, color palette, lighting, textures, and style. Ensure brand consistency with the reference image.`;
      } else {
        const visualSubject =
          brief.imageDescription ||
          masterVisual.promptUsed ||
          `Clean solar-powered technology and environmental design for ${brief.title || 'TechEnergy For Africa'}`;
        formatPrompt += `${visualSubject}. Clean composition tailored for ${formatConfig.name}.`;
      }

      if (isNoPeople) {
        formatPrompt += ' STRICT REQUIREMENT: Absolutely NO people, NO human figures, NO faces, NO human silhouettes, NO hands, NO crowds.';
      }

      parts.push({ text: formatPrompt });

      const response = await ai.models.generateContent({
        model: imageModel,
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: targetAspectRatio,
          },
        },
      });

      const extracted = extractImageFromResponse(response);
      if (extracted) {
        formatImageUrl = extracted;
        isLiveGenerated = true;
      }
    } catch (err: unknown) {
      console.warn(`Format generation via '${imageModel}' encountered an issue:`, err);
      const formatted = formatImageGenerationError(err, imageModel);
      // On 429 rate limit or 401 auth, abort and return clear error
      if (formatted.status === 429 || formatted.status === 401) {
        return res.status(formatted.status).json(formatted);
      }
      // If live model fails on format derivative but we have an approved master visual URL,
      // preserve the approved master visual to guarantee shared visual identity
      if (masterVisualUrl) {
        formatImageUrl = masterVisualUrl;
      } else {
        return res.status(formatted.status).json(formatted);
      }
    }
  }

  // If not generated via live model (no key or offline preview):
  if (!formatImageUrl) {
    if (masterVisualUrl) {
      // Shared visual identity: reuse the approved master visual across coordinated assets
      formatImageUrl = masterVisualUrl;
    } else {
      formatImageUrl = generateConsistentSvgArtwork(format, brief?.title || 'TEFA Campaign', primary, secondary, accent);
    }
  }

  const assetHeadline = headline || brief?.textToDisplay?.headline || brief?.title || 'Solar-Bildung für Afrika';
  const assetSubtitle = subtitle || brief?.textToDisplay?.subtitle || brief?.mainMessage || 'Nachhaltige Energie & Inklusion';
  const assetCta = callToAction || brief?.textToDisplay?.callToAction || brief?.callToAction || 'Mehr erfahren';

  const asset: CampaignAsset = {
    id: `asset_${format}_${Date.now()}`,
    campaignId: brief?.id || 'camp_active',
    format: format as CampaignFormatType,
    version: 1,
    imageUrl: formatImageUrl,
    headline: assetHeadline,
    subtitle: assetSubtitle,
    callToAction: assetCta,
    overlayConfig: {
      headline: assetHeadline,
      subtitle: assetSubtitle,
      callToAction: assetCta,
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
    modelUsed: imageModel,
  };

  res.json({
    success: true,
    asset,
    formatConfig,
    isLiveGenerated,
    modelUsed: imageModel,
  });
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

// Only run dev server setup when executed directly (not when imported in test runners)
if (!process.argv[1]?.includes('test')) {
  setupVite().catch((err) => {
    console.error('Failed to start server:', err);
  });
}
