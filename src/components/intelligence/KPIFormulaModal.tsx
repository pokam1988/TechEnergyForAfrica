import React from 'react';
import { X, Calculator, Info, ShieldCheck, AlertCircle } from 'lucide-react';
import { KPICardDef } from './types';

interface KPIFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKpi?: KPICardDef | null;
  allKpis: KPICardDef[];
}

export const KPIFormulaModal: React.FC<KPIFormulaModalProps> = ({
  isOpen,
  onClose,
  selectedKpi,
  allKpis,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Dokumentierte Berechnungsvorschriften der Executive-KPIs
              </h3>
              <p className="text-xs text-slate-500">
                TEFA Project Intelligence Controlling-Standards & Evidenz-Governance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Nicht-Verfälschungs-Prinzip:</strong> Unbekannte, unvollständige oder noch nicht erhobene Daten dürfen gemäß TEFA-Richtlinien niemals stillschweigend als 0 dargestellt werden, sondern sind transparent als &quot;N/A&quot; bzw. &quot;Nicht erfasst&quot; auszuweisen.
            </div>
          </div>

          <div className="space-y-3">
            {allKpis.map((kpi, idx) => {
              const isSelected = selectedKpi?.id === kpi.id;
              return (
                <div
                  key={kpi.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      KPI #{idx + 1}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900">
                      Aktueller Wert: {kpi.isUnknown ? 'N/A' : kpi.value}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{kpi.label}</h4>
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 font-mono">
                    <div className="text-slate-500 text-[11px] mb-0.5 uppercase tracking-wide font-sans font-semibold">
                      Berechnungsformel & Datenquellen:
                    </div>
                    {kpi.formulaRule}
                  </div>
                  {kpi.isUnknown && (
                    <div className="mt-2 text-xs text-rose-700 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Status: {kpi.unknownReason || 'Noch keine verifizierten Nachweise vorhanden.'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
