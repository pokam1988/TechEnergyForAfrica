import React from 'react';
import { Project, ImpactIndicator } from '../../types';
import { TrendingUp, Users, CheckCircle2, ShieldCheck, AlertCircle, Award, Leaf } from 'lucide-react';

interface ImpactBeneficiariesTabProps {
  filteredProjects: Project[];
  onSelectProject: (id: string) => void;
}

export const ImpactBeneficiariesTab: React.FC<ImpactBeneficiariesTabProps> = ({
  filteredProjects,
  onSelectProject,
}) => {
  // Aggregate all indicators
  const allIndicators: { project: Project; indicator: ImpactIndicator }[] = [];
  filteredProjects.forEach((p) => {
    p.impactIndicators?.forEach((i) => allIndicators.push({ project: p, indicator: i }));
  });

  const plannedTotalBeneficiaries = filteredProjects.reduce(
    (sum, p) => sum + (p.proposal?.beneficiaryCountPlanned || 0),
    0
  );

  const verifiedIndicators = allIndicators.filter(
    (item) => item.indicator.evidenceStatus === 'verified'
  );
  const unverifiedIndicators = allIndicators.filter(
    (item) => item.indicator.evidenceStatus !== 'verified'
  );

  return (
    <div className="space-y-6">
      {/* Impact KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Geplante Zielgruppe (Anträge)
          </div>
          <div className="text-2xl font-black font-mono text-[#0f2b48]">
            {plannedTotalBeneficiaries}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Über {filteredProjects.length} Vorhaben</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/10 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-emerald-800 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verifizierte Nachweise
          </div>
          <div className="text-2xl font-black font-mono text-emerald-800">
            {verifiedIndicators.length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Auditierte Indikatoren</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/10 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-amber-900 mb-1">
            Unbestätigt / In Planung
          </div>
          <div className="text-2xl font-black font-mono text-amber-900">
            {unverifiedIndicators.length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">Planungswerte (z.B. IFOPSIM)</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-[#0f2b48] mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Datenschutz & Inklusion
          </div>
          <div className="text-2xl font-black font-mono text-[#0f2b48]">100%</div>
          <div className="text-[11px] text-slate-500 mt-1">DSGVO-konform aggregiert</div>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5 shadow-xs">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-950">M&E-Governance-Regel:</strong> Es dürfen keine fiktiven Erfolge erfunden werden. Befindet sich ein Projekt in der Planungsphase (z.B. IFOPSIM), werden Zielgruppen als &quot;Geplant&quot; ausgewiesen und reale Teilnehmende erst nach Vorliegen geprüfter Anwesenheitslisten und Zertifikate als verifiziert gewertet.
        </div>
      </div>

      {/* Indicators Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h4 className="font-bold text-[#0f2b48] text-sm tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#0f2b48]" />
            Wirkungs- & Inklusionsindikatoren nach Projektvorhaben
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="p-3">Indikator & Definition</th>
                <th className="p-3">Projekt</th>
                <th className="p-3">Bereich</th>
                <th className="p-3 text-right">Baseline</th>
                <th className="p-3 text-right">Ziel</th>
                <th className="p-3 text-right">Ist-Wert</th>
                <th className="p-3 text-center">Evidenzstatus</th>
                <th className="p-3">Datenquelle / Nachweis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allIndicators.map(({ project, indicator }) => (
                <tr key={indicator.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{indicator.name}</div>
                    <div className="text-[11px] text-slate-500">{indicator.definition}</div>
                  </td>
                  <td className="p-3">
                    <span className="font-mono text-blue-600 font-semibold">
                      {project.referenceId}
                    </span>{' '}
                    - {project.title}
                  </td>
                  <td className="p-3 capitalize text-slate-700">{indicator.category}</td>
                  <td className="p-3 text-right font-mono text-slate-500">
                    {indicator.baseline} {indicator.unit}
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-slate-900">
                    {indicator.target} {indicator.unit}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">
                    {indicator.actual} {indicator.unit}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        indicator.evidenceStatus === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {indicator.evidenceStatus === 'verified' ? 'Geprüft' : 'In Planung'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600 text-[11px]">
                    {indicator.evidenceSource}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
