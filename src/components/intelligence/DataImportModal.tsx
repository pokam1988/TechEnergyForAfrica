import React, { useState } from 'react';
import {
  Upload,
  X,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  ArrowRight,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useAuthRole } from '../../context/AuthRoleContext';

interface DataImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const DataImportModal: React.FC<DataImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { currentUser } = useAuthRole();

  const [step, setStep] = useState<'upload' | 'mapping' | 'validation' | 'committed'>('upload');
  const [targetEnvironment, setTargetEnvironment] = useState<'demo' | 'live'>('demo');
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationReport, setValidationReport] = useState<any | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [commitResult, setCommitResult] = useState<any | null>(null);

  if (!isOpen) return null;

  // Simple CSV / JSON parsing helper
  const handleParseContent = () => {
    setErrorMessage(null);
    try {
      const text = rawText.trim();
      if (!text) {
        setErrorMessage('Bitte geben Sie CSV- oder JSON-Daten ein.');
        return;
      }

      if (text.startsWith('[') || text.startsWith('{')) {
        const json = JSON.parse(text);
        const rows = Array.isArray(json) ? json : [json];
        setParsedRows(rows);
        runValidation(rows);
        return;
      }

      // Parse CSV
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setErrorMessage('CSV muss mindestens eine Kopfzeile und eine Datenzeile enthalten.');
        return;
      }

      const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().replace(/^["']|["']$/g, ''));
      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(/[,;\t]/).map((v) => v.trim().replace(/^["']|["']$/g, ''));
        const rowObj: any = {};
        headers.forEach((header, idx) => {
          rowObj[header] = values[idx] !== undefined ? values[idx] : '';
        });
        rows.push(rowObj);
      }

      setParsedRows(rows);
      runValidation(rows);
    } catch (err: unknown) {
      setErrorMessage(`Parsing-Fehler: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleSampleData = () => {
    const sample = `title,country,category,status,plannedBudgetEUR,beneficiariesPlanned,submissionDate
"Douala Clean Tech Incubator","Cameroon","renewable_energy","Draft",24000,30,2026-04-15
"Yaoundé Inclusive Coding Lab","Cameroon","inclusive_education","Under Review",18500,25,2026-05-01
"Bafoussam Solar Agritech Hub","Cameroon","community_development","Draft",32000,40,2026-06-20`;
    setRawText(sample);
  };

  const runValidation = async (rows: any[]) => {
    setIsValidating(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/intelligence/import-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setValidationReport(data);
      setStep('validation');
    } catch (err: unknown) {
      setErrorMessage('Validierungsservice fehlgeschlagen.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleCommit = async () => {
    if (!parsedRows || parsedRows.length === 0) return;
    setIsCommitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/intelligence/import-commit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'project_manager',
          'x-user-id': currentUser?.id || 'pm_user',
          'x-user-name': currentUser?.name || 'TEFA Manager',
        },
        body: JSON.stringify({
          rows: parsedRows,
          targetEnvironment,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCommitResult(data);
      setStep('committed');
      onImportSuccess();
    } catch (err: unknown) {
      setErrorMessage('Fehler beim Eintragen der Datensätze in die Datenbank.');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                TEFA Project Intelligence – Datenimport-Assistent
              </h3>
              <p className="text-xs text-slate-500">
                Strukturierte Validierung & kontrollierte Übernahme (CSV / JSON)
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
          {/* Target environment switch */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <Database className="w-4 h-4 text-slate-500" />
              Ziel-Umgebung wählen (Strikte Datentrennung):
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetEnvironment('demo')}
                className={`p-3 rounded-lg border text-left text-xs transition-all ${
                  targetEnvironment === 'demo'
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-200 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold mb-0.5">DEMO / Sandbox</div>
                <div className="text-[11px] text-amber-800 font-normal">
                  Synthetische Datensätze zu Test- & Simulationszwecken. Fließt nicht in offizielle Berichte ein.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetEnvironment('live')}
                className={`p-3 rounded-lg border text-left text-xs transition-all ${
                  targetEnvironment === 'live'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-200 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold mb-0.5">LIVE / Verifiziertes Portfolio</div>
                <div className="text-[11px] text-emerald-800 font-normal">
                  Reale TEFA-Projektvorhaben. Erfordert formale Vorstandsprüfung & revisionssichere Dokumente.
                </div>
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>{errorMessage}</div>
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  CSV- oder JSON-Tabellendaten einfügen:
                </label>
                <button
                  type="button"
                  onClick={handleSampleData}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  Beispieldaten laden
                </button>
              </div>

              <textarea
                rows={8}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder='title,country,category,status,plannedBudgetEUR,beneficiariesPlanned...'
                className="w-full text-xs font-mono p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-500">
                  Unterstützte Formate: Komma-/Semikolon-separierte Tabellen (CSV) oder JSON-Array
                </div>
                <button
                  type="button"
                  onClick={handleParseContent}
                  disabled={isValidating || !rawText.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {isValidating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Prüfe...
                    </>
                  ) : (
                    <>
                      Weiter zur Validierung <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'validation' && validationReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-[11px] text-slate-500">Gesamtzeilen</div>
                  <div className="text-base font-bold text-slate-900">
                    {validationReport.totalRows}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <div className="text-[11px] text-emerald-700">Gültige Zeilen</div>
                  <div className="text-base font-bold text-emerald-800">
                    {validationReport.validRowsCount}
                  </div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                  <div className="text-[11px] text-rose-700">Fehlerhafte Zeilen</div>
                  <div className="text-base font-bold text-rose-800">
                    {validationReport.invalidRowsCount}
                  </div>
                </div>
              </div>

              {validationReport.warnings?.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-700" /> Warnungen / Duplikatshinweise:
                  </div>
                  {validationReport.warnings.map((w: any, idx: number) => (
                    <div key={idx} className="text-[11px]">
                      Zeile {w.row}: {w.message}
                    </div>
                  ))}
                </div>
              )}

              {validationReport.errors?.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-700" /> Validierungsfehler:
                  </div>
                  {validationReport.errors.map((e: any, idx: number) => (
                    <div key={idx} className="text-[11px]">
                      Zeile {e.row} [{e.field}]: {e.message}
                    </div>
                  ))}
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="text-xs font-bold text-slate-700 mb-2">
                  Vorschau der zu übernehmenden Zeilen:
                </div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {validationReport.preview?.map((row: any, i: number) => (
                    <div
                      key={i}
                      className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-800"
                    >
                      <strong>{row.title}</strong> • {row.country || 'Cameroon'} • {row.status || 'Draft'} • {Number(row.plannedBudgetEUR || 0).toLocaleString('de-DE')} €
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg"
                >
                  Zurück zum Editor
                </button>
                <button
                  type="button"
                  onClick={handleCommit}
                  disabled={isCommitting || validationReport.validRowsCount === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {isCommitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Speicher...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> {validationReport.validRowsCount} Datensätze verbindlich importieren
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'committed' && commitResult && (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
              <div className="inline-flex p-3 bg-emerald-100 text-emerald-700 rounded-full">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-emerald-950 text-base">Import erfolgreich abgeschlossen</h4>
              <p className="text-xs text-emerald-800">
                Es wurden <strong>{commitResult.importedCount}</strong> Projekte in die {commitResult.targetEnvironment.toUpperCase()}-Umgebung übernommen und im Audit-Log archiviert.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
              >
                Fertigstellen & Dashboard aktualisieren
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
