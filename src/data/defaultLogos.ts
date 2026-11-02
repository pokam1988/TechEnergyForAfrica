/**
 * Default High-Resolution Vector Logos & Presets for NGOs
 * Supports TechEnergy For Africa e.V. and Universal Organizations
 */

// Official SVG vector logo data URL for TechEnergy For Africa e.V.
export const TEFA_OFFICIAL_SVG_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
  <defs>
    <linearGradient id="tefaSun" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <linearGradient id="tefaLeaf" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  
  <!-- Emblem Icon -->
  <g transform="translate(10, 8)">
    <!-- Sun disk with rays -->
    <circle cx="32" cy="32" r="16" fill="url(#tefaSun)" />
    <!-- Radiating Solar Beams -->
    <path d="M32 6 L32 11 M32 53 L32 58 M6 32 L11 32 M53 32 L58 32 M14 14 L18 18 M46 46 L50 50 M14 50 L18 46 M46 18 L50 14" 
          stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    
    <!-- Stylized Green Tech Leaf / Energy Blade -->
    <path d="M32 18 C44 22 48 36 44 48 C36 48 24 44 20 32 C26 30 30 24 32 18 Z" 
          fill="url(#tefaLeaf)" opacity="0.95"/>
    <path d="M22 36 Q32 32 40 44" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none"/>
    
    <!-- Tech Dot Connector -->
    <circle cx="40" cy="44" r="2.5" fill="#ffffff" />
  </g>

  <!-- Typography: TechEnergy For Africa e.V. -->
  <text x="82" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="19" fill="#0f172a" letter-spacing="-0.3">
    TECH<tspan fill="#059669">ENERGY</tspan>
  </text>
  <text x="82" y="48" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="12" fill="#d97706" letter-spacing="1.2">
    FOR AFRICA <tspan fill="#64748b" font-weight="600">e.V.</tspan>
  </text>
  <text x="82" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="8.5" fill="#64748b" letter-spacing="0.4">
    FROM IDEA TO IMPACT • BERLIN &amp; DOUALA
  </text>
</svg>`);

export const GLOBAL_ECO_SVG_LOGO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
  <defs>
    <linearGradient id="ecoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>
  
  <g transform="translate(12, 10)">
    <circle cx="30" cy="30" r="26" fill="url(#ecoGrad)" opacity="0.15" />
    <circle cx="30" cy="30" r="20" fill="none" stroke="#0284c7" stroke-width="3" />
    <!-- Leaf in circle -->
    <path d="M30 16 C38 16 42 24 42 32 C34 36 26 34 22 28 C22 20 26 16 30 16 Z" fill="#059669"/>
    <path d="M22 36 C26 40 34 44 40 40" stroke="#0284c7" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </g>

  <text x="80" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="18" fill="#0f172a">
    GLOBAL <tspan fill="#0284c7">ECO</tspan> FOUNDATION
  </text>
  <text x="80" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="500" font-size="10" fill="#64748b" letter-spacing="0.5">
    COMMUNITY &amp; SUSTAINABILITY INITIATIVES • ZÜRICH
  </text>
</svg>`);

export interface PresetLogo {
  id: string;
  name: string;
  category: string;
  svgDataUrl: string;
  brandColor: string;
}

export const PRESET_NGO_LOGOS: PresetLogo[] = [
  {
    id: 'tefa',
    name: 'TechEnergy For Africa e.V.',
    category: 'Solar & Digital Inclusion',
    svgDataUrl: TEFA_OFFICIAL_SVG_LOGO,
    brandColor: '#059669',
  },
  {
    id: 'eco',
    name: 'Global Eco & Community Foundation',
    category: 'Ecology & Environment',
    svgDataUrl: GLOBAL_ECO_SVG_LOGO,
    brandColor: '#0284c7',
  },
  {
    id: 'health',
    name: 'Santé Sans Frontières / Health For All',
    category: 'Humanitarian & Health',
    svgDataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
      <rect x="15" y="15" width="50" height="50" rx="12" fill="#ef4444" opacity="0.12"/>
      <path d="M40 22 L40 58 M22 40 L58 40" stroke="#ef4444" stroke-width="7" stroke-linecap="round"/>
      <text x="80" y="36" font-family="sans-serif" font-weight="800" font-size="18" fill="#0f172a">HEALTH AID <tspan fill="#ef4444">GLOBAL</tspan></text>
      <text x="80" y="54" font-family="sans-serif" font-weight="600" font-size="10" fill="#64748b">HUMANITARIAN MEDICAL INITIATIVES</text>
    </svg>`),
    brandColor: '#dc2626',
  },
  {
    id: 'education',
    name: 'Education For Tomorrow Foundation',
    category: 'Youth & Education',
    svgDataUrl:
      'data:image/svg+xml;utf8,' +
      encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" width="320" height="80">
      <rect x="15" y="15" width="50" height="50" rx="12" fill="#6366f1" opacity="0.12"/>
      <path d="M40 20 L22 30 L40 40 L58 30 Z M27 36 L27 48 Q40 56 53 48 L53 36" stroke="#4f46e5" stroke-width="3" stroke-linecap="round" fill="none"/>
      <text x="80" y="36" font-family="sans-serif" font-weight="800" font-size="17" fill="#0f172a">FUTURE <tspan fill="#4f46e5">EDUCATION</tspan></text>
      <text x="80" y="54" font-family="sans-serif" font-weight="600" font-size="10" fill="#64748b">INCLUSIVE SCHOLARSHIPS &amp; SKILLS</text>
    </svg>`),
    brandColor: '#4f46e5',
  },
];
