import React, { useRef, useState, useEffect } from 'react';
import {
  PenTool,
  Type,
  Upload,
  RotateCcw,
  Check,
  ShieldCheck,
  Stamp,
  Award,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { DocumentSignatureRecord } from '../../types';

interface DigitalSignaturePadProps {
  signatureRecord: DocumentSignatureRecord;
  onChange: (updated: DocumentSignatureRecord) => void;
  defaultSigner1Name?: string;
  defaultSigner1Role?: string;
  defaultSigner2Name?: string;
  defaultSigner2Role?: string;
  organizationName?: string;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  signatureRecord,
  onChange,
  defaultSigner1Name = 'Dr. Frederic Pokam',
  defaultSigner1Role = 'Vorstandsvorsitzender',
  defaultSigner2Name = 'Marc Tagne',
  defaultSigner2Role = 'Finanzvorstand & Controlling',
  organizationName = 'TechEnergy For Africa e.V.',
}) => {
  const [activeSigner, setActiveSigner] = useState<'signer1' | 'signer2'>('signer1');
  const [signMethod, setSignMethod] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState(
    activeSigner === 'signer1' ? signatureRecord.signer1Name || defaultSigner1Name : signatureRecord.signer2Name || defaultSigner2Name
  );
  const [calligraphyStyle, setCalligraphyStyle] = useState<number>(1);
  const [inkColor, setInkColor] = useState<'#1e3a8a' | '#0f172a'>('#1e3a8a');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);

  // Sync typed name when active signer changes
  useEffect(() => {
    if (activeSigner === 'signer1') {
      setTypedName(signatureRecord.signer1Name || defaultSigner1Name);
    } else {
      setTypedName(signatureRecord.signer2Name || defaultSigner2Name);
    }
    clearCanvas();
  }, [activeSigner]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    applyCanvasSignature();
  };

  const applyCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    if (activeSigner === 'signer1') {
      onChange({
        ...signatureRecord,
        signer1SignatureDataUrl: dataUrl,
        signer1IsSigned: true,
      });
    } else {
      onChange({
        ...signatureRecord,
        signer2SignatureDataUrl: dataUrl,
        signer2IsSigned: true,
      });
    }
  };

  const generateCalligraphySvg = (name: string, styleIdx: number): string => {
    const clean = name.trim() || 'Dr. Frederic Pokam';
    let pathD = '';
    let fontStyle = '';

    if (styleIdx === 1) {
      fontStyle = "italic font-serif";
    } else if (styleIdx === 2) {
      fontStyle = "font-serif tracking-widest";
    } else {
      fontStyle = "italic font-sans";
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 90" width="360" height="90">
      <defs>
        <filter id="ink" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
        </filter>
      </defs>
      <text x="30" y="55" font-family="'Brush Script MT', 'Segoe Script', 'Great Vibes', cursive, serif" font-size="34" font-weight="700" fill="${inkColor}" font-style="italic">
        ${clean}
      </text>
      <!-- Paraphe / Flourish line underneath -->
      <path d="M 25 65 Q 120 78, 220 62 T 330 68" fill="none" stroke="${inkColor}" stroke-width="2" stroke-linecap="round" />
    </svg>`;

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  };

  const applyTypedSignature = () => {
    const dataUrl = generateCalligraphySvg(typedName, calligraphyStyle);
    if (activeSigner === 'signer1') {
      onChange({
        ...signatureRecord,
        signer1Name: typedName,
        signer1SignatureDataUrl: dataUrl,
        signer1IsSigned: true,
      });
    } else {
      onChange({
        ...signatureRecord,
        signer2Name: typedName,
        signer2SignatureDataUrl: dataUrl,
        signer2IsSigned: true,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (activeSigner === 'signer1') {
        onChange({
          ...signatureRecord,
          signer1SignatureDataUrl: dataUrl,
          signer1IsSigned: true,
        });
      } else {
        onChange({
          ...signatureRecord,
          signer2SignatureDataUrl: dataUrl,
          signer2IsSigned: true,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const resetSigner = (signer: 'signer1' | 'signer2') => {
    if (signer === 'signer1') {
      onChange({
        ...signatureRecord,
        signer1SignatureDataUrl: undefined,
        signer1IsSigned: false,
      });
    } else {
      onChange({
        ...signatureRecord,
        signer2SignatureDataUrl: undefined,
        signer2IsSigned: false,
      });
    }
    clearCanvas();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 text-white shadow-xl space-y-4">
      {/* Top Header & Signatory Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Digitale Signatur & Vier-Augen-Prüfung</h4>
            <p className="text-[11px] text-slate-400">
              Dokument rechtssicher & professionell unterzeichnen
            </p>
          </div>
        </div>

        {/* 4-Augen Status Badges */}
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium text-[11px] border ${
              signatureRecord.signer1IsSigned
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Signatur 1: {signatureRecord.signer1IsSigned ? 'Signiert ✓' : 'Ausstehend'}
          </span>
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium text-[11px] border ${
              signatureRecord.signer2IsSigned
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Signatur 2: {signatureRecord.signer2IsSigned ? 'Signiert ✓' : 'Ausstehend'}
          </span>
        </div>
      </div>

      {/* Tabs: Choose which signatory to sign */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-800/80 rounded-lg">
        <button
          type="button"
          onClick={() => setActiveSigner('signer1')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
            activeSigner === 'signer1'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <span>1. Unterschrift (Antragsteller / PM)</span>
          {signatureRecord.signer1IsSigned && (
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSigner('signer2')}
          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all ${
            activeSigner === 'signer2'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <span>2. Unterschrift (Vorstand / Freigabe)</span>
          {signatureRecord.signer2IsSigned && (
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
          )}
        </button>
      </div>

      {/* Signer Details Inputs (Name, Role, City, Date) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
        <div>
          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
            Unterzeichner Name
          </label>
          <input
            type="text"
            value={activeSigner === 'signer1' ? signatureRecord.signer1Name : signatureRecord.signer2Name}
            onChange={(e) => {
              const val = e.target.value;
              if (activeSigner === 'signer1') {
                onChange({ ...signatureRecord, signer1Name: val });
              } else {
                onChange({ ...signatureRecord, signer2Name: val });
              }
              setTypedName(val);
            }}
            placeholder="z.B. Dr. Frederic Pokam"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
            Funktion / Titel
          </label>
          <input
            type="text"
            value={activeSigner === 'signer1' ? signatureRecord.signer1Role : signatureRecord.signer2Role}
            onChange={(e) => {
              const val = e.target.value;
              if (activeSigner === 'signer1') {
                onChange({ ...signatureRecord, signer1Role: val });
              } else {
                onChange({ ...signatureRecord, signer2Role: val });
              }
            }}
            placeholder="z.B. Vorstandsvorsitzender"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
            Ort der Unterzeichnung
          </label>
          <input
            type="text"
            value={activeSigner === 'signer1' ? signatureRecord.signer1City : signatureRecord.signer2City}
            onChange={(e) => {
              const val = e.target.value;
              if (activeSigner === 'signer1') {
                onChange({ ...signatureRecord, signer1City: val });
              } else {
                onChange({ ...signatureRecord, signer2City: val });
              }
            }}
            placeholder="z.B. Berlin / Douala"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
            Datum
          </label>
          <input
            type="text"
            value={activeSigner === 'signer1' ? signatureRecord.signer1Date : signatureRecord.signer2Date}
            onChange={(e) => {
              const val = e.target.value;
              if (activeSigner === 'signer1') {
                onChange({ ...signatureRecord, signer1Date: val });
              } else {
                onChange({ ...signatureRecord, signer2Date: val });
              }
            }}
            placeholder="z.B. 02.11.2026"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* Signature Input Mode Selection: Draw, Type, Upload */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setSignMethod('draw')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold ${
              signMethod === 'draw'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Zeichnen (Pad)</span>
          </button>

          <button
            type="button"
            onClick={() => setSignMethod('type')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold ${
              signMethod === 'type'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Kalligrafie (Tippen)</span>
          </button>

          <button
            type="button"
            onClick={() => setSignMethod('upload')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold ${
              signMethod === 'upload'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bild / Scan hochladen</span>
          </button>
        </div>

        {/* Ink Color Selector */}
        {signMethod === 'draw' && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Tinte:</span>
            <button
              type="button"
              onClick={() => setInkColor('#1e3a8a')}
              className={`w-5 h-5 rounded-full border-2 ${
                inkColor === '#1e3a8a' ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: '#1e3a8a' }}
              title="Königsblau"
            />
            <button
              type="button"
              onClick={() => setInkColor('#0f172a')}
              className={`w-5 h-5 rounded-full border-2 ${
                inkColor === '#0f172a' ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: '#0f172a' }}
              title="Dokumentenschwarz"
            />
          </div>
        )}
      </div>

      {/* Signature Content Area */}
      {signMethod === 'draw' && (
        <div className="space-y-2">
          <div className="relative bg-white rounded-lg border-2 border-dashed border-slate-600 overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={600}
              height={160}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerLeave={stopDrawing}
              className="w-full h-36 bg-white cursor-crosshair touch-none"
            />
            <div className="absolute bottom-2 left-3 text-[10px] text-slate-400 select-none pointer-events-none">
              Hier mit Maus, Touchpad oder Stift unterschreiben ✍️
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Löschen / Neu ansetzen</span>
            </button>
            <button
              type="button"
              onClick={applyCanvasSignature}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Unterschrift anwenden</span>
            </button>
          </div>
        </div>
      )}

      {signMethod === 'type' && (
        <div className="space-y-3 bg-slate-800/60 p-3 rounded-lg border border-slate-700">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Name für die Unterschrift eingeben..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <button
              type="button"
              onClick={applyTypedSignature}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Übernehmen</span>
            </button>
          </div>

          {/* Live Preview of Typed Signature */}
          <div className="bg-white rounded-lg p-3 border text-center flex items-center justify-center min-h-[90px]">
            <img
              src={generateCalligraphySvg(typedName, calligraphyStyle)}
              alt="Kalligrafie Vorschau"
              className="max-h-16 object-contain"
            />
          </div>
        </div>
      )}

      {signMethod === 'upload' && (
        <div className="p-4 bg-slate-800/60 border border-dashed border-slate-700 rounded-lg text-center space-y-2">
          <Upload className="w-6 h-6 text-emerald-400 mx-auto" />
          <p className="text-xs text-slate-300 font-medium">
            Scannen Sie Ihre handschriftliche Unterschrift oder laden Sie ein PNG/JPG hoch
          </p>
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer">
            <span>Datei auswählen...</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Official NGO Seal & Integrity Check Controls */}
      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={signatureRecord.includeOfficialSeal}
            onChange={(e) =>
              onChange({
                ...signatureRecord,
                includeOfficialSeal: e.target.checked,
              })
            }
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
          />
          <div className="flex items-center gap-1.5 text-slate-300">
            <Stamp className="w-4 h-4 text-amber-400" />
            <span>Offiziellen Organisationsstempel (Vereinssiegel) einblenden</span>
          </div>
        </label>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Audit-ID: <code className="font-mono text-emerald-300">{signatureRecord.auditHash}</code></span>
        </div>
      </div>
    </div>
  );
};
