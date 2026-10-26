import React, { useState } from 'react';
import {
  GeneratedCampaign,
  CampaignFormatType,
  BrandIdentitySpec,
  CampaignBrief,
} from '../../types';
import { CAMPAIGN_FORMAT_CONFIGS } from '../../data/seedCampaigns';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Layers,
  ShieldAlert,
  Coins,
  ArrowRight,
  Maximize2,
  Cpu,
  Info,
} from 'lucide-react';

interface GenerationStudioProps {
  campaign: GeneratedCampaign;
  onUpdateCampaign: (updatedCampaign: GeneratedCampaign) => void;
  onContinueToGallery: () => void;
}

export const GenerationStudio: React.FC<GenerationStudioProps> = ({
  campaign,
  onUpdateCampaign,
  onContinueToGallery,
}) => {
  const [isGeneratingMaster, setIsGeneratingMaster] = useState(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [generatingFormatId, setGeneratingFormatId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCostModal, setShowCostModal] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  // Available formats
  const selectedFormats = campaign.brief.channels as CampaignFormatType[];

  // 1. Stage 1: Generate Master Visual
  const handleGenerateMasterVisual = async () => {
    setIsGeneratingMaster(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch('/api/creative-studio/generate-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: campaign.brief,
          brandIdentity: campaign.brandIdentity,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server meldete Status ${res.status}`);
      }

      const data = await res.json();
      const newMaster = data.masterVisual || {
        imageUrl: data.imageUrl,
        promptUsed: data.promptUsed || campaign.brief.imageDescription,
        negativePrompt: campaign.masterVisual?.negativePrompt || 'people, person, human, face, silhouette, hand, crowd',
        generatedAt: new Date().toISOString(),
        model: data.modelUsed || 'gemini-3.1-flash-lite-image',
        isApprovedAsMaster: true,
      };

      onUpdateCampaign({
        ...campaign,
        masterVisual: newMaster,
      });
      setSuccessMessage(
        data.isLiveModel
          ? 'Master-Visual erfolgreich mit Nano Banana KI-Modell (gemini-3.1-flash-lite-image) generiert.'
          : 'Master-Visual erfolgreich berechnet.'
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fehler bei der Master-Visual-Generierung';
      setErrorMessage(message);
    } finally {
      setIsGeneratingMaster(false);
    }
  };

  // 2. Stage 2: Batch Generate All Selected Formats
  const handleExecuteBatchGeneration = async () => {
    setShowCostModal(false);
    setIsBatchGenerating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const formatsToGenerate = selectedFormats.length > 0 ? selectedFormats : ['billboard_poster', 'instagram_square', 'linkedin_graphic'];

    try {
      const updatedAssets = [...campaign.assets];

      for (const formatId of formatsToGenerate) {
        setGeneratingFormatId(formatId);
        const res = await fetch('/api/creative-studio/generate-format', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: campaign.id,
            format: formatId,
            masterVisual: campaign.masterVisual,
            brief: campaign.brief,
            brandIdentity: campaign.brandIdentity,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Fehler beim Format ${formatId}`);
        }

        const data = await res.json();
        const existingIdx = updatedAssets.findIndex((a) => a.format === formatId);
        if (existingIdx >= 0) {
          updatedAssets[existingIdx] = data.asset;
        } else {
          updatedAssets.push(data.asset);
        }
      }

      onUpdateCampaign({
        ...campaign,
        assets: updatedAssets,
        selectedFormats: formatsToGenerate as CampaignFormatType[],
      });

      setSuccessMessage(`Kampagne mit ${formatsToGenerate.length} koordinierten Formaten erfolgreich generiert!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fehler bei der Batch-Generierung';
      setErrorMessage(message);
    } finally {
      setIsBatchGenerating(false);
      setGeneratingFormatId(null);
    }
  };

  // 3. Stage 2: Regenerate Single Individual Format
  const handleRegenerateSingleFormat = async (formatId: CampaignFormatType) => {
    setGeneratingFormatId(formatId);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/creative-studio/generate-format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          format: formatId,
          masterVisual: campaign.masterVisual,
          brief: campaign.brief,
          brandIdentity: campaign.brandIdentity,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Fehler bei Format ${formatId}`);
      }

      const data = await res.json();
      const updatedAssets = campaign.assets.map((a) => (a.format === formatId ? data.asset : a));
      if (!updatedAssets.some((a) => a.format === formatId)) {
        updatedAssets.push(data.asset);
      }

      onUpdateCampaign({
        ...campaign,
        assets: updatedAssets,
      });
      setSuccessMessage(`Format "${formatId}" erfolgreich einzeln regeneriert.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fehler beim Regenerieren';
      setErrorMessage(message);
    } finally {
      setGeneratingFormatId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 mb-2">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              Sektion D: KI-Bildgenerierung (Nano Banana Modell)
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Zweistufiger Konsistenz-Generierungs-Workflow
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              <strong>Stufe 1:</strong> Master-Visual nach TEFA-Spezifikation und No-People-Filter erzeugen.{' '}
              <strong>Stufe 2:</strong> Abgeleitete Kampagnenformate mit identischer Farbwelt und Typografie ableiten.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onContinueToGallery}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Zur Kampagnen-Galerie</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Model Spec & Constraints Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              Zentrales Bildmodell
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              gemini-3.1-flash-lite-image
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
            Nano Banana
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
              No-People Constraint
            </span>
            <span className={`text-xs font-bold ${campaign.brief.noPeopleMode ? 'text-amber-700' : 'text-slate-800'}`}>
              {campaign.brief.noPeopleMode ? 'STRIKT AKTIV (Keine Menschen)' : 'Inaktiv (Personen erlaubt)'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500">
            {campaign.brief.noPeopleMode ? 'Zero-Human Filter' : 'Standard'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
              Gewählte Zielformate
            </span>
            <span className="text-xs font-bold text-slate-800">
              {selectedFormats.length} Formate konfiguriert
            </span>
          </div>
          <button
            onClick={() => setShowCostModal(true)}
            className="text-xs text-indigo-700 hover:underline font-semibold"
          >
            Kosten-Info
          </button>
        </div>
      </div>

      {/* Stage 1: Master Visual Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              1
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Stufe 1: Master-Visual generieren oder freigeben
              </h3>
              <p className="text-[11px] text-slate-500">
                Dieses Bild bildet die unumstößliche visuelle Referenz für alle weiteren Formate.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateMasterVisual}
            disabled={isGeneratingMaster}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            {isGeneratingMaster ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingMaster ? 'Generiere Master-Visual...' : 'Master-Visual (neu) berechnen'}</span>
          </button>
        </div>

        {/* Master Visual Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1 bg-slate-100 rounded-xl overflow-hidden border border-slate-300 relative aspect-video flex items-center justify-center group shadow-xs">
            {campaign.masterVisual?.imageUrl ? (
              <>
                <img
                  src={campaign.masterVisual.imageUrl}
                  alt="Master Visual"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPreviewModalImage(campaign.masterVisual.imageUrl)}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  title="Vollbild anzeigen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <div className="text-center p-4">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs text-slate-500 font-medium">Noch kein Master-Visual generiert</span>
              </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">
                Verwendeter Bildgenerierungs-Prompt (Nano Banana):
              </span>
              <p className="text-[11px] font-mono text-slate-600 leading-relaxed">
                {campaign.masterVisual?.promptUsed || 'Noch nicht generiert. Klicken Sie auf "Master-Visual berechnen".'}
              </p>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
              <span className="font-bold text-rose-800 block mb-1">
                Strikter Negativ-Prompt (No-People Constraint):
              </span>
              <p className="text-[11px] font-mono text-rose-700 leading-relaxed">
                {campaign.masterVisual?.negativePrompt || 'people, person, human, face, silhouette, hand, crowd, deformed equipment'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stage 2: Coordinated Formats Generation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              2
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Stufe 2: Koordinierte Kampagnen-Formate ableiten
              </h3>
              <p className="text-[11px] text-slate-500">
                Erzeugt alle gewählten Formate mit einheitlicher visueller Identität und messerscharfer Typografie.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCostModal(true)}
              disabled={isBatchGenerating}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {isBatchGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{isBatchGenerating ? 'Batch-Generierung läuft...' : 'Alle Formate im Batch generieren'}</span>
            </button>
          </div>
        </div>

        {/* Formats Grid with Individual Regenerate Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedFormats.map((fmtId) => {
            const config = CAMPAIGN_FORMAT_CONFIGS.find((f) => f.id === fmtId);
            const asset = campaign.assets.find((a) => a.format === fmtId);
            const isRegeneratingThis = generatingFormatId === fmtId;

            return (
              <div
                key={fmtId}
                className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3 relative hover:shadow-xs transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {config?.name || fmtId}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-500">
                      {config?.aspectRatioLabel} ({config?.width} x {config?.height}px)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                    {asset ? `v${asset.version}` : 'Ausstehend'}
                  </span>
                </div>

                {/* Thumbnail Area */}
                <div className="bg-slate-200 rounded-lg overflow-hidden aspect-video flex items-center justify-center relative border border-slate-300">
                  {isRegeneratingThis ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-700 p-4 text-center">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="text-[11px] font-semibold">Generiere Format...</span>
                    </div>
                  ) : asset?.imageUrl ? (
                    <img
                      src={asset.imageUrl}
                      alt={config?.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setPreviewModalImage(asset.imageUrl)}
                    />
                  ) : (
                    <div className="text-center p-3 text-slate-400">
                      <ImageIcon className="w-6 h-6 mx-auto mb-1" />
                      <span className="text-[11px]">Bereit zur Generierung</span>
                    </div>
                  )}
                </div>

                {/* Individual Action */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 truncate max-w-[140px]">
                    {asset ? 'Bereit & verknüpft' : 'Wartet auf Batch'}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRegenerateSingleFormat(fmtId)}
                    disabled={isRegeneratingThis || isBatchGenerating}
                    className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-slate-100 text-slate-700 rounded border border-slate-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRegeneratingThis ? 'animate-spin' : ''}`} />
                    <span>Einzeln neu</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cost Confirmation Modal */}
      {showCostModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Kosten- & Batch-Bestätigung (TEFA Budgetschutz)
                </h3>
                <p className="text-xs text-slate-500">
                  Transparenz gemäß NGO-Richtlinien
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              KI-Bildgenerierung ist mit realen Modell-Token-Aufrufen verbunden. Sie sind im Begriff,{' '}
              <strong className="text-slate-900 font-bold">{selectedFormats.length} Formate</strong> im
              Batch zu generieren.
            </p>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold block">Richtlinie für TechEnergy For Africa e.V.:</span>
              <p className="text-[11px]">
                Um unnötige Kosten zu vermeiden, generieren Sie bitte nur benötigte Formate. Bereits genehmigte Formate
                müssen nicht redundant neu berechnet werden.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCostModal(false)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchGeneration}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Batch-Generierung jetzt starten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden p-2 shadow-2xl relative">
            <img
              src={previewModalImage}
              alt="Fullscreen Preview"
              className="max-h-[80vh] w-auto object-contain mx-auto rounded"
            />
            <div className="text-center p-2 text-xs text-slate-600">
              Klicken Sie irgendwo zum Schließen
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
