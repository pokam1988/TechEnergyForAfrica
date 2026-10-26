import React from 'react';
import { Project, RiskItem } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

interface RisksComplianceTabProps {
  filteredProjects: Project[];
  onSelectProject: (id: string) => void;
}

export const RisksComplianceTab: React.FC<RisksComplianceTabProps> = ({
  filteredProjects,
  onSelectProject,
}) => {
  // Aggregate risks
  const allRisks: { project: Project; risk: RiskItem }[] = [];
  filteredProjects.forEach((p) => {
    p.risks?.forEach((r) => allRisks.push({ project: p, risk: r }));
  });

  const activeRisks = allRisks.filter((r) => r.risk.status === 'active');
  const criticalRisks = activeRisks.filter(
    (r) => r.risk.impact === 'high' && r.risk.probability === 'high'
  );
  const highRisks = activeRisks.filter(
    (r) =>
      (r.risk.impact === 'high' && r.risk.probability !== 'high') ||
      (r.risk.probability === 'high' && r.risk.impact !== 'high')
  );
  const mediumLowRisks = activeRisks.filter(
    (r) => r.risk.impact !== 'high' && r.risk.probability !== 'high'
  );

  return (
    <div className="space-y-6">
      {/* Risk Profile KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-1">Erfasste Risikopositionen</div>
          <div className="text-2xl font-bold font-mono text-slate-900">{allRisks.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">{activeRisks.length} aktiv überwacht</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20">
          <div className="text-xs font-semibold text-rose-700 mb-1 flex items-center gap-1">
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Kritische Risiken (Rot)
          </div>
          <div className="text-2xl font-bold font-mono text-rose-800">{criticalRisks.length}</div>
          <div className="text-[11px] text-rose-600 mt-1">Hohe WSK + Hoher Schaden</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20">
          <div className="text-xs font-semibold text-amber-700 mb-1 flex items-center gap-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Hohe Risiken (Gelb)
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800">{highRisks.length}</div>
          <div className="text-[11px] text-amber-600 mt-1">Erhöhte Überwachung</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20">
          <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Geringe / Mittlere Risiken
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800">
            {mediumLowRisks.length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Standardkontrollen</div>
        </div>
      </div>

      {/* 3x3 Risk Matrix Visualization */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-[#0f2b48] text-base flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#0f2b48]" />
            TEFA Risikomatrix (Eintrittswahrscheinlichkeit vs. Schadensausmaß)
          </h4>
          <span className="text-xs text-slate-500">
            Farbkodierung: Grün (Niedrig) • Gelb (Mittel/Hoch) • Rot (Kritisch)
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {/* Header row */}
          <div className="p-2 font-bold text-slate-400">WSK / Schaden</div>
          <div className="p-2 bg-slate-50 font-bold text-slate-700 rounded">Gering</div>
          <div className="p-2 bg-slate-50 font-bold text-slate-700 rounded">Mittel</div>
          <div className="p-2 bg-slate-50 font-bold text-slate-700 rounded">Hoch</div>

          {/* Row: High Prob */}
          <div className="p-2 bg-slate-50 font-bold text-slate-700 rounded flex items-center justify-center">
            Hoch
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded font-mono font-bold text-amber-800">
            {
              activeRisks.filter(
                (r) => r.risk.probability === 'high' && r.risk.impact === 'low'
              ).length
            }{' '}
            Risiken
          </div>
          <div className="p-3 bg-amber-100 border border-amber-300 rounded font-mono font-bold text-amber-900">
            {
              activeRisks.filter(
                (r) => r.risk.probability === 'high' && r.risk.impact === 'medium'
              ).length
            }{' '}
            Risiken
          </div>
          <div className="p-3 bg-rose-100 border border-rose-300 rounded font-mono font-bold text-rose-900">
            {criticalRisks.length} Kritisch
          </div>

          {/* Row: Medium Prob */}
          <div className="p-2 bg-slate-50 font-bold text-slate-700 rounded flex items-center justify-center">
            Mittel
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded font-mono font-bold text-emerald-800">
            {
              activeRisks.filter(
                (r) => r.risk.probability === 'medium' && r.risk.impact === 'low'
              ).length
            }{' '}
            Risiken
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded font-mono font-bold text-amber-800">
            {
              activeRisks.filter(
                (r) => r.risk.probability === 'medium' && r.risk.impact === 'medium'
              ).length
            }{' '}
            Risiken
          </div>
          <div className="p-3 bg-amber-100 border border-amber-300 rounded font-mono font-bold text-amber-900">
            {
              activeRisks.filter(
                (r) => r.risk.probability === 'medium' && r.risk.impact === 'high'
              ).length
            }{' '}
            Risiken
          </div>

          {/* Row: Low Prob */}
          <div className="p-2 bg-slate-50 font-bold text-slate-700 rounded flex items-center justify-center">
            Gering
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded font-mono font-bold text-emerald-800">
            {
              activeRisks.filter((r) => r.risk.probability === 'low' && r.risk.impact === 'low')
                .length
            }{' '}
            Risiken
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded font-mono font-bold text-emerald-800">
            {
              activeRisks.filter(
                (r) => r.risk.probability === 'low' && r.risk.impact === 'medium'
              ).length
            }{' '}
            Risiken
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded font-mono font-bold text-amber-800">
            {
              activeRisks.filter((r) => r.risk.probability === 'low' && r.risk.impact === 'high')
                .length
            }{' '}
            Risiken
          </div>
        </div>
      </div>

      {/* Risks Detailed Register */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
            Risikoregister & Gegenmaßnahmen ({activeRisks.length} aktive Positionen)
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="p-3">Risikobeschreibung & Kategorie</th>
                <th className="p-3">Projekt</th>
                <th className="p-3 text-center">WSK</th>
                <th className="p-3 text-center">Schaden</th>
                <th className="p-3">Minderungsstrategie (Mitigation)</th>
                <th className="p-3">Verantwortlich</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeRisks.map(({ project, risk }) => {
                const isCrit = risk.impact === 'high' && risk.probability === 'high';
                return (
                  <tr key={risk.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{risk.description}</div>
                      <div className="text-[11px] text-slate-500 capitalize">{risk.category}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-blue-600 font-semibold">
                        {project.referenceId}
                      </span>{' '}
                      - {project.title}
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold capitalize bg-slate-100 text-slate-800">
                        {risk.probability}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold capitalize ${
                          risk.impact === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {risk.impact}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 max-w-xs">{risk.mitigationStrategy}</td>
                    <td className="p-3 text-slate-600">{risk.responsiblePerson}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
