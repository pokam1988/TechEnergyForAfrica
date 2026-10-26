import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ExternalLink,
  HelpCircle,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { IntelligenceFilters } from './types';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: IntelligenceFilters;
  onSelectProject?: (projectId: string) => void;
}

interface AssistantResponse {
  answer: string;
  facts: string[];
  recommendations: string[];
  references: { id: string; referenceId: string; title: string; metric?: string }[];
  dataLimitations: string[];
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onSelectProject,
}) => {
  const { currentUser } = useAuthRole();
  const { language } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const quickPrompts = [
    'Welche Projekte benötigen dringende Management-Aufmerksamkeit?',
    'Welche Projekte weisen die größte bestätigte Finanzierungslücke auf?',
    'Welche Meilensteine sind aktuell überfällig?',
    'Welche Förderanträge sind noch in Prüfung?',
    'Welche Ausgaben weisen fehlende Belegnachweise auf?',
    'Was sind die gravierendsten Umsetzungsrisiken im Portfolio?',
  ];

  const handleRunQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/intelligence/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'visitor',
          'x-user-id': currentUser?.id || 'anonymous',
          'x-user-name': currentUser?.name || 'Anonymous',
        },
        body: JSON.stringify({
          query: queryText,
          lang: language || 'de',
          filters,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: unknown) {
      console.error('Error fetching intelligence assistant:', err);
      setErrorMsg('KI-Analyse konnte nicht abgerufen werden. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[540px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">TEFA Intelligence AI Assistant</h3>
            <p className="text-[11px] text-slate-300">
              Grounded Gemini 3.8 Flash • Geprüfte Projektdaten
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick prompt suggestions */}
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Häufige Controlling- & Managementfragen:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(qp);
                  handleRunQuery(qp);
                }}
                className="text-xs text-left bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <div className="text-sm font-semibold text-slate-800">Analysiere Portfoliodaten...</div>
            <div className="text-xs text-slate-500">
              Gleiche Filterkriterien, Finanzposten und Meilensteine ab
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Response view */}
        {response && !isLoading && (
          <div className="space-y-4">
            {/* Primary answer */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Controlling-Befund</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                  Evidenz-Geprüft
                </span>
              </div>
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-line space-y-2">
                {response.answer}
              </div>
            </div>

            {/* Factual findings */}
            {response.facts && response.facts.length > 0 && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <div className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Verifizierte Faktenlage im Datensatz:
                </div>
                <ul className="text-xs text-blue-950 space-y-1.5 list-disc list-inside">
                  {response.facts.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {response.recommendations && response.recommendations.length > 0 && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <div className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  KI-Handlungsempfehlungen (Unverbindlich):
                </div>
                <ul className="text-xs text-emerald-950 space-y-1.5 list-disc list-inside">
                  {response.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* References */}
            {response.references && response.references.length > 0 && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" />
                  Referenzierte Projektdatensätze:
                </div>
                <div className="space-y-1.5">
                  {response.references.map((ref) => (
                    <div
                      key={ref.id}
                      className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-slate-900">{ref.title}</span>
                        <span className="ml-2 font-mono text-[11px] text-blue-600">
                          {ref.referenceId}
                        </span>
                        {ref.metric && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{ref.metric}</div>
                        )}
                      </div>
                      {onSelectProject && (
                        <button
                          onClick={() => onSelectProject(ref.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 bg-white rounded border border-slate-200"
                        >
                          Öffnen <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Limitations & disclaimers */}
            {response.dataLimitations && response.dataLimitations.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                <div className="font-semibold text-amber-950 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Grenzen & Einschränkungen der Analyse:
                </div>
                <ul className="space-y-1 list-disc list-inside text-[11px] text-amber-800">
                  {response.dataLimitations.map((dl, i) => (
                    <li key={i}>{dl}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery(inputQuery);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Frage zu Budget, Meilensteinen, Risiken..."
            className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Fragen
          </button>
        </form>
      </div>
    </div>
  );
};
