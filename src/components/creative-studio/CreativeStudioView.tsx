import React, { useState, useEffect } from 'react';
import { useProjects } from '../../context/ProjectContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import {
  GeneratedCampaign,
  CampaignBrief,
  BrandIdentitySpec,
  CampaignFormatType,
} from '../../types';
import { SEED_CAMPAIGNS, generateConsistentSvgArtwork } from '../../data/seedCampaigns';
import { ProjectSelector } from './ProjectSelector';
import { CampaignBriefBuilder } from './CampaignBriefBuilder';
import { BrandIdentityPanel } from './BrandIdentityPanel';
import { GenerationStudio } from './GenerationStudio';
import { CampaignGallery } from './CampaignGallery';
import {
  Palette,
  Layers,
  Sparkles,
  FileText,
  ShieldCheck,
  FolderArchive,
  Download,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Archive,
  Clock,
} from 'lucide-react';

export type CreativeStudioSection =
  | 'project'
  | 'brief'
  | 'brand'
  | 'generation'
  | 'gallery'
  | 'approval'
  | 'archive';

export const CreativeStudioView: React.FC = () => {
  const { projects } = useProjects();
  const { currentUser } = useAuthRole();

  const [activeSection, setActiveSection] = useState<CreativeStudioSection>('project');
  const [allCampaigns, setAllCampaigns] = useState<GeneratedCampaign[]>(SEED_CAMPAIGNS);
  const [currentCampaign, setCurrentCampaign] = useState<GeneratedCampaign>(SEED_CAMPAIGNS[0]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    SEED_CAMPAIGNS[0].brief.projectId || projects[0]?.id || 'proj_dfg_003'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load campaigns from backend API
  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/creative-studio/campaigns');
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setAllCampaigns(data);
          // If current isn't in data, keep or select first
          const found = data.find((c: GeneratedCampaign) => c.id === currentCampaign.id);
          if (found) setCurrentCampaign(found);
          else setCurrentCampaign(data[0]);
        }
      }
    } catch {
      // Keep seed campaigns if network error
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || projects[0] || null;

  // Change project selection
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    const proj = projects.find((p) => p.id === projectId);
    if (proj) {
      // Check if there is an existing campaign for this project
      const existing = allCampaigns.find((c) => c.brief.projectId === projectId);
      if (existing) {
        setCurrentCampaign(existing);
      } else {
        // Create a new campaign draft linked to this project
        const newCamp: GeneratedCampaign = {
          id: `camp_${projectId}_${Date.now()}`,
          brief: {
            id: `brief_${projectId}_${Date.now()}`,
            projectId: proj.id,
            projectTitle: proj.title,
            title: `${proj.title} – Bildungskampagne`,
            lifecyclePhase: 'fundraising_outreach',
            objective: proj.proposal?.objectives?.[0] || 'Förderpartner und Öffentlichkeit informieren',
            targetAudience: proj.proposal?.targetBeneficiaries || 'Öffentlichkeit, Förderpartner',
            mainMessage: proj.shortDescription || 'Gemeinsam für saubere Energie und Bildung in Afrika',
            callToAction: 'Jetzt Projektpartner von TEFA e.V. werden',
            language: 'de',
            channels: ['billboard_poster', 'instagram_square', 'linkedin_graphic'],
            visualStyle: 'modern_flat_vector',
            preferredColors: ['#0f2b48', '#10b981', '#f97316'],
            imageDescription: `Visualisierung für ${proj.title}: Solaranlagen, Bildungstechnik, saubere Umwelt ohne sichtbare Personen.`,
            textToDisplay: {
              headline: proj.title,
              subtitle: proj.shortDescription,
              callToAction: 'Erfahre mehr auf techenergyforafrica.com',
            },
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
            requiredApprovals: ['Vorstand TEFA e.V.'],
            supportingDocuments: [],
            noPeopleMode: true,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
          },
          brandIdentity: {
            projectName: proj.title,
            campaignName: `${proj.title} Kampagne`,
            approvedLogo: {
              useOfficialTefaLogo: true,
              logoSource: 'official_approved_asset',
              disclaimer: 'Offizielles TEFA e.V. Verbands-Brandmark.',
            },
            colorPalette: {
              primary: '#0f2b48',
              secondary: '#10b981',
              accent: '#f97316',
              neutralLight: '#ffffff',
              neutralDark: '#0f172a',
            },
            typographyGuidance: {
              headingFont: 'Plus Jakarta Sans, Inter',
              bodyFont: 'Inter, sans-serif',
              styleTone: 'Professionell, gemeinnützig und lösungsorientiert',
            },
            visualComposition: 'Klarer Fokus auf Solartechnik, IT-Hardware und grüne Nachhaltigkeit.',
            visualStyle: 'modern_flat_vector',
            coreVisualSubject: 'Solartechnik & Bildungsequipment',
            keyCampaignMessage: proj.shortDescription,
            noPeopleMode: true,
            disallowedVisualElements: ['human figures', 'faces', 'silhouettes', 'crowds', 'hands'],
            allowedVisualElements: ['solar panels', 'laptops', 'books', 'seedlings', 'hardware'],
          },
          masterVisual: {
            imageUrl: generateConsistentSvgArtwork('master_visual', proj.title, '#0f2b48', '#10b981', '#f97316'),
            promptUsed: `Solar powered technology setup for ${proj.title}. Clean renewable equipment, eco classroom, strict no people constraint.`,
            negativePrompt: 'people, person, human, face, silhouette, hand, crowd',
            generatedAt: new Date().toISOString(),
            model: 'gemini-3.1-flash-lite-image',
            isApprovedAsMaster: true,
          },
          selectedFormats: ['billboard_poster', 'instagram_square', 'linkedin_graphic'],
          assets: [],
          approvalHistory: [
            {
              id: `hist_${Date.now()}`,
              status: 'draft',
              changedBy: currentUser.name,
              changedByRole: currentUser.role,
              timestamp: new Date().toISOString(),
              comment: 'Neuer Kampagnenentwurf angelegt.',
            },
          ],
          isSavedToProject: false,
        };
        setCurrentCampaign(newCamp);
      }
    }
  };

  // Save Campaign to server
  const handleSaveCampaignDraft = async () => {
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/creative-studio/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCampaign),
      });

      if (!res.ok) throw new Error('Fehler beim Speichern');
      const data = await res.json();
      setCurrentCampaign(data.campaign);
      await fetchCampaigns();
      setStatusMessage('Kampagnen-Entwurf erfolgreich gesichert.');
    } catch {
      setStatusMessage('Entwurf lokal im Status gesichert.');
    } finally {
      setIsSaving(false);
    }
  };

  // Link campaign to project
  const handleSaveToProject = async () => {
    const res = await fetch(`/api/creative-studio/campaigns/${currentCampaign.id}/save-to-project`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: selectedProjectId }),
    });

    if (res.ok) {
      const data = await res.json();
      setCurrentCampaign(data.campaign);
      await fetchCampaigns();
    }
  };

  // Regenerate single format
  const handleRegenerateFormat = async (formatId: CampaignFormatType) => {
    const res = await fetch('/api/creative-studio/generate-format', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: currentCampaign.id,
        format: formatId,
        masterVisual: currentCampaign.masterVisual,
        brief: currentCampaign.brief,
        brandIdentity: currentCampaign.brandIdentity,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const updated = currentCampaign.assets.map((a) => (a.format === formatId ? data.asset : a));
      if (!updated.some((a) => a.format === formatId)) updated.push(data.asset);
      const newCamp = { ...currentCampaign, assets: updated };
      setCurrentCampaign(newCamp);
      await fetch('/api/creative-studio/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCamp),
      });
    }
  };

  const SECTIONS = [
    { id: 'project' as CreativeStudioSection, step: 'A', label: 'Projekt wählen', icon: FileText },
    { id: 'brief' as CreativeStudioSection, step: 'B', label: 'Briefing-Builder', icon: Layers },
    { id: 'brand' as CreativeStudioSection, step: 'C', label: 'Markenidentität', icon: Palette },
    { id: 'generation' as CreativeStudioSection, step: 'D', label: 'KI-Bildgenerator', icon: Sparkles },
    { id: 'gallery' as CreativeStudioSection, step: 'E', label: 'Kampagnen-Galerie', icon: Download },
    { id: 'approval' as CreativeStudioSection, step: 'F', label: 'Freigabe & Governance', icon: ShieldCheck },
    { id: 'archive' as CreativeStudioSection, step: 'G', label: 'Projekt-Archiv', icon: FolderArchive },
  ];

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0f2b48] to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>TEFA Creative Studio – AI Branding & Campaign Builder</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Visuelle Kampagnen & Markenidentität
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Erstellen Sie konsistente, barrierefreie und markenkonforme Kommunikationskampagnen für
              Bildungs- und Erneuerbare-Energien-Projekte von TechEnergy For Africa e.V.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Active Campaign Selector */}
            <select
              value={currentCampaign.id}
              onChange={(e) => {
                const found = allCampaigns.find((c) => c.id === e.target.value);
                if (found) {
                  setCurrentCampaign(found);
                  setSelectedProjectId(found.brief.projectId);
                }
              }}
              className="bg-slate-800 text-white text-xs p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {allCampaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.brief.title} ({camp.assets.length} Formate)
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSaveCampaignDraft}
              disabled={isSaving}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              {isSaving ? 'Speichere...' : 'Entwurf sichern'}
            </button>
          </div>
        </div>

        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Navigation Stepper / Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-[760px]">
          {SECTIONS.map((sec) => {
            const isActive = activeSection === sec.id;
            const Icon = sec.icon;

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                    isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {sec.step}
                </span>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Views */}
      <div className="transition-all">
        {activeSection === 'project' && (
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={handleSelectProject}
            onContinueToBrief={() => setActiveSection('brief')}
          />
        )}

        {activeSection === 'brief' && (
          <CampaignBriefBuilder
            brief={currentCampaign.brief}
            selectedProject={selectedProject}
            onChange={(updatedBrief) => {
              setCurrentCampaign({
                ...currentCampaign,
                brief: updatedBrief,
              });
            }}
            onContinueToIdentity={() => setActiveSection('brand')}
            onSaveDraft={handleSaveCampaignDraft}
            isSaving={isSaving}
          />
        )}

        {activeSection === 'brand' && (
          <BrandIdentityPanel
            brandIdentity={currentCampaign.brandIdentity}
            onChange={(updatedIdentity) => {
              setCurrentCampaign({
                ...currentCampaign,
                brandIdentity: updatedIdentity,
              });
            }}
            onContinueToGeneration={() => setActiveSection('generation')}
          />
        )}

        {activeSection === 'generation' && (
          <GenerationStudio
            campaign={currentCampaign}
            onUpdateCampaign={(updated) => setCurrentCampaign(updated)}
            onContinueToGallery={() => setActiveSection('gallery')}
          />
        )}

        {activeSection === 'gallery' && (
          <CampaignGallery
            campaign={currentCampaign}
            onUpdateCampaign={(updated) => setCurrentCampaign(updated)}
            onRegenerateFormat={handleRegenerateFormat}
            onSaveToProject={handleSaveToProject}
          />
        )}

        {activeSection === 'approval' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Sektion F: TEFA Governance, Audit-Protokoll & Freigabe
                </h3>
                <p className="text-xs text-slate-500">
                  Transparente Dokumentation aller Prüfschritte gemäß Satzung von TechEnergy For Africa e.V.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-800">
                Verantwortliche Freigabeinstanz:
              </span>
              <p className="text-slate-600">
                Nur Projektmanager (z.B. Frederic Pokam), Vorstandsmitglieder (Dr. Sophie Becker) oder Administratoren
                dürfen Kampagnen für die externe Verbreitung freigeben. Die KI darf Kampagnen nicht selbst freigeben.
              </p>
            </div>

            {/* Approval History List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bisherige Governance-Einträge:
              </h4>

              {currentCampaign.approvalHistory?.length > 0 ? (
                <div className="space-y-2">
                  {currentCampaign.approvalHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {item.status.toUpperCase()}
                          </span>
                          <span className="font-semibold text-slate-900">{item.changedBy}</span>
                          <span className="text-[10px] text-slate-500">({item.changedByRole})</span>
                        </div>
                        {item.comment && (
                          <p className="text-[11px] text-slate-600">{item.comment}</p>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(item.timestamp).toLocaleString('de-DE')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Noch keine Freigabeprotokolle hinterlegt.</p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSection('gallery')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Zurück zur Kampagnen-Galerie
              </button>
            </div>
          </div>
        )}

        {activeSection === 'archive' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                <FolderArchive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Sektion G: Kampagnen-Archiv & Projektintegration
                </h3>
                <p className="text-xs text-slate-500">
                  Alle gespeicherten Kampagnen-Dossiers von TechEnergy For Africa e.V.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allCampaigns.map((camp) => (
                <div
                  key={camp.id}
                  className={`p-4 rounded-xl border transition-all ${
                    camp.id === currentCampaign.id
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {camp.brief.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Projekt: {camp.brief.projectTitle}
                      </p>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {camp.assets.length} Formate
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(camp.brief.updatedAt).toLocaleDateString('de-DE')}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentCampaign(camp);
                        setSelectedProjectId(camp.brief.projectId);
                        setActiveSection('gallery');
                      }}
                      className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-[11px]"
                    >
                      Kampagne öffnen &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
