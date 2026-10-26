import React, { useState } from 'react';
import {
  GeneratedCampaign,
  CampaignAsset,
  CampaignFormatType,
  TextOverlayConfig,
  CampaignStatus,
} from '../../types';
import { CAMPAIGN_FORMAT_CONFIGS } from '../../data/seedCampaigns';
import { useAuthRole } from '../../context/AuthRoleContext';
import {
  Download,
  Edit3,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  FolderPlus,
  ShieldCheck,
  AlertCircle,
  Layers,
  Sparkles,
  Maximize2,
  FileCheck,
  Sliders,
} from 'lucide-react';

interface CampaignGalleryProps {
  campaign: GeneratedCampaign;
  onUpdateCampaign: (updatedCampaign: GeneratedCampaign) => void;
  onRegenerateFormat: (formatId: CampaignFormatType) => Promise<void>;
  onSaveToProject: () => Promise<void>;
}

export const CampaignGallery: React.FC<CampaignGalleryProps> = ({
  campaign,
  onUpdateCampaign,
  onRegenerateFormat,
  onSaveToProject,
}) => {
  const { currentUser } = useAuthRole();

  const [activeAssetForEdit, setActiveAssetForEdit] = useState<CampaignAsset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<CampaignAsset | null>(null);
  const [approvalModalAsset, setApprovalModalAsset] = useState<CampaignAsset | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [isSavingToProject, setIsSavingToProject] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const canApprove =
    currentUser.role === 'project_manager' ||
    currentUser.role === 'board_member' ||
    currentUser.role === 'system_admin';

  // Helper to render live asset composited view
  const renderAssetVisual = (asset: CampaignAsset) => {
    const config = CAMPAIGN_FORMAT_CONFIGS.find((f) => f.id === asset.format);
    const ov = asset.overlayConfig;

    const alignmentClass =
      ov.textAlignment === 'center'
        ? 'text-center items-center'
        : ov.textAlignment === 'right'
        ? 'text-right items-end'
        : 'text-left items-start';

    const headlineSizeClass =
      ov.fontSize === 'compact'
        ? 'text-xs sm:text-sm'
        : ov.fontSize === 'prominent'
        ? 'text-base sm:text-lg font-black'
        : 'text-sm sm:text-base font-bold';

    return (
      <div className="relative w-full h-full overflow-hidden select-none bg-slate-900 group">
        {/* Background Image */}
        <img
          src={asset.imageUrl}
          alt={asset.headline}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
        />

        {/* Dynamic Dark Gradient Overlay for Typography Contrast */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity"
          style={{
            background: `linear-gradient(to top, rgba(15, 23, 42, ${ov.overlayOpacity + 0.3}) 0%, rgba(15, 23, 42, ${ov.overlayOpacity}) 60%, rgba(15, 23, 42, ${ov.overlayOpacity * 0.4}) 100%)`,
          }}
        />

        {/* Brand Logo / Badge position */}
        {ov.logoPosition !== 'none' && (
          <div
            className={`absolute z-10 p-2 sm:p-3 pointer-events-none ${
              ov.logoPosition === 'top-left'
                ? 'top-0 left-0'
                : ov.logoPosition === 'top-right'
                ? 'top-0 right-0'
                : ov.logoPosition === 'bottom-left'
                ? 'bottom-0 left-0'
                : 'bottom-0 right-0'
            }`}
          >
            {campaign.brandIdentity.approvedLogo.customLogoUrl ? (
              <img
                src={campaign.brandIdentity.approvedLogo.customLogoUrl}
                alt="Logo"
                className="h-6 w-auto object-contain drop-shadow"
              />
            ) : campaign.brandIdentity.approvedLogo.useOfficialTefaLogo ? (
              <div className="px-2 py-0.5 rounded bg-slate-950/80 border border-emerald-500/40 text-emerald-400 font-mono font-black text-[10px] sm:text-xs tracking-wider shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>TEFA e.V.</span>
              </div>
            ) : null}
          </div>
        )}

        {/* Crisp HTML/CSS Graphic Typography Overlay */}
        <div className={`absolute inset-0 p-3 sm:p-5 flex flex-col justify-end z-10 pointer-events-none ${alignmentClass}`}>
          {ov.badgeText && (
            <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/90 text-white font-bold text-[9px] sm:text-[10px] uppercase tracking-wider mb-1.5 shadow-xs">
              {ov.badgeText}
            </span>
          )}

          <h3 className={`${headlineSizeClass} text-white drop-shadow-md leading-tight`}>
            {asset.headline}
          </h3>

          {asset.subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-200 mt-1 drop-shadow-sm max-w-md line-clamp-2 leading-relaxed">
              {asset.subtitle}
            </p>
          )}

          {asset.callToAction && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white font-bold text-[10px] sm:text-xs shadow-md">
              <span>{asset.callToAction}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // REAL Canvas-Based High-Res PNG Download Functionality
  // Helper to safely trigger direct browser download
  const triggerDirectDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Direct download of the original / background visual asset
  const handleDownloadRawAsset = (asset: CampaignAsset) => {
    const safeName = (campaign.brandIdentity?.projectName || 'TEFA').replace(/\s+/g, '_');
    const filename = `TEFA_${safeName}_${asset.format}_v${asset.version}_raw.png`;
    triggerDirectDownload(asset.imageUrl, filename);
  };

  // REAL Canvas-Based High-Res PNG Download Functionality with typography overlays
  const handleDownloadAsset = (asset: CampaignAsset) => {
    const config = CAMPAIGN_FORMAT_CONFIGS.find((f) => f.id === asset.format);
    const width = config?.width || 1200;
    const height = config?.height || 800;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      handleDownloadRawAsset(asset);
      return;
    }

    const safeName = (campaign.brandIdentity?.projectName || 'TEFA').replace(/\s+/g, '_');
    const filename = `TEFA_${safeName}_${asset.format}_v${asset.version}.png`;

    const img = new Image();
    // Only set crossOrigin if not a base64 data URI to avoid browser security rejections
    if (!asset.imageUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.onerror = () => {
      console.warn('Canvas image loading failed, falling back to direct asset download.');
      handleDownloadRawAsset(asset);
    };

    img.onload = () => {
      try {
        // 1. Draw background image
        ctx.drawImage(img, 0, 0, width, height);

        // 2. Draw gradient overlay for readability
        const overlayOpacity = asset.overlayConfig?.overlayOpacity ?? 0.38;
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.25)');
        gradient.addColorStop(0.5, `rgba(15, 23, 42, ${overlayOpacity})`);
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.88)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Dynamic scale factor based on resolution
        const scale = Math.max(1, width / 1200);

        // 3. Draw TEFA Logo / Brandmark
        if (asset.overlayConfig?.logoPosition !== 'none') {
          const logoX = 40 * scale;
          const logoY = 40 * scale;
          const logoW = 160 * scale;
          const logoH = 44 * scale;

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(logoX, logoY, logoW, logoH);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2 * scale;
          ctx.strokeRect(logoX, logoY, logoW, logoH);

          ctx.fillStyle = '#10b981';
          ctx.font = `bold ${Math.round(20 * scale)}px system-ui, sans-serif`;
          ctx.fillText('TEFA e.V.', logoX + 20 * scale, logoY + 30 * scale);
        }

        // 4. Draw Badge
        const padding = 40 * scale;
        let currentY = height - 160 * scale;

        if (asset.overlayConfig?.badgeText) {
          const badgeText = asset.overlayConfig.badgeText.toUpperCase();
          ctx.font = `bold ${Math.round(13 * scale)}px system-ui, sans-serif`;
          const textMetrics = ctx.measureText(badgeText);
          const badgeW = textMetrics.width + 30 * scale;
          const badgeH = 28 * scale;

          ctx.fillStyle = '#10b981';
          ctx.fillRect(padding, currentY - 70 * scale, badgeW, badgeH);

          ctx.fillStyle = '#ffffff';
          ctx.fillText(badgeText, padding + 15 * scale, currentY - 51 * scale);
        }

        // Helper to wrap text cleanly
        const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
          const words = text.split(' ');
          let line = '';
          let lineY = y;

          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
              ctx.fillText(line.trim(), x, lineY);
              line = words[n] + ' ';
              lineY += lineHeight;
            } else {
              line = testLine;
            }
          }
          ctx.fillText(line.trim(), x, lineY);
          return lineY;
        };

        // 5. Draw Headline
        ctx.fillStyle = '#ffffff';
        const headlineFontSize = Math.round(36 * scale);
        ctx.font = `bold ${headlineFontSize}px system-ui, sans-serif`;
        const headlineY = wrapText(asset.headline, padding, currentY, width - padding * 2, headlineFontSize * 1.25);

        // 6. Draw Subtitle
        if (asset.subtitle) {
          ctx.fillStyle = '#e2e8f0';
          const subFontSize = Math.round(20 * scale);
          ctx.font = `${subFontSize}px system-ui, sans-serif`;
          wrapText(asset.subtitle, padding, headlineY + subFontSize * 1.5, width - padding * 2, subFontSize * 1.3);
        }

        // 7. Draw Call to Action Button
        if (asset.callToAction) {
          const ctaFontSize = Math.round(15 * scale);
          ctx.font = `bold ${ctaFontSize}px system-ui, sans-serif`;
          const ctaMetrics = ctx.measureText(asset.callToAction);
          const btnW = ctaMetrics.width + 40 * scale;
          const btnH = 38 * scale;
          const btnY = height - padding - btnH;

          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.roundRect(padding, btnY, btnW, btnH, 8 * scale);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.fillText(asset.callToAction, padding + 20 * scale, btnY + 25 * scale);
        }

        // Export as PNG
        triggerDirectDownload(canvas.toDataURL('image/png'), filename);
      } catch (err) {
        console.warn('Canvas export failed, triggering fallback download:', err);
        handleDownloadRawAsset(asset);
      }
    };

    img.src = asset.imageUrl;
  };

  // Submit Approval / Rejection
  const handleSubmitApproval = async (status: 'approved' | 'rejected') => {
    if (!approvalModalAsset) return;

    try {
      const res = await fetch(`/api/creative-studio/campaigns/${campaign.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: approvalModalAsset.id,
          status,
          comment: approvalComment,
          user: currentUser,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server meldete Status ${res.status}`);
      }

      const data = await res.json();
      onUpdateCampaign(data.campaign);
      setApprovalModalAsset(null);
      setApprovalComment('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fehler bei der Genehmigung';
      setActionError(message);
    }
  };

  // Save Campaign to Project Documents
  const handleSaveToProjectRecord = async () => {
    setIsSavingToProject(true);
    setActionError(null);
    setSaveSuccessMsg(null);

    try {
      await onSaveToProject();
      setSaveSuccessMsg(
        `Kampagne und alle ${campaign.assets.length} generierten Assets wurden im Projektdossier archiviert.`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Fehler beim Speichern ins Projekt';
      setActionError(message);
    } finally {
      setIsSavingToProject(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Sektion E & F: Kampagnen-Galerie, Texteditor & Freigabe
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Generierte Kampagnen-Assets verwalten & freigeben
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Passen Sie Overlays pixelgenau an, exportieren Sie druck- und webfähige PNG-Dateien und dokumentieren
              Sie die offizielle TEFA-Governance-Freigabe für die externe Veröffentlichung.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToProjectRecord}
              disabled={isSavingToProject}
              className="px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isSavingToProject ? 'Archiviere...' : 'Im Projekt-Dossier ablegen'}</span>
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {actionError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* Assets Grid */}
      {campaign.assets.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Noch keine Formate generiert</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Wechseln Sie in Sektion D (KI-Bildgenerierung), um das Master-Visual und die abgeleiteten Formate
            mit dem Nano Banana Modell zu erzeugen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaign.assets.map((asset) => {
            const config = CAMPAIGN_FORMAT_CONFIGS.find((f) => f.id === asset.format);
            const isRegenerating = regeneratingId === asset.format;

            return (
              <div
                key={asset.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col hover:border-slate-300 transition-all"
              >
                {/* Visual Area */}
                <div className="aspect-video w-full bg-slate-900 relative">
                  {renderAssetVisual(asset)}

                  {/* Quick Format Badge */}
                  <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-slate-900/80 text-white font-mono text-[10px] font-bold">
                    {config?.aspectRatio}
                  </span>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 z-20">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs flex items-center gap-1 ${
                        asset.status === 'approved'
                          ? 'bg-emerald-600 text-white'
                          : asset.status === 'rejected'
                          ? 'bg-rose-600 text-white'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {asset.status === 'approved' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Freigegeben</span>
                        </>
                      ) : asset.status === 'rejected' ? (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Abgelehnt</span>
                        </>
                      ) : (
                        <span>Prüfung ausstehend</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="text-xs font-bold text-slate-900">
                        {config?.name || asset.format}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        v{asset.version} • {campaign.brief.language.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {asset.headline}
                    </p>
                  </div>

                  {/* Governance Note */}
                  {asset.reviewedBy && (
                    <div className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                      <strong>Geprüft durch:</strong> {asset.reviewedBy} am{' '}
                      {new Date(asset.reviewedAt || '').toLocaleDateString('de-DE')}
                    </div>
                  )}

                  {/* Action Toolbar */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-4 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewAsset(asset)}
                      title="Vollbild Vorschau"
                      className="p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveAssetForEdit(asset)}
                      title="Text & Layout anpassen"
                      className="p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setApprovalModalAsset(asset);
                        setApprovalComment(asset.notes || '');
                      }}
                      title="Freigabeprozess (Governance)"
                      className="p-2 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadAsset(asset)}
                      title="Echtes PNG herunterladen"
                      className="p-2 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Overlay & Typography Modal */}
      {activeAssetForEdit && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Grafische Typografie & Layout editieren
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveAssetForEdit(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Schlagzeile (Headline)</label>
                <input
                  type="text"
                  value={activeAssetForEdit.headline}
                  onChange={(e) =>
                    setActiveAssetForEdit({
                      ...activeAssetForEdit,
                      headline: e.target.value,
                      overlayConfig: { ...activeAssetForEdit.overlayConfig, headline: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Untertitel (Subtitle)</label>
                <input
                  type="text"
                  value={activeAssetForEdit.subtitle}
                  onChange={(e) =>
                    setActiveAssetForEdit({
                      ...activeAssetForEdit,
                      subtitle: e.target.value,
                      overlayConfig: { ...activeAssetForEdit.overlayConfig, subtitle: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Call to Action (CTA)</label>
                <input
                  type="text"
                  value={activeAssetForEdit.callToAction}
                  onChange={(e) =>
                    setActiveAssetForEdit({
                      ...activeAssetForEdit,
                      callToAction: e.target.value,
                      overlayConfig: { ...activeAssetForEdit.overlayConfig, callToAction: e.target.value },
                    })
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Text-Ausrichtung</label>
                  <select
                    value={activeAssetForEdit.overlayConfig.textAlignment}
                    onChange={(e) =>
                      setActiveAssetForEdit({
                        ...activeAssetForEdit,
                        overlayConfig: {
                          ...activeAssetForEdit.overlayConfig,
                          textAlignment: e.target.value as TextOverlayConfig['textAlignment'],
                        },
                      })
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  >
                    <option value="left">Linksbündig</option>
                    <option value="center">Zentriert</option>
                    <option value="right">Rechtsbündig</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Schriftgröße</label>
                  <select
                    value={activeAssetForEdit.overlayConfig.fontSize}
                    onChange={(e) =>
                      setActiveAssetForEdit({
                        ...activeAssetForEdit,
                        overlayConfig: {
                          ...activeAssetForEdit.overlayConfig,
                          fontSize: e.target.value as TextOverlayConfig['fontSize'],
                        },
                      })
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  >
                    <option value="compact">Kompakt</option>
                    <option value="medium">Mittel</option>
                    <option value="prominent">Prominent / Plakativ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Logo-Position</label>
                  <select
                    value={activeAssetForEdit.overlayConfig.logoPosition}
                    onChange={(e) =>
                      setActiveAssetForEdit({
                        ...activeAssetForEdit,
                        overlayConfig: {
                          ...activeAssetForEdit.overlayConfig,
                          logoPosition: e.target.value as TextOverlayConfig['logoPosition'],
                        },
                      })
                    }
                    className="w-full text-xs p-2 rounded-lg border border-slate-300"
                  >
                    <option value="top-left">Oben Links</option>
                    <option value="top-right">Oben Rechts</option>
                    <option value="bottom-left">Unten Links</option>
                    <option value="bottom-right">Unten Rechts</option>
                    <option value="none">Kein Logo im Bild</option>
                  </select>
                </div>
              </div>

              {/* Live Preview Inside Editor */}
              <div className="pt-2">
                <label className="block font-bold text-slate-700 mb-1">Echtzeit-Vorschau:</label>
                <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-300">
                  {renderAssetVisual(activeAssetForEdit)}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveAssetForEdit(null)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={() => {
                  const updatedAssets = campaign.assets.map((a) =>
                    a.id === activeAssetForEdit.id ? activeAssetForEdit : a
                  );
                  onUpdateCampaign({
                    ...campaign,
                    assets: updatedAssets,
                  });
                  setActiveAssetForEdit(null);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Änderungen speichern
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval & Governance Modal */}
      {approvalModalAsset && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Governance-Freigabe für externe Publikation
                </h3>
                <p className="text-xs text-slate-500">
                  Status: {approvalModalAsset.status}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Gemäß Vorgabe darf die KI Kampagnen niemals eigenmächtig freigeben. Die Veröffentlichung
              unterliegt der Verantwortung autorisierter TEFA-Projektleiter oder Vorstandsmitglieder.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Freigabe-Kommentar / Begründung:
              </label>
              <textarea
                rows={3}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                placeholder="z.B. Geprüft nach CI-Leitlinien. Freigabe für Social-Media-Kampagne erteilt."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
              Angemeldeter Prüfer: <strong>{currentUser.name}</strong> ({currentUser.role})
            </div>

            <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApprovalModalAsset(null)}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Abbrechen
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={!canApprove}
                  onClick={() => handleSubmitApproval('rejected')}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                >
                  Ablehnen
                </button>
                <button
                  type="button"
                  disabled={!canApprove}
                  onClick={() => handleSubmitApproval('approved')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 shadow-xs"
                >
                  Offiziell Freigeben
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Preview Modal */}
      {previewAsset && (
        <div
          className="fixed inset-0 bg-slate-950/85 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewAsset(null)}
        >
          <div
            className="max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-xl overflow-hidden p-2 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video w-full">
              {renderAssetVisual(previewAsset)}
            </div>
            <div className="p-3 bg-slate-900 flex items-center justify-between text-xs text-white">
              <span>{CAMPAIGN_FORMAT_CONFIGS.find((f) => f.id === previewAsset.format)?.name}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadRawAsset(previewAsset)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium flex items-center gap-1.5 cursor-pointer"
                  title="Original-Hintergrundbild ohne Schriftzüge herunterladen"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rohbild</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadAsset(previewAsset)}
                  className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold flex items-center gap-1.5 cursor-pointer"
                  title="Vollständig gestaltetes Plakat mit Typografie & Logo herunterladen"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Plakat-Layout (PNG)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
