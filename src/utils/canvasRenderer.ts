import { CampaignAsset, CampaignFormatConfig } from '../types';
import { CAMPAIGN_FORMAT_CONFIGS } from '../data/seedCampaigns';

// Official TEFA Brand SVG Badge
export const OFFICIAL_TEFA_SVG_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60">
  <defs>
    <linearGradient id="tefaSun" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
  </defs>
  <!-- Solar Sun & Energy Rays -->
  <g transform="translate(10, 10)">
    <circle cx="20" cy="20" r="14" fill="url(#tefaSun)"/>
    <path d="M 20 2 L 20 -2 M 20 42 L 20 38 M 2 20 L -2 20 M 42 20 L 38 20" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <path d="M 7 7 L 4 4 M 33 33 L 36 36 M 7 33 L 4 36 M 33 7 L 36 4" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Leaf / Sustainability accent -->
    <path d="M 20 20 Q 28 12 34 16 Q 32 26 20 20 Z" fill="#10b981"/>
  </g>
  <!-- Brand Typography -->
  <text x="64" y="27" fill="#ffffff" font-family="Plus Jakarta Sans, Inter, sans-serif" font-size="20" font-weight="900" letter-spacing="1.5">TEFA</text>
  <text x="64" y="44" fill="#38bdf8" font-family="Inter, sans-serif" font-size="10" font-weight="700" letter-spacing="0.8">TechEnergy For Africa e.V.</text>
</svg>`;

export async function renderAssetToCanvas(
  asset: CampaignAsset,
  formatConfig?: CampaignFormatConfig
): Promise<string> {
  const cfg = formatConfig || CAMPAIGN_FORMAT_CONFIGS.find((f) => f.id === asset.format) || {
    id: asset.format,
    name: 'Campaign Graphic',
    category: 'digital',
    aspectRatio: '16:9',
    aspectRatioLabel: '16:9',
    width: 1200,
    height: 675,
    description: '',
  };

  const canvas = document.createElement('canvas');
  canvas.width = cfg.width;
  canvas.height = cfg.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // 1. Draw Background Image
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Cover fill canvas
      const hRatio = canvas.width / img.width;
      const vRatio = canvas.height / img.height;
      const ratio = Math.max(hRatio, vRatio);
      const centerShiftX = (canvas.width - img.width * ratio) / 2;
      const centerShiftY = (canvas.height - img.height * ratio) / 2;
      ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
      resolve();
    };
    img.onerror = () => {
      // Fallback solid gradient if image loading fails
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#0f2b48');
      grad.addColorStop(1, '#059669');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      resolve();
    };
    img.src = asset.imageUrl;
  });

  const overlay = asset.overlayConfig || {
    headline: asset.headline,
    subtitle: asset.subtitle,
    callToAction: asset.callToAction,
    organizationBadge: 'TechEnergy For Africa e.V.',
    logoPosition: 'top-left',
    textAlignment: 'left',
    fontSize: 'medium',
    textColor: 'light',
    overlayOpacity: 0.4,
  };

  // 2. Semi-transparent backdrop / gradient for legible typography
  const darkBackdrop = ctx.createLinearGradient(0, 0, 0, canvas.height);
  const opacity = overlay.overlayOpacity ?? 0.4;
  darkBackdrop.addColorStop(0, `rgba(15, 23, 42, ${opacity * 0.7})`);
  darkBackdrop.addColorStop(0.5, `rgba(15, 23, 42, ${opacity})`);
  darkBackdrop.addColorStop(1, `rgba(15, 23, 42, ${Math.min(0.9, opacity * 1.5)})`);
  ctx.fillStyle = darkBackdrop;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3. Draw TEFA Logo Badge
  const isLightText = overlay.textColor !== 'dark';
  const logoPos = overlay.logoPosition || 'top-left';

  if (logoPos !== 'none') {
    let logoX = 60;
    let logoY = 50;
    const logoWidth = Math.min(260, canvas.width * 0.3);
    const logoHeight = (logoWidth / 240) * 60;

    if (logoPos === 'top-right') {
      logoX = canvas.width - logoWidth - 60;
      logoY = 50;
    } else if (logoPos === 'bottom-left') {
      logoX = 60;
      logoY = canvas.height - logoHeight - 60;
    } else if (logoPos === 'bottom-right') {
      logoX = canvas.width - logoWidth - 60;
      logoY = canvas.height - logoHeight - 60;
    }

    // Logo background card for contrast
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    roundRect(ctx, logoX - 12, logoY - 8, logoWidth + 24, logoHeight + 16, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Render SVG logo to canvas
    await new Promise<void>((resolve) => {
      const logoImg = new Image();
      logoImg.onload = () => {
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
        resolve();
      };
      logoImg.onerror = () => resolve();
      logoImg.src = `data:image/svg+xml;utf8,${encodeURIComponent(OFFICIAL_TEFA_SVG_MARK)}`;
    });
  }

  // 4. Typography Layout
  const textAlign = overlay.textAlignment || 'left';
  const fontSizeFactor = overlay.fontSize === 'prominent' ? 1.25 : overlay.fontSize === 'compact' ? 0.85 : 1.0;
  const baseScale = Math.min(canvas.width, canvas.height) / 1000;

  const headlineSize = Math.round(52 * baseScale * fontSizeFactor);
  const subtitleSize = Math.round(26 * baseScale * fontSizeFactor);
  const ctaSize = Math.round(22 * baseScale * fontSizeFactor);

  const paddingX = Math.round(canvas.width * 0.08);
  let textY = Math.round(canvas.height * 0.38);

  // Category / Initiative pill badge
  if (overlay.badgeText) {
    const badgeText = overlay.badgeText.toUpperCase();
    ctx.font = `700 ${Math.round(14 * baseScale)}px system-ui, sans-serif`;
    const textMetrics = ctx.measureText(badgeText);
    const badgeWidth = textMetrics.width + 24;
    const badgeHeight = Math.round(28 * baseScale);

    let badgeX = paddingX;
    if (textAlign === 'center') {
      badgeX = (canvas.width - badgeWidth) / 2;
    } else if (textAlign === 'right') {
      badgeX = canvas.width - paddingX - badgeWidth;
    }

    ctx.fillStyle = '#10b981';
    roundRect(ctx, badgeX, textY - 32, badgeWidth, badgeHeight, 6);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + 12, textY - 32 + badgeHeight / 2);

    textY += badgeHeight + 16;
  }

  // Headline
  ctx.fillStyle = isLightText ? '#ffffff' : '#0f172a';
  ctx.font = `800 ${headlineSize}px system-ui, sans-serif`;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';

  const maxTextWidth = canvas.width - paddingX * 2;
  const headlineLines = wrapText(ctx, overlay.headline || asset.headline, maxTextWidth);

  let targetX = paddingX;
  if (textAlign === 'center') targetX = canvas.width / 2;
  if (textAlign === 'right') targetX = canvas.width - paddingX;

  for (const line of headlineLines) {
    // Subtle shadow for legibility
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.fillText(line, targetX, textY);
    textY += headlineSize * 1.22;
  }
  ctx.shadowColor = 'transparent';

  // Subtitle
  textY += Math.round(12 * baseScale);
  ctx.fillStyle = isLightText ? '#cbd5e1' : '#334155';
  ctx.font = `500 ${subtitleSize}px system-ui, sans-serif`;
  const subtitleLines = wrapText(ctx, overlay.subtitle || asset.subtitle, maxTextWidth);
  for (const line of subtitleLines) {
    ctx.fillText(line, targetX, textY);
    textY += subtitleSize * 1.35;
  }

  // Call to Action Button Pill
  if (overlay.callToAction || asset.callToAction) {
    const ctaText = overlay.callToAction || asset.callToAction;
    textY += Math.round(24 * baseScale);
    ctx.font = `700 ${ctaSize}px system-ui, sans-serif`;
    const ctaMetrics = ctx.measureText(ctaText);
    const ctaPadX = Math.round(28 * baseScale);
    const ctaPadY = Math.round(14 * baseScale);
    const btnWidth = ctaMetrics.width + ctaPadX * 2;
    const btnHeight = ctaSize + ctaPadY * 2;

    let btnX = paddingX;
    if (textAlign === 'center') btnX = (canvas.width - btnWidth) / 2;
    if (textAlign === 'right') btnX = canvas.width - paddingX - btnWidth;

    // CTA background gradient (Solar Orange to Gold)
    const btnGrad = ctx.createLinearGradient(btnX, btnY(textY), btnX + btnWidth, btnY(textY) + btnHeight);
    btnGrad.addColorStop(0, '#f97316');
    btnGrad.addColorStop(1, '#ea580c');
    ctx.fillStyle = btnGrad;
    roundRect(ctx, btnX, textY, btnWidth, btnHeight, Math.round(8 * baseScale));
    ctx.fill();

    // CTA Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // CTA Text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ctaText, btnX + btnWidth / 2, textY + btnHeight / 2);
  }

  // Footer bar / URL
  const footerY = canvas.height - Math.round(40 * baseScale);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(0, footerY - 10, canvas.width, Math.round(50 * baseScale));

  ctx.fillStyle = '#94a3b8';
  ctx.font = `600 ${Math.round(14 * baseScale)}px system-ui, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('TechEnergy For Africa e.V. | www.techenergyforafrica.com', paddingX, footerY + 14);

  ctx.textAlign = 'right';
  ctx.fillText(`TEFA CREATIVE STUDIO | ${cfg.name.toUpperCase()}`, canvas.width - paddingX, footerY + 14);

  return canvas.toDataURL('image/png', 0.95);
}

function btnY(y: number): number {
  return y;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

export async function downloadCampaignAssetAsPng(
  asset: CampaignAsset,
  campaignTitle: string = 'TEFA_Campaign'
): Promise<void> {
  const dataUrl = await renderAssetToCanvas(asset);

  const cleanTitle = campaignTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanTitle}_${asset.format}_v${asset.version}.png`;

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
