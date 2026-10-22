import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useProjects } from '../../context/ProjectContext';
import { SimulationParameters } from '../../types';
import {
  Sliders,
  DollarSign,
  Users,
  Laptop,
  Sun,
  ShieldAlert,
  Save,
  CheckCircle2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const ProjectSimulator: React.FC = () => {
  const { t } = useLanguage();
  const { activeProject, updateProject } = useProjects();
  const { canEditProject } = useAuthRole();

  const [params, setParams] = useState<SimulationParameters>(() => {
    return (
      activeProject?.simulationParams || {
        beneficiariesCount: 60,
        trainersCount: 2,
        trainingDurationMonths: 12,
        usableWorkstations: 20,
        studentsPerWorkstation: 3,
        donatedHardwareCount: 25,
        hardwareUnitPurchaseCostEUR: 180,
        logisticsCustomsCostEUR: 3800,
        infrastructureSolarCostEUR: 11500,
        monthlyOperatingCostEUR: 450,
        accessibilityInterpreterCostEUR: 3200,
        maintenanceReservePct: 10,
        confirmedGrantsEUR: 19500,
        pendingGrantsEUR: 25000,
      }
    );
  });

  const [activePreset, setActivePreset] = useState<'conservative' | 'middle' | 'ambitious' | 'custom'>('middle');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Sync if project changes
  React.useEffect(() => {
    if (activeProject?.simulationParams) {
      setParams(activeProject.simulationParams);
    }
  }, [activeProject]);

  // Derived calculations
  const neededWorkstations = Math.ceil(params.beneficiariesCount / params.studentsPerWorkstation);
  const hardwareGapCount = Math.max(0, neededWorkstations - params.donatedHardwareCount);
  const hardwarePurchaseTotal = hardwareGapCount * params.hardwareUnitPurchaseCostEUR;
  const trainerSalaryTotal = params.trainersCount * params.trainingDurationMonths * 600; // e.g. €600/month avg trainer stipend
  const totalOperations = params.monthlyOperatingCostEUR * params.trainingDurationMonths;

  const subtotalDirect =
    hardwarePurchaseTotal +
    params.logisticsCustomsCostEUR +
    params.infrastructureSolarCostEUR +
    trainerSalaryTotal +
    totalOperations +
    params.accessibilityInterpreterCostEUR;

  const reserveAmount = Math.round(subtotalDirect * (params.maintenanceReservePct / 100));
  const totalSimulatedCost = subtotalDirect + reserveAmount;

  const costPerBeneficiary =
    params.beneficiariesCount > 0 ? Math.round(totalSimulatedCost / params.beneficiariesCount) : 0;

  const fundingGapNet = Math.max(0, totalSimulatedCost - params.confirmedGrantsEUR);
  const monthlyBurnRate =
    params.trainingDurationMonths > 0 ? Math.round(totalSimulatedCost / params.trainingDurationMonths) : 0;

  // Preset Handlers
  const applyPreset = (type: 'conservative' | 'middle' | 'ambitious') => {
    setActivePreset(type);
    if (type === 'conservative') {
      setParams({
        beneficiariesCount: 30,
        trainersCount: 1,
        trainingDurationMonths: 6,
        usableWorkstations: 10,
        studentsPerWorkstation: 3,
        donatedHardwareCount: 10,
        hardwareUnitPurchaseCostEUR: 150,
        logisticsCustomsCostEUR: 2000,
        infrastructureSolarCostEUR: 6500,
        monthlyOperatingCostEUR: 300,
        accessibilityInterpreterCostEUR: 1500,
        maintenanceReservePct: 15,
        confirmedGrantsEUR: params.confirmedGrantsEUR,
        pendingGrantsEUR: params.pendingGrantsEUR,
      });
    } else if (type === 'middle') {
      setParams({
        beneficiariesCount: 60,
        trainersCount: 2,
        trainingDurationMonths: 12,
        usableWorkstations: 20,
        studentsPerWorkstation: 3,
        donatedHardwareCount: 25,
        hardwareUnitPurchaseCostEUR: 180,
        logisticsCustomsCostEUR: 3800,
        infrastructureSolarCostEUR: 11500,
        monthlyOperatingCostEUR: 450,
        accessibilityInterpreterCostEUR: 3200,
        maintenanceReservePct: 10,
        confirmedGrantsEUR: params.confirmedGrantsEUR,
        pendingGrantsEUR: params.pendingGrantsEUR,
      });
    } else if (type === 'ambitious') {
      setParams({
        beneficiariesCount: 120,
        trainersCount: 4,
        trainingDurationMonths: 18,
        usableWorkstations: 35,
        studentsPerWorkstation: 3,
        donatedHardwareCount: 30,
        hardwareUnitPurchaseCostEUR: 200,
        logisticsCustomsCostEUR: 5500,
        infrastructureSolarCostEUR: 18000,
        monthlyOperatingCostEUR: 800,
        accessibilityInterpreterCostEUR: 5500,
        maintenanceReservePct: 10,
        confirmedGrantsEUR: params.confirmedGrantsEUR,
        pendingGrantsEUR: params.pendingGrantsEUR,
      });
    }
  };

  const handleSaveToProject = async () => {
    if (!activeProject) return;
    await updateProject({
      ...activeProject,
      simulationParams: params,
    });
    setSaveMsg('Simulationsparameter erfolgreich im Projekt gespeichert.');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Modul F
            </span>
            <span className="text-xs text-amber-700 font-mono font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
              HYPOTHETISCHE SIMULATION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Interaktiver Projekt- & Finanzsimulator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Ermitteln Sie sensitiv Kosten, Auslastungsquoten, Hardwarelücken und Fördermittelbedarfe
            in Echtzeit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canEditProject() && (
            <button
              onClick={handleSaveToProject}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Szenario im Projekt speichern</span>
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

      {/* Preset Selector */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
        <span className="font-semibold text-slate-600 px-2">Szenarien-Preset:</span>
        <button
          onClick={() => applyPreset('conservative')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activePreset === 'conservative'
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Konservatives Pilot-Szenario
        </button>
        <button
          onClick={() => applyPreset('middle')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activePreset === 'middle'
              ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Mittlere Standard-Planung
        </button>
        <button
          onClick={() => applyPreset('ambitious')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            activePreset === 'ambitious'
              ? 'bg-white text-blue-800 shadow-xs border border-blue-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ambitionierter Voll-Ausbau
        </button>
      </div>

      {/* Simulation Result KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cost */}
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Simulierte Gesamtkosten
          </span>
          <div className="text-2xl font-black text-white mt-2">
            € {totalSimulatedCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Ca. {(totalSimulatedCost * 655.957).toLocaleString(undefined, { maximumFractionDigits: 0 })} XAF
          </div>
        </div>

        {/* Cost per Beneficiary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Kosten pro Begünstigten
          </span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            € {costPerBeneficiary.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Bei {params.beneficiariesCount} Teilnehmenden ({params.trainingDurationMonths} Monate)
          </div>
        </div>

        {/* Workstations Gap */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Gerätelücke (Zukaufbedarf)
          </span>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {hardwareGapCount} <span className="text-sm font-normal text-slate-500">PCs</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Bedarf: {neededWorkstations} | Spenden: {params.donatedHardwareCount}
          </div>
        </div>

        {/* Net Funding Gap */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">
            Netto-Finanzierungslücke
          </span>
          <div className="text-2xl font-black text-amber-600 mt-2">
            € {fundingGapNet.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Monatlicher Burn-Rate: € {monthlyBurnRate.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Sliders Grid: Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Educational & Hardware Scope */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            1. Ausbildungs- & Hardware-Parameter
          </h2>

          {/* Beneficiaries Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Teilnehmende (Begünstigte)</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">
                {params.beneficiariesCount}
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={300}
              step={5}
              value={params.beneficiariesCount}
              onChange={(e) => {
                setActivePreset('custom');
                setParams({ ...params, beneficiariesCount: parseInt(e.target.value) });
              }}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Duration Months */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Ausbildungsdauer (Monate)</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {params.trainingDurationMonths} Monate
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={24}
              step={1}
              value={params.trainingDurationMonths}
              onChange={(e) => {
                setActivePreset('custom');
                setParams({ ...params, trainingDurationMonths: parseInt(e.target.value) });
              }}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Trainers Count */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Anzahl Trainer & Fachkräfte</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {params.trainersCount}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={params.trainersCount}
              onChange={(e) => {
                setActivePreset('custom');
                setParams({ ...params, trainersCount: parseInt(e.target.value) });
              }}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Donated Hardware Count */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Gespendete Laptops / Rechner</span>
              <span className="font-bold text-blue-700 font-mono text-sm">
                {params.donatedHardwareCount} Einheiten
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={params.donatedHardwareCount}
              onChange={(e) => {
                setActivePreset('custom');
                setParams({ ...params, donatedHardwareCount: parseInt(e.target.value) });
              }}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Hardware Unit Purchase Cost */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Zukaufpreis pro Hardware-Einheit (€)</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                € {params.hardwareUnitPurchaseCostEUR}
              </span>
            </div>
            <input
              type="range"
              min={100}
              max={500}
              step={10}
              value={params.hardwareUnitPurchaseCostEUR}
              onChange={(e) => {
                setActivePreset('custom');
                setParams({ ...params, hardwareUnitPurchaseCostEUR: parseInt(e.target.value) });
              }}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>

        {/* Column 2: Logistics, Solar & Operational Costs */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            2. Infrastruktur, Solar & Logistik
          </h2>

          {/* Solar Cost Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Solar-Photovoltaik & Batteriespeicher (€)</span>
              <span className="font-bold text-amber-600 font-mono text-sm">
                € {params.infrastructureSolarCostEUR.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={25000}
              step={500}
              value={params.infrastructureSolarCostEUR}
              onChange={(e) => {
                setActivePreset('custom');
                setParams({ ...params, infrastructureSolarCostEUR: parseInt(e.target.value) });
              }}
              className="w-full accent-amber-500"
            />
          </div>

          {/* Logistics & Customs */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Seefracht, Transport & Zoll (€)</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                € {params.logisticsCustomsCostEUR.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={10000}
              step={200}
              value={params.logisticsCustomsCostEUR}
              onChange={(e) => {
                setActivePreset('custom');
                setParams({ ...params, logisticsCustomsCostEUR: parseInt(e.target.value) });
              }}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Sign Language / Accessibility */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Gebärdensprache & Inklusionssoftware (€)</span>
              <span className="font-bold text-indigo-700 font-mono text-sm">
                € {params.accessibilityInterpreterCostEUR.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={10000}
              step={250}
              value={params.accessibilityInterpreterCostEUR}
              onChange={(e) => {
                setActivePreset('custom');
                setParams({ ...params, accessibilityInterpreterCostEUR: parseInt(e.target.value) });
              }}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Monthly Operations (Internet / Rent) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Monatliche Betriebskosten (Internet/Miete) (€)</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                € {params.monthlyOperatingCostEUR} / Monat
              </span>
            </div>
            <input
              type="range"
              min={150}
              max={1500}
              step={50}
              value={params.monthlyOperatingCostEUR}
              onChange={(e) => {
                setActivePreset('custom');
                setParams({ ...params, monthlyOperatingCostEUR: parseInt(e.target.value) });
              }}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Contingency Reserve % */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Risikopuffer & Währungsreserve (%)</span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {params.maintenanceReservePct} % (€ {reserveAmount.toLocaleString()})
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={params.maintenanceReservePct}
              onChange={(e) => {
                setActivePreset('custom');
                setParams({ ...params, maintenanceReservePct: parseInt(e.target.value) });
              }}
              className="w-full accent-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
