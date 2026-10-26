import React, { useState } from 'react';
import { InventoryAsset, Project } from '../../types';
import {
  Server,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  FileCheck,
  ShieldAlert,
  Wrench,
  HelpCircle,
  Database,
} from 'lucide-react';

interface InventoryAnalyticsTabProps {
  inventory: InventoryAsset[];
  projects: Project[];
}

export const InventoryAnalyticsTab: React.FC<InventoryAnalyticsTabProps> = ({
  inventory,
  projects,
}) => {
  const [selectedEnv, setSelectedEnv] = useState<'all' | 'live' | 'test'>('live');
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  const envFilteredAssets = inventory.filter((item) => {
    if (selectedEnv === 'all') return true;
    return item.environment === selectedEnv;
  });

  // 9 Required Dimensions from Specification
  const offered = envFilteredAssets.filter((i) => i.donationStatus === 'offered').length;
  const pledged = envFilteredAssets.filter((i) => i.donationStatus === 'confirmed').length;
  const inTransit = envFilteredAssets.filter((i) => i.donationStatus === 'shipped' || i.donationStatus === 'in_transit').length;
  const inCustoms = envFilteredAssets.filter((i) => i.donationStatus === 'customs_processing').length;
  const receivedAtSite = envFilteredAssets.filter((i) => i.donationStatus === 'arrived').length;
  const technicallyInspected = envFilteredAssets.filter((i) => i.donationStatus === 'inspected').length;
  const approvedForUse = envFilteredAssets.filter((i) => i.donationStatus === 'approved_for_use').length;
  const requiringRepair = envFilteredAssets.filter((i) => i.operationalCondition === 'needs_repair').length;
  const missingDocumentation = envFilteredAssets.filter((i) => !i.dataWipingEvidence).length;

  const filteredAssets = envFilteredAssets.filter((item) => {
    if (!selectedDimension) return true;
    if (selectedDimension === 'offered') return item.donationStatus === 'offered';
    if (selectedDimension === 'confirmed') return item.donationStatus === 'confirmed';
    if (selectedDimension === 'in_transit') return item.donationStatus === 'shipped' || item.donationStatus === 'in_transit';
    if (selectedDimension === 'customs_processing') return item.donationStatus === 'customs_processing';
    if (selectedDimension === 'arrived') return item.donationStatus === 'arrived';
    if (selectedDimension === 'inspected') return item.donationStatus === 'inspected';
    if (selectedDimension === 'approved_for_use') return item.donationStatus === 'approved_for_use';
    if (selectedDimension === 'needs_repair') return item.operationalCondition === 'needs_repair';
    if (selectedDimension === 'missing_doc') return !item.dataWipingEvidence;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Environment Filter & Governance Rule Banner */}
      <div className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-bold text-[#0f2b48] text-base flex items-center gap-2">
            <Server className="w-4 h-4 text-[#0f2b48]" />
            Geräte-, IT- & Anlagencontrolling (9 Kern-Dimensionen)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Strikte Unabhängigkeit: Physischer Standort ≠ Eigentum ≠ Versandstatus ≠ Technische Freigabe
          </p>
        </div>

        {/* Environment toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setSelectedEnv('live')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              selectedEnv === 'live'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            LIVE_INVENTAR ({inventory.filter((i) => i.environment === 'live').length})
          </button>
          <button
            onClick={() => setSelectedEnv('test')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              selectedEnv === 'test'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TESTDATEN ({inventory.filter((i) => i.environment === 'test').length})
          </button>
          <button
            onClick={() => setSelectedEnv('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
              selectedEnv === 'all'
                ? 'bg-[#0f2b48] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alle ({inventory.length})
          </button>
        </div>
      </div>

      {/* Compliance Rule Alert */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5 shadow-xs">
        <ShieldAlert className="w-4 h-4 text-[#0f2b48] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#0f2b48]">TEFA-Sicherheitsregel:</strong> Ein Gerät darf unter keinen Umständen als &quot;betriebsbereit / operational&quot; gezählt werden, solange nicht die formale technische Abnahme (&apos;approved_for_use&apos;) und die Datenlöschprüfung dokumentiert sind.
        </div>
      </div>

      {/* 9 Dimensions Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div
          onClick={() => setSelectedDimension(selectedDimension === 'offered' ? null : 'offered')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDimension === 'offered'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">1. Angeboten</div>
          <div className="text-xl font-bold font-mono text-slate-800">{offered}</div>
          <div className="text-[10px] text-slate-400 mt-1">Spendenangebot</div>
        </div>

        <div
          onClick={() => setSelectedDimension(selectedDimension === 'confirmed' ? null : 'confirmed')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDimension === 'confirmed'
              ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-300'
              : 'bg-white border-slate-200 hover:border-blue-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">2. Zugesagt</div>
          <div className="text-xl font-bold font-mono text-blue-800">{pledged}</div>
          <div className="text-[10px] text-blue-600 mt-1">Vertraglich bestätigt</div>
        </div>

        <div
          onClick={() => setSelectedDimension(selectedDimension === 'in_transit' ? null : 'in_transit')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDimension === 'in_transit'
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">3. In Transit / Versand</div>
          <div className="text-xl font-bold font-mono text-amber-800">{inTransit}</div>
          <div className="text-[10px] text-amber-600 mt-1">Auf dem Seeweg / Transport</div>
        </div>

        <div
          onClick={() => setSelectedDimension(selectedDimension === 'customs_processing' ? null : 'customs_processing')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDimension === 'customs_processing'
              ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300'
              : 'bg-white border-slate-200 hover:border-purple-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">4. In Zollabfertigung</div>
          <div className="text-xl font-bold font-mono text-purple-800">{inCustoms}</div>
          <div className="text-[10px] text-purple-600 mt-1">Zollhafen Douala</div>
        </div>

        <div
          onClick={() => setSelectedDimension(selectedDimension === 'arrived' ? null : 'arrived')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDimension === 'arrived'
              ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300'
              : 'bg-white border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">5. Am Projektstandort</div>
          <div className="text-xl font-bold font-mono text-indigo-800">{receivedAtSite}</div>
          <div className="text-[10px] text-indigo-600 mt-1">Physisch eingetroffen</div>
        </div>

        <div
          onClick={() => setSelectedDimension(selectedDimension === 'inspected' ? null : 'inspected')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDimension === 'inspected'
              ? 'bg-cyan-50 border-cyan-500 ring-2 ring-cyan-300'
              : 'bg-white border-slate-200 hover:border-cyan-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">6. Technisch geprüft</div>
          <div className="text-xl font-bold font-mono text-cyan-800">{technicallyInspected}</div>
          <div className="text-[10px] text-cyan-600 mt-1">Inspektion abgeschlossen</div>
        </div>

        <div
          onClick={() => setSelectedDimension(selectedDimension === 'approved_for_use' ? null : 'approved_for_use')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDimension === 'approved_for_use'
              ? 'bg-emerald-100 border-emerald-600 ring-2 ring-emerald-300'
              : 'bg-emerald-50/40 border-emerald-300 hover:border-emerald-500'
          }`}
        >
          <div className="text-[11px] font-semibold text-emerald-800 mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 7. Einsatzbereit (Freigegeben)
          </div>
          <div className="text-xl font-bold font-mono text-emerald-900">{approvedForUse}</div>
          <div className="text-[10px] text-emerald-700 mt-1">Einzig operative Geräte</div>
        </div>

        <div
          onClick={() => setSelectedDimension(selectedDimension === 'needs_repair' ? null : 'needs_repair')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedDimension === 'needs_repair'
              ? 'bg-rose-100 border-rose-500 ring-2 ring-rose-300'
              : 'bg-rose-50/40 border-rose-200 hover:border-rose-400'
          }`}
        >
          <div className="text-[11px] font-semibold text-rose-800 mb-1 flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-rose-600" /> 8. Reparatur nötig
          </div>
          <div className="text-xl font-bold font-mono text-rose-900">{requiringRepair}</div>
          <div className="text-[10px] text-rose-700 mt-1">Defekt oder unvollständig</div>
        </div>

        <div
          onClick={() => setSelectedDimension(selectedDimension === 'missing_doc' ? null : 'missing_doc')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all col-span-2 ${
            selectedDimension === 'missing_doc'
              ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-300'
              : 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
          }`}
        >
          <div className="text-[11px] font-semibold text-amber-800 mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 9. Fehlende Dokumentation / Datenlöschung
          </div>
          <div className="text-xl font-bold font-mono text-amber-900">{missingDocumentation}</div>
          <div className="text-[10px] text-amber-700 mt-1">Kein DSGVO-Löschnachweis hinterlegt</div>
        </div>
      </div>

      {/* Asset Table with Active Filter Banner */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Gefilterte Inventaranlagen ({filteredAssets.length} Datensätze)
            </h4>
            {selectedDimension && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                Gefiltert nach: {selectedDimension}
                <button
                  onClick={() => setSelectedDimension(null)}
                  className="ml-1 text-blue-600 hover:text-blue-900 font-bold"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Umgebung: {selectedEnv.toUpperCase()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="p-3">Asset-Tag</th>
                <th className="p-3">Kategorie & Modell</th>
                <th className="p-3">Standort</th>
                <th className="p-3">Eigentümer</th>
                <th className="p-3">Status</th>
                <th className="p-3">Zustand</th>
                <th className="p-3 text-center">Löschzertifikat</th>
                <th className="p-3 text-center">Betriebsfreigabe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => {
                const isApproved = asset.donationStatus === 'approved_for_use';
                return (
                  <tr key={asset.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-600">
                      {asset.assetTag}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{asset.manufacturerModel}</div>
                      <div className="text-[11px] text-slate-500">{asset.category}</div>
                    </td>
                    <td className="p-3 text-slate-700">{asset.location}</td>
                    <td className="p-3 text-slate-700">{asset.ownership}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-slate-100 text-slate-800 capitalize">
                        {asset.donationStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          asset.operationalCondition === 'needs_repair'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {asset.operationalCondition}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {asset.dataWipingEvidence ? (
                        <span className="inline-flex items-center text-emerald-700 font-bold gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Geprüft
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-amber-700 font-bold gap-1 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5" /> Ausstehend
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      {isApproved ? (
                        <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                          Freigegeben
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 font-medium text-[11px]">
                          Nicht freigegeben
                        </span>
                      )}
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
