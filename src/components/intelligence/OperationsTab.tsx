import React from 'react';
import { Project } from '../../types';
import { Settings, Monitor, Users, Truck, BatteryCharging, AlertCircle } from 'lucide-react';

interface OperationsTabProps {
  filteredProjects: Project[];
  onSelectProject: (id: string) => void;
}

export const OperationsTab: React.FC<OperationsTabProps> = ({
  filteredProjects,
  onSelectProject,
}) => {
  // Aggregate operational simulation figures
  const totalWorkstations = filteredProjects.reduce(
    (sum, p) => sum + (p.simulationParams?.usableWorkstations || 0),
    0
  );
  const totalTrainers = filteredProjects.reduce(
    (sum, p) => sum + (p.simulationParams?.trainersCount || 0),
    0
  );
  const totalBeneficiaries = filteredProjects.reduce(
    (sum, p) => sum + (p.simulationParams?.beneficiariesCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Operational Capacity KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-blue-600" />
            Einsatzbereite IT-Arbeitsplätze
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalWorkstations}</div>
          <div className="text-[11px] text-slate-400 mt-1">Geplante Schulungsplätze</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-600" />
            Eingesetzte Trainer / Ausbilder
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalTrainers}</div>
          <div className="text-[11px] text-slate-400 mt-1">Fachpersonal vor Ort</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1.5">
            <BatteryCharging className="w-4 h-4 text-amber-600" />
            Solar- & Stromversorgung
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">Aktiv</div>
          <div className="text-[11px] text-emerald-600 mt-1">Batteriepufferung & Generator</div>
        </div>
      </div>

      {/* Projects Operations Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-600" />
            Operative Auslastung & Kapazitätsplanung pro Vorhaben
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="p-3">Projekt</th>
                <th className="p-3">Standort</th>
                <th className="p-3 text-center">Arbeitsplätze</th>
                <th className="p-3 text-center">Schüler / PC</th>
                <th className="p-3 text-center">Trainer</th>
                <th className="p-3 text-center">Dauer (Monate)</th>
                <th className="p-3">Operativer Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.map((p) => {
                const sim = p.simulationParams;
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelectProject(p.id)}
                    className="hover:bg-slate-50 cursor-pointer"
                  >
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{p.title}</div>
                      <div className="font-mono text-[11px] text-blue-600">{p.referenceId}</div>
                    </td>
                    <td className="p-3 text-slate-700">{p.locationDetails || p.country}</td>
                    <td className="p-3 text-center font-mono font-bold text-slate-900">
                      {sim?.usableWorkstations || 'N/A'}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-700">
                      {sim?.studentsPerWorkstation ? `${sim.studentsPerWorkstation}:1` : 'N/A'}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-700">
                      {sim?.trainersCount || 'N/A'}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-700">
                      {sim?.trainingDurationMonths || p.proposal?.durationMonths || 'N/A'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-800">
                        {p.status}
                      </span>
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
