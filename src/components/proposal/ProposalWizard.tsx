import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { Project } from '../../types';
import {
  FilePlus,
  Sparkles,
  Save,
  Send,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Building,
  Users,
  Target,
  Euro,
  HelpCircle,
} from 'lucide-react';

export const ProposalWizard: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuthRole();
  const { activeProject, updateProject, createProject } = useProjects();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<Project>(() => {
    if (activeProject) return JSON.parse(JSON.stringify(activeProject));
    return {
      id: 'proj_' + Date.now(),
      referenceId: 'TEFA-2026-NEW-001',
      title: '',
      shortDescription: '',
      category: 'digital_inclusion',
      country: 'Cameroon',
      locationDetails: '',
      lifecyclePhase: 'proposal',
      status: 'Draft',
      isDemoOrHypothetical: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser.name,
      proposal: {
        problemStatement: '',
        targetBeneficiaries: '',
        beneficiaryCountPlanned: 50,
        proposedSolution: '',
        objectives: [''],
        expectedResults: [''],
        activities: [''],
        durationMonths: 12,
        estimatedBudgetEUR: 25000,
        potentialPartners: [''],
        sustainabilityPlan: '',
        inclusionAccessibilityNeeds: '',
        proposerName: currentUser.name,
        proposerEmail: currentUser.email,
        submissionDate: new Date().toISOString().split('T')[0],
      },
      feasibilityChecks: [],
      decisions: [],
      milestones: [],
      tasks: [],
      risks: [],
      budgetItems: [],
      fundingSources: [],
      transactions: [],
      impactIndicators: [],
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
        beneficiariesCount: 50,
        trainersCount: 2,
        trainingDurationMonths: 6,
        usableWorkstations: 15,
        studentsPerWorkstation: 3,
        donatedHardwareCount: 0,
        hardwareUnitPurchaseCostEUR: 200,
        logisticsCustomsCostEUR: 1500,
        infrastructureSolarCostEUR: 5000,
        monthlyOperatingCostEUR: 300,
        accessibilityInterpreterCostEUR: 1000,
        maintenanceReservePct: 10,
        confirmedGrantsEUR: 0,
        pendingGrantsEUR: 0,
      },
    };
  });

  // AI Assistant State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    improvedProblemStatement?: string;
    improvedSolution?: string;
    suggestedObjectives?: string[];
    suggestedActivities?: string[];
    inclusionRecommendations?: string;
    risksToConsider?: string[];
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Sync when activeProject changes
  React.useEffect(() => {
    if (activeProject) {
      setFormData(JSON.parse(JSON.stringify(activeProject)));
    }
  }, [activeProject]);

  const handleAiAssistance = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/proposal-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          problemStatement: formData.proposal.problemStatement,
          proposedSolution: formData.proposal.proposedSolution,
          targetBeneficiaries: formData.proposal.targetBeneficiaries,
          lang: language,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    await updateProject(formData);
    setNotification('Entwurf erfolgreich gespeichert.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmitProposal = async () => {
    const updated: Project = {
      ...formData,
      status: 'Submitted',
      lifecyclePhase: 'proposal',
    };
    await updateProject(updated);
    setFormData(updated);
    setNotification('Projektantrag erfolgreich eingereicht! Status: Eingereicht (Zur Begutachtung)');
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Modul A
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Referenz: {formData.referenceId}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Projektantrags-Assistent (Proposal Wizard)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Geführte Antragserfassung nach den Förderrichtlinien von TechEnergy For Africa e.V.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Save className="w-4 h-4 text-slate-600" />
            <span>{t.common.save}</span>
          </button>
          <button
            onClick={handleSubmitProposal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Antrag formell einreichen</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Step Indicator Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        {[
          { num: 1, label: '1. Grunddaten & Träger', icon: Building },
          { num: 2, label: '2. Problem & Zielgruppe', icon: Users },
          { num: 3, label: '3. Lösung & Aktivitäten', icon: Target },
          { num: 4, label: '4. Budget & Nachhaltigkeit', icon: Euro },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          return (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="truncate">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Form Form + AI Assistant Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Body (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                1. Stammdaten des Projekts & Antragsteller
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Projekttitel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="z.B. IFOPSIM – Inclusive Digital Vocational Training"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Schwerpunkt-Kategorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as Project['category'],
                      })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="digital_inclusion">Digitale Teilhabe & Inklusion</option>
                    <option value="inclusive_education">Inklusive Bildung & Berufsbildung</option>
                    <option value="renewable_energy">Erneuerbare Energien & Solar</option>
                    <option value="environmental_education">Umweltbildung & Generation Green</option>
                    <option value="international_exchange">Internationaler Austausch</option>
                    <option value="community_development">Gemeindeentwicklung</option>
                    <option value="youth_empowerment">Jugendförderung</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Zielland & Region *
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        country: e.target.value as Project['country'],
                      })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Cameroon">Kamerun (Cameroon)</option>
                    <option value="Germany">Deutschland (Germany)</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Kenya">Kenia</option>
                    <option value="Other">Anderes afrikanisches Land</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Genauer Standort / Partnerstätte
                </label>
                <input
                  type="text"
                  value={formData.locationDetails}
                  onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
                  placeholder="z.B. Douala / Littoral Region, Partnerzentrum Bonabéri"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kurzbeschreibung (Executive Summary)
                </label>
                <textarea
                  rows={3}
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Prägnante 2-3 Sätze zur Projektidee..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Name des Antragstellers
                  </label>
                  <input
                    type="text"
                    value={formData.proposal.proposerName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        proposal: { ...formData.proposal, proposerName: e.target.value },
                      })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-Mail-Adresse
                  </label>
                  <input
                    type="email"
                    value={formData.proposal.proposerEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        proposal: { ...formData.proposal, proposerEmail: e.target.value },
                      })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Problem & Target Group */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                2. Problemstellung & Zielgruppe
              </h2>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Ausgangslage & Problemstellung *
                  </label>
                  <button
                    onClick={handleAiAssistance}
                    disabled={aiLoading}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>KI-Formulierungshilfe</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={formData.proposal.problemStatement}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proposal: { ...formData.proposal, problemStatement: e.target.value },
                    })
                  }
                  placeholder="Welche strukturelle Hürde oder Herausforderung soll gelöst werden?"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Zielgruppe & Begünstigte *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.proposal.targetBeneficiaries}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        proposal: { ...formData.proposal, targetBeneficiaries: e.target.value },
                      })
                    }
                    placeholder="z.B. Gehörlose Jugendliche, Mädchen und junge Frauen..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Geplante Anzahl Begünstigte (Direkt)
                  </label>
                  <input
                    type="number"
                    value={formData.proposal.beneficiaryCountPlanned}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        proposal: {
                          ...formData.proposal,
                          beneficiaryCountPlanned: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inklusions- & Barrierefreiheitskonzept (Accessibility)
                </label>
                <textarea
                  rows={3}
                  value={formData.proposal.inclusionAccessibilityNeeds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proposal: {
                        ...formData.proposal,
                        inclusionAccessibilityNeeds: e.target.value,
                      },
                    })
                  }
                  placeholder="z.B. Gebärdensprachdolmetscher, visuelle Lernsoftware, barrierefreier Zugang..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Solution, Objectives & Activities */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                3. Lösungsansatz, Ziele & Maßnahmen
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vorgeschlagene Lösung (Methodik & Konzept) *
                </label>
                <textarea
                  rows={4}
                  value={formData.proposal.proposedSolution}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proposal: { ...formData.proposal, proposedSolution: e.target.value },
                    })
                  }
                  placeholder="Wie sieht der Lösungsansatz konkret aus? (z.B. solarbetriebenes IT-Labor)..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Objectives List */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Spezifische Projektziele (SMART Objectives)
                  </label>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        proposal: {
                          ...formData.proposal,
                          objectives: [...formData.proposal.objectives, ''],
                        },
                      })
                    }
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    + Ziel hinzufügen
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.proposal.objectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-5">{i + 1}.</span>
                      <input
                        type="text"
                        value={obj}
                        onChange={(e) => {
                          const updated = [...formData.proposal.objectives];
                          updated[i] = e.target.value;
                          setFormData({
                            ...formData,
                            proposal: { ...formData.proposal, objectives: updated },
                          });
                        }}
                        placeholder="Messbares Ziel formulieren..."
                        className="flex-1 text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities List */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Geplante Hauptaktivitäten (Work Packages)
                  </label>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        proposal: {
                          ...formData.proposal,
                          activities: [...formData.proposal.activities, ''],
                        },
                      })
                    }
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    + Aktivität hinzufügen
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.proposal.activities.map((act, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-5">{i + 1}.</span>
                      <input
                        type="text"
                        value={act}
                        onChange={(e) => {
                          const updated = [...formData.proposal.activities];
                          updated[i] = e.target.value;
                          setFormData({
                            ...formData,
                            proposal: { ...formData.proposal, activities: updated },
                          });
                        }}
                        placeholder="z.B. Installation der Photovoltaikanlage, Schulung..."
                        className="flex-1 text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Projektdauer (in Monaten)
                </label>
                <input
                  type="number"
                  value={formData.proposal.durationMonths}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proposal: {
                        ...formData.proposal,
                        durationMonths: parseInt(e.target.value) || 12,
                      },
                    })
                  }
                  className="w-32 text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Budget & Sustainability */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                4. Vorläufiges Budget & Nachhaltigkeitsmodell
              </h2>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Geschätzter Gesamtfinanzbedarf (in EUR) *
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">€</span>
                  <input
                    type="number"
                    value={formData.proposal.estimatedBudgetEUR}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        proposal: {
                          ...formData.proposal,
                          estimatedBudgetEUR: parseFloat(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full text-xs pl-7 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Entspricht ca.{' '}
                  {(formData.proposal.estimatedBudgetEUR * 655.957).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{' '}
                  XAF (Referenzkurs: 1 EUR = 655,957 XAF).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nachhaltigkeit & Folgebetrieb (Sustainability Plan)
                </label>
                <textarea
                  rows={3}
                  value={formData.proposal.sustainabilityPlan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proposal: { ...formData.proposal, sustainabilityPlan: e.target.value },
                    })
                  }
                  placeholder="Wie trägt sich das Vorhaben nach Ablauf der Erstförderung? (z.B. Einnahmen aus Solarladestation, IT-Dienstleistungen)..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Governance-Hinweis:</span> Beantragte Fördermittel
                  werden im System getrennt von bestätigten Geldern geführt. Der Antrag wird nach dem
                  Einreichen durch die TEFA-Begutachter auf Machbarkeit und Risiken geprüft.
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons within Wizard */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
            >
              ← Zurück
            </button>
            <div className="flex items-center gap-2">
              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Weiter →
                </button>
              ) : (
                <button
                  onClick={handleSubmitProposal}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Antrag fertigstellen & einreichen</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI Proposal Assistant Column */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                KI-Antragsberater (Gemini 3.8)
              </h2>
              <div className="text-[11px] text-slate-400">Präzisierung ohne Fakten-Erfindung</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Der Assistent analysiert Ihren Antragsentwurf nach den Kriterien für internationale
            Entwicklungszusammenarbeit (SMART-Ziele, Barrierefreiheit, Solarkompatibilität).
          </p>

          <button
            onClick={handleAiAssistance}
            disabled={aiLoading}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {aiLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>KI analysiert Antragsentwurf...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Antrag analysieren & schärfen</span>
              </>
            )}
          </button>

          {aiSuggestions ? (
            <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
              {aiSuggestions.improvedProblemStatement && (
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="font-semibold text-emerald-400 mb-1 flex items-center justify-between">
                    <span>Vorschlag: Problemformulierung</span>
                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          proposal: {
                            ...formData.proposal,
                            problemStatement: aiSuggestions.improvedProblemStatement || '',
                          },
                        })
                      }
                      className="text-[10px] text-white bg-emerald-700 hover:bg-emerald-600 px-1.5 py-0.5 rounded"
                    >
                      Übernehmen
                    </button>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {aiSuggestions.improvedProblemStatement}
                  </p>
                </div>
              )}

              {aiSuggestions.suggestedObjectives && aiSuggestions.suggestedObjectives.length > 0 && (
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="font-semibold text-emerald-400 mb-1">Empfohlene SMART-Ziele</div>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                    {aiSuggestions.suggestedObjectives.map((so, idx) => (
                      <li key={idx}>{so}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiSuggestions.inclusionRecommendations && (
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="font-semibold text-amber-400 mb-1">Inklusions-Hinweis</div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {aiSuggestions.inclusionRecommendations}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Füllen Sie Titel, Problemstellung und Lösungsansatz aus und klicken Sie auf &quot;Antrag
                analysieren&quot;, um qualitätsgeprüfte Verbesserungsvorschläge zu erhalten.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
