import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { InventoryAsset } from '../../types';
import { SEED_INVENTORY } from '../../data/seedProjects';
import {
  Server,
  Plus,
  CheckCircle2,
  Check,
  AlertTriangle,
  Building,
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser, canEditProject } = useAuthRole();
  const { activeProject } = useProjects();

  const [environment, setEnvironment] = useState<'live' | 'test'>('test');
  const [assets, setAssets] = useState<InventoryAsset[]>(() => {
    const saved = localStorage.getItem('tefa_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return SEED_INVENTORY;
  });

  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const saveInventory = (newAssets: InventoryAsset[]) => {
    setAssets(newAssets);
    localStorage.setItem('tefa_inventory', JSON.stringify(newAssets));
  };

  const filteredAssets = assets.filter((a) => a.environment === environment);

  const handleUpdateAsset = (updated: InventoryAsset) => {
    const newAssets = assets.map((a) => (a.id === updated.id ? updated : a));
    saveInventory(newAssets);
    setSaveMsg(`Anlage ${updated.assetTag} aktualisiert.`);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleAddAsset = () => {
    const newAsset: InventoryAsset = {
      id: 'asset_' + Date.now(),
      assetTag: `TEFA-${environment === 'live' ? 'LIVE' : 'TEST'}-${Date.now().toString().slice(-4)}`,
      projectId: activeProject?.id,
      category: 'Laptops',
      manufacturerModel: 'Lenovo ThinkPad T480s / Business Laptop',
      serialNumber: 'SN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      quantity: 1,
      technicalSpecs: 'Intel Core i5, 16GB RAM, 256GB SSD, AZERTY',
      location: environment === 'live' ? 'Douala Center, Kamerun' : 'Munich Warehouse Staging',
      ownership: 'TEFA e.V.',
      donorName: 'Corporate Donor Germany',
      donationStatus: 'inspected',
      operationalCondition: 'excellent_refurbished',
      dataWipingEvidence: true,
      acceptanceDate: new Date().toISOString().split('T')[0],
      technicianInCharge: currentUser.name,
      environment,
    };

    saveInventory([newAsset, ...assets]);
    setSaveMsg(`Neues Asset ${newAsset.assetTag} angelegt.`);
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const approvedCount = filteredAssets.filter((a) => a.donationStatus === 'approved_for_use').length;
  const inTransitCount = filteredAssets.filter(
    (a) => a.donationStatus === 'in_transit' || a.donationStatus === 'customs_processing'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              Modul H
            </span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                environment === 'live'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              UMGEBUNG: {environment === 'live' ? 'LIVE INVENTORY' : 'TEST DATA / STAGING'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            IT- & Anlagen-Inventar (Asset Management)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Lückenlose Erfassung von Hardware-Spenden, Solaranlagen und Hilfsmitteln. Zugesagte oder im
            Zoll befindliche Geräte gelten nicht als einsatzbereit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Environment Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setEnvironment('test')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                environment === 'test'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TEST DATEN (Staging)
            </button>
            <button
              onClick={() => setEnvironment('live')}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                environment === 'live'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              LIVE INVENTAR (Vor Ort)
            </button>
          </div>

          {canEditProject() && (
            <button
              onClick={handleAddAsset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Gerät erfassen</span>
            </button>
          )}
        </div>
      </div>

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Operational Readiness Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
            Einsatzbereit vor Ort (Approved for Use)
          </span>
          <div className="text-2xl font-black text-emerald-900">{approvedCount} Einheiten</div>
          <div className="text-[11px] text-emerald-700 mt-1">Technisch abgenommen & zertifiziert</div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">
            Im Transport / Zollabwicklung (In Transit)
          </span>
          <div className="text-2xl font-black text-amber-900">{inTransitCount} Einheiten</div>
          <div className="text-[11px] text-amber-700 mt-1">Noch nicht einsatzfähig</div>
        </div>

        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
            Gesamt erfasste Anlagen ({environment})
          </span>
          <div className="text-2xl font-black text-slate-900">{filteredAssets.length} Assets</div>
          <div className="text-[11px] text-slate-500 mt-1">Datenlöschungsnachweise verifiziert</div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Asset-Tag</th>
                <th className="py-2.5 px-3">Kategorie</th>
                <th className="py-2.5 px-3">Modell & Spezifikationen</th>
                <th className="py-2.5 px-3">Seriennummer</th>
                <th className="py-2.5 px-3">Status Lebenszyklus</th>
                <th className="py-2.5 px-3">Zustand</th>
                <th className="py-2.5 px-3 text-center">Datenlöschung</th>
                <th className="py-2.5 px-3">Standort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{asset.assetTag}</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                      {asset.category}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{asset.manufacturerModel}</div>
                    <div className="text-[11px] text-slate-500">{asset.technicalSpecs}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                    {asset.serialNumber}
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={asset.donationStatus}
                      onChange={(e) =>
                        handleUpdateAsset({
                          ...asset,
                          donationStatus: e.target.value as InventoryAsset['donationStatus'],
                        })
                      }
                      className={`text-[11px] font-bold px-2 py-1 rounded border focus:outline-none ${
                        asset.donationStatus === 'approved_for_use'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : asset.donationStatus === 'customs_processing' ||
                            asset.donationStatus === 'in_transit'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <option value="offered">Angeboten (Offered)</option>
                      <option value="confirmed">Bestätigte Spende</option>
                      <option value="shipped">Verschifft (Shipped)</option>
                      <option value="in_transit">Im Seetransport</option>
                      <option value="customs_processing">Zollabfertigung Douala</option>
                      <option value="arrived">Vor Ort eingetroffen</option>
                      <option value="inspected">Technisch geprüft</option>
                      <option value="approved_for_use">Einsatzbereit freigegeben</option>
                    </select>
                  </td>
                  <td className="py-3 px-3 capitalize text-slate-700">
                    {asset.operationalCondition.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {asset.dataWipingEvidence ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        <Check className="w-3 h-3 text-emerald-600" />
                        NIST 800-88
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        N/A
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600 text-[11px]">{asset.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
