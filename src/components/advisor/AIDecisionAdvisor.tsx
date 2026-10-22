import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { DecisionRecord, DecisionOption, DecisionCriterion } from '../../types';
import {
  Compass,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldCheck,
  FileCheck,
  Info,
} from 'lucide-react';

export const AIDecisionAdvisor: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuthRole();
  const { activeProject, updateProject } = useProjects();

  const [selectedDecisionId, setSelectedDecisionId] = useState<string>(() => {
    return activeProject?.decisions[0]?.id || 'new';
  });

  // Active or draft decision being edited
  const [currentDecision, setCurrentDecision] = useState<DecisionRecord>(() => {
    if (activeProject && activeProject.decisions.length > 0) {
      return JSON.parse(JSON.stringify(activeProject.decisions[0]));
    }
    return createEmptyDecision();
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  function createEmptyDecision(): DecisionRecord {
    return {
      id: 'dec_' + Date.now(),
      decisionTitle: 'Strategische Weichenstellung: Hardware-Beschaffung & Logistik',
      problemStatement:
        'Soll das Projekt refurbished Business-Laptops aus Deutschland importieren oder vor Ort in Douala beschaffen?',
      analysisType: 'swot',
      criteria: [
        { id: 'c1', name: 'Gesamtkosten & Zollabgaben', weight: 9 },
        { id: 'c2', name: 'Energieverbrauch & Solarkompatibilität', weight: 8 },
        { id: 'c3', name: 'Akkupuffer bei Netzausfall', weight: 7 },
        { id: 'c4', name: 'Lokale Wartbarkeit in Kamerun', weight: 8 },
      ],
      options: [
        {
          id: 'opt_1',
          title: 'Option A: Spendenflotte aus Deutschland importieren',
          description: '25 generalüberholte ThinkPads per Seefracht nach Douala transportieren.',
          pros: ['Geräte kostenlos aus Unternehmensspende', 'Integrierter Akku überbrückt Stromausfälle'],
          cons: ['Zollabwicklung im Hafen Douala risikobehaftet', 'Lieferzeit 6-8 Wochen'],
          swot: {
            strengths: ['Robustheit', 'Batteriepuffer'],
            weaknesses: ['Zolldauer'],
            opportunities: ['CSR-Partnerschaften'],
            threats: ['Lagergebühren im Hafen'],
          },
        },
        {
          id: 'opt_2',
          title: 'Option B: Lokale Beschaffung von Mini-PCs in Douala',
          description: '20 sparsame Celeron Mini-PCs und Bildschirme vor Ort im Handel kaufen.',
          pros: ['Sofortige Verfügbarkeit', 'Lokale Händlergewährleistung'],
          cons: ['Hohe Anschaffungskosten (€7.000)', 'Kein interner Akku: Dauerhafte USV nötig'],
          swot: {
            strengths: ['Verfügbarkeit', 'Händlergarantie'],
            weaknesses: ['Hohe Ausgaben'],
            opportunities: ['Lokale Wertschöpfung'],
            threats: ['Plagiate auf lokalem Markt'],
          },
        },
      ],
      status: 'draft',
    };
  }

  // Switch decision record
  const handleSelectDecision = (decId: string) => {
    setSelectedDecisionId(decId);
    if (decId === 'new') {
      setCurrentDecision(createEmptyDecision());
    } else {
      const found = activeProject?.decisions.find((d) => d.id === decId);
      if (found) setCurrentDecision(JSON.parse(JSON.stringify(found)));
    }
  };

  // Run AI Advisor
  const handleRunAiAnalysis = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decisionTitle: currentDecision.decisionTitle,
          problemStatement: currentDecision.problemStatement,
          analysisType: currentDecision.analysisType,
          criteria: currentDecision.criteria,
          options: currentDecision.options,
          projectContext: activeProject?.shortDescription || '',
          lang: language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedDecision: DecisionRecord = {
          ...currentDecision,
          aiAnalysis: {
            recommendation: data.recommendation || '',
            reasoning: data.reasoning || '',
            assumptions: data.assumptions || [],
            missingInfo: data.missingInfo || [],
            limitations: data.limitations || [],
            generatedAt: new Date().toISOString(),
          },
          status: 'ai_analyzed',
        };

        // Merge option SWOT/scores if returned
        if (Array.isArray(data.optionEvaluations)) {
          updatedDecision.options = updatedDecision.options.map((opt) => {
            const ev = data.optionEvaluations.find((e: { optionId: string }) => e.optionId === opt.id);
            if (ev) {
              return {
                ...opt,
                swot: ev.swot || opt.swot,
                pros: ev.pros || opt.pros,
                cons: ev.cons || opt.cons,
                totalWeightedScore: ev.suggestedScore || opt.totalWeightedScore,
              };
            }
            return opt;
          });
        }

        setCurrentDecision(updatedDecision);
        setSaveMsg('KI-Analyse erfolgreich generiert. Bitte prüfen Sie Annahmen und Grenzen vor dem Beschluss.');
        setTimeout(() => setSaveMsg(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Save decision to activeProject
  const handleSaveDecisionRecord = async () => {
    if (!activeProject) return;
    const existingIndex = activeProject.decisions.findIndex((d) => d.id === currentDecision.id);
    let updatedDecisions: DecisionRecord[];
    if (existingIndex >= 0) {
      updatedDecisions = [...activeProject.decisions];
      updatedDecisions[existingIndex] = currentDecision;
    } else {
      updatedDecisions = [currentDecision, ...activeProject.decisions];
    }

    await updateProject({
      ...activeProject,
      decisions: updatedDecisions,
    });
    setSaveMsg('Entscheidungsdossier dauerhaft im Projekt gespeichert.');
    setTimeout(() => setSaveMsg(null), 4000);
  };

  // Add Option
  const handleAddOption = () => {
    const newOpt: DecisionOption = {
      id: 'opt_' + Date.now(),
      title: `Option ${String.fromCharCode(65 + currentDecision.options.length)}: Neue Handlungsalternative`,
      description: '',
      pros: [''],
      cons: [''],
    };
    setCurrentDecision({
      ...currentDecision,
      options: [...currentDecision.options, newOpt],
    });
  };

  // Add Criterion
  const handleAddCriterion = () => {
    const newCrit: DecisionCriterion = {
      id: 'c_' + Date.now(),
      name: 'Neues Bewertungskriterium',
      weight: 5,
    };
    setCurrentDecision({
      ...currentDecision,
      criteria: [...currentDecision.criteria, newCrit],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Modul B
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Entscheidungs-Governance & Tiebreaker
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            KI-Projektberater & Entscheidungsunterstützung (Tiebreaker)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Strukturierte Abwägung von Handlungsalternativen (SWOT, Pro/Contra, Nutzwertanalyse) mit
            strenger Trennung von KI-Empfehlung und menschlichem Beschluss.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Decision Selector */}
          <select
            value={selectedDecisionId}
            onChange={(e) => handleSelectDecision(e.target.value)}
            className="text-xs p-2 border border-slate-300 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {activeProject?.decisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.decisionTitle}
              </option>
            ))}
            <option value="new">+ Neue Entscheidung anlegen</option>
          </select>

          <button
            onClick={handleSaveDecisionRecord}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <FileCheck className="w-4 h-4" />
            <span>Beschluss speichern</span>
          </button>
        </div>
      </div>

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Decision Setup Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Entscheidungstitel *
            </label>
            <input
              type="text"
              value={currentDecision.decisionTitle}
              onChange={(e) =>
                setCurrentDecision({ ...currentDecision, decisionTitle: e.target.value })
              }
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Analyse-Methode *
            </label>
            <select
              value={currentDecision.analysisType}
              onChange={(e) =>
                setCurrentDecision({
                  ...currentDecision,
                  analysisType: e.target.value as DecisionRecord['analysisType'],
                })
              }
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="swot">SWOT-Analyse (Stärken, Schwächen, Chancen, Risiken)</option>
              <option value="pros_cons">Pro- & Contra-Gegenüberstellung</option>
              <option value="weighted_matrix">Gewichtete Nutzwertmatrix</option>
              <option value="cost_benefit">Kosten-Nutzen-Analyse</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Problemstellung & Dilemma
          </label>
          <textarea
            rows={2}
            value={currentDecision.problemStatement}
            onChange={(e) =>
              setCurrentDecision({ ...currentDecision, problemStatement: e.target.value })
            }
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Criteria with weights */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-blue-600" />
              Bewertungskriterien & Gewichtung (1-10)
            </span>
            <button
              onClick={handleAddCriterion}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kriterium hinzufügen</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {currentDecision.criteria.map((crit, idx) => (
              <div key={crit.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <input
                  type="text"
                  value={crit.name}
                  onChange={(e) => {
                    const updated = [...currentDecision.criteria];
                    updated[idx].name = e.target.value;
                    setCurrentDecision({ ...currentDecision, criteria: updated });
                  }}
                  className="w-full text-xs font-medium bg-transparent border-b border-slate-300 pb-1 mb-2 focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Gewicht: {crit.weight}</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={crit.weight}
                    onChange={(e) => {
                      const updated = [...currentDecision.criteria];
                      updated[idx].weight = parseInt(e.target.value);
                      setCurrentDecision({ ...currentDecision, criteria: updated });
                    }}
                    className="w-24 accent-blue-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alternatives List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Zu vergleichende Handlungsoptionen ({currentDecision.options.length})
          </h2>
          <button
            onClick={handleAddOption}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Alternative hinzufügen</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentDecision.options.map((option, optIdx) => (
            <div
              key={option.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    value={option.title}
                    onChange={(e) => {
                      const updated = [...currentDecision.options];
                      updated[optIdx].title = e.target.value;
                      setCurrentDecision({ ...currentDecision, options: updated });
                    }}
                    className="font-bold text-sm text-slate-900 w-full border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none"
                  />
                  {currentDecision.options.length > 2 && (
                    <button
                      onClick={() => {
                        const updated = currentDecision.options.filter((_, i) => i !== optIdx);
                        setCurrentDecision({ ...currentDecision, options: updated });
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={option.description}
                  onChange={(e) => {
                    const updated = [...currentDecision.options];
                    updated[optIdx].description = e.target.value;
                    setCurrentDecision({ ...currentDecision, options: updated });
                  }}
                  placeholder="Beschreibung der Handlungsalternative..."
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-3"
                />

                {/* SWOT Display if available */}
                {option.swot && (
                  <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                    <div className="bg-emerald-50 p-2 rounded border border-emerald-100 text-emerald-900">
                      <span className="font-bold block text-[10px] uppercase text-emerald-800">
                        Stärken (S)
                      </span>
                      {option.swot.strengths.join(', ')}
                    </div>
                    <div className="bg-rose-50 p-2 rounded border border-rose-100 text-rose-900">
                      <span className="font-bold block text-[10px] uppercase text-rose-800">
                        Schwächen (W)
                      </span>
                      {option.swot.weaknesses.join(', ')}
                    </div>
                    <div className="bg-blue-50 p-2 rounded border border-blue-100 text-blue-900">
                      <span className="font-bold block text-[10px] uppercase text-blue-800">
                        Chancen (O)
                      </span>
                      {option.swot.opportunities.join(', ')}
                    </div>
                    <div className="bg-amber-50 p-2 rounded border border-amber-100 text-amber-900">
                      <span className="font-bold block text-[10px] uppercase text-amber-800">
                        Risiken (T)
                      </span>
                      {option.swot.threats.join(', ')}
                    </div>
                  </div>
                )}

                {/* Pros and Cons */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-emerald-700 block mb-1">Vorteile:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                      {option.pros.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold text-rose-700 block mb-1">Nachteile:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                      {option.cons.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {option.totalWeightedScore && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Nutzwert-Score:</span>
                  <span className="font-bold text-blue-700 text-sm">
                    {option.totalWeightedScore.toFixed(1)} / 10
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Run & Analysis Display */}
      <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                Gemini Tiebreaker Analyse & Begründung
              </h2>
              <p className="text-[11px] text-slate-400">
                Vergleichende multikriterielle Auswertung unter Offenlegung von Annahmen und Lücken
              </p>
            </div>
          </div>

          <button
            onClick={handleRunAiAnalysis}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
          >
            {aiLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>KI analysiert Handlungsoptionen...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Entscheidungsanalyse mit Gemini KI starten</span>
              </>
            )}
          </button>
        </div>

        {/* AI Results */}
        {currentDecision.aiAnalysis ? (
          <div className="space-y-4 pt-3 border-t border-slate-800 text-xs">
            <div className="bg-blue-950/50 border border-blue-800/80 p-4 rounded-lg">
              <div className="font-bold text-blue-300 text-sm mb-1 flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Empfehlung der KI (Unverbindlicher Beratungsvorschlag)</span>
              </div>
              <p className="text-slate-200 leading-relaxed">
                {currentDecision.aiAnalysis.recommendation}
              </p>
              <div className="mt-2 text-slate-300 text-[11px] leading-relaxed border-t border-blue-900/60 pt-2">
                <span className="font-semibold text-white">Analytische Begründung: </span>
                {currentDecision.aiAnalysis.reasoning}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-bold text-emerald-400 block mb-1">Getroffene Annahmen</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {currentDecision.aiAnalysis.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-bold text-amber-400 block mb-1">Fehlende Informationen</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {currentDecision.aiAnalysis.missingInfo.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                <span className="font-bold text-rose-400 block mb-1">Grenzen der Analyse</span>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                  {currentDecision.aiAnalysis.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Klicken Sie auf &quot;Entscheidungsanalyse mit Gemini KI starten&quot;, um eine
              wissenschaftlich fundierte multikriterielle Auswertung für das TEFA-Vorhaben zu berechnen.
            </span>
          </div>
        )}
      </div>

      {/* Human Binding Decision Section */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Formeller menschlicher Beschluss (Human Decision & Governance)
          </h2>
        </div>
        <p className="text-xs text-slate-600">
          Entscheidungen dürfen niemals vollautomatisiert durch KI getroffen werden. Ein berechtigtes
          TEFA-Mitglied oder Vorstandsmitglied muss die gewählte Option mit Begründung autorisieren.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Gewählte Handlungsalternative *
            </label>
            <select
              value={currentDecision.humanDecision?.selectedOptionId || ''}
              onChange={(e) =>
                setCurrentDecision({
                  ...currentDecision,
                  humanDecision: {
                    selectedOptionId: e.target.value,
                    decisionRationale: currentDecision.humanDecision?.decisionRationale || '',
                    decidedBy: currentUser.name,
                    decidedAt: new Date().toISOString(),
                  },
                  status: 'human_decided',
                })
              }
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">-- Alternative auswählen --</option>
              {currentDecision.options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Beschluss gefasst durch (Name & Rolle)
            </label>
            <input
              type="text"
              readOnly
              value={`${currentUser.name} (${currentUser.role})`}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Begründung des Beschlusses (Decision Rationale) *
          </label>
          <textarea
            rows={3}
            value={currentDecision.humanDecision?.decisionRationale || ''}
            onChange={(e) =>
              setCurrentDecision({
                ...currentDecision,
                humanDecision: {
                  selectedOptionId: currentDecision.humanDecision?.selectedOptionId || '',
                  decisionRationale: e.target.value,
                  decidedBy: currentUser.name,
                  decidedAt: new Date().toISOString(),
                },
                status: 'human_decided',
              })
            }
            placeholder="Erläutern Sie die Gründe für diese Entscheidung und wie mit identifizierten Risiken umgegangen wird..."
            className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveDecisionRecord}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Beschluss formell im Projekt archivieren</span>
          </button>
        </div>
      </div>
    </div>
  );
};
