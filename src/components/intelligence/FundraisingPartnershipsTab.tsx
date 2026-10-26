import React from 'react';
import { Project, FundingSource, PartnerOpportunity } from '../../types';
import { Users, PiggyBank, Calendar, CheckCircle2, Clock, ShieldCheck, Building } from 'lucide-react';

interface FundraisingPartnershipsTabProps {
  filteredProjects: Project[];
  onSelectProject: (id: string) => void;
}

export const FundraisingPartnershipsTab: React.FC<FundraisingPartnershipsTabProps> = ({
  filteredProjects,
  onSelectProject,
}) => {
  const EUR_TO_XAF = 655.957;

  // Flatten funding sources
  const allFunding: { project: Project; funding: FundingSource }[] = [];
  filteredProjects.forEach((p) => {
    p.fundingSources?.forEach((f) => allFunding.push({ project: p, funding: f }));
  });

  const confirmedSources = allFunding.filter(({ funding }) => funding.status === 'confirmed');
  const pendingSources = allFunding.filter(
    ({ funding }) => funding.status === 'pending_application'
  );
  const pipelineSources = allFunding.filter(
    ({ funding }) => funding.status === 'potential_pipeline'
  );

  const confirmedTotalEUR = confirmedSources.reduce(
    (sum, { funding }) =>
      sum + (funding.currency === 'XAF' ? Math.round(funding.amount / EUR_TO_XAF) : funding.amount),
    0
  );

  const pendingTotalEUR = pendingSources.reduce(
    (sum, { funding }) =>
      sum + (funding.currency === 'XAF' ? Math.round(funding.amount / EUR_TO_XAF) : funding.amount),
    0
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-emerald-200/80 bg-emerald-50/10 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-emerald-800 mb-1">
            Bestätigte Zuwendungen & Grants
          </div>
          <div className="text-2xl font-black font-mono text-emerald-800">
            {confirmedTotalEUR.toLocaleString('de-DE')} €
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">
            {confirmedSources.length} bewilligte Förderungen
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-amber-200/80 bg-amber-50/10 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-amber-900 mb-1">
            Laufende Förderanträge (Pending)
          </div>
          <div className="text-2xl font-black font-mono text-amber-900">
            {pendingTotalEUR.toLocaleString('de-DE')} €
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            {pendingSources.length} Anträge eingereicht
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-xs hover:shadow-sm transition-all">
          <div className="text-xs font-semibold text-[#0f2b48] mb-1">Pipeline & Partnerschaften</div>
          <div className="text-2xl font-black font-mono text-[#0f2b48]">
            {pipelineSources.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Stiftungen & CSR-Kontakte</div>
        </div>
      </div>

      {/* Funding Sources Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h4 className="font-bold text-[#0f2b48] text-sm tracking-tight flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-[#0f2b48]" />
            Finanzierungsquellen & Bewilligungsstatus
          </h4>
          <span className="text-[11px] text-slate-500">
            Strikte Trennung: Beantragt ≠ Bestätigt
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="p-3">Mittelgeber / Geldgeber</th>
                <th className="p-3">Projekt</th>
                <th className="p-3">Typ</th>
                <th className="p-3">Status</th>
                <th className="p-3">Zweckbindung</th>
                <th className="p-3 text-right">Betrag</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allFunding.map(({ project, funding }) => {
                const amountEUR =
                  funding.currency === 'XAF'
                    ? Math.round(funding.amount / EUR_TO_XAF)
                    : funding.amount;
                return (
                  <tr key={funding.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{funding.name}</td>
                    <td className="p-3">
                      <span className="text-blue-600 font-mono font-medium">
                        {project.referenceId}
                      </span>{' '}
                      - {project.title}
                    </td>
                    <td className="p-3 text-slate-600 capitalize">
                      {funding.type.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          funding.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : funding.status === 'pending_application'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {funding.status === 'confirmed'
                          ? 'Bewilligt & Bestätigt'
                          : funding.status === 'pending_application'
                          ? 'Antrag in Prüfung'
                          : 'Potential'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {funding.isRestricted ? (
                        <span className="text-amber-700 font-medium">Zweckgebunden</span>
                      ) : (
                        <span className="text-slate-500">Frei</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {amountEUR.toLocaleString('de-DE')} €
                    </td>
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
