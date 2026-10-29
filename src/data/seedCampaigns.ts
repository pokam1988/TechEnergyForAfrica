import { GeneratedCampaign, CampaignFormatConfig } from '../types';

export const CAMPAIGN_FORMAT_CONFIGS: CampaignFormatConfig[] = [
  {
    id: 'billboard_poster',
    name: 'Billboard / Großflächenplakat',
    category: 'print',
    aspectRatio: '16:9',
    aspectRatioLabel: '16:9 Querformat',
    width: 1920,
    height: 1080,
    description: 'Großformatige Außenwerbung, Konferenz-Banner und Event-Bühnenhintergründe.',
  },
  {
    id: 'magazine_ad',
    name: 'Zeitschriften- & Print-Anzeige',
    category: 'print',
    aspectRatio: '3:4',
    aspectRatioLabel: '3:4 Hochformat',
    width: 1200,
    height: 1600,
    description: 'Hochwertiges Print-Layout für Fachmagazine, Stifter-Journale und Zeitungsbeilagen.',
  },
  {
    id: 'instagram_square',
    name: 'Instagram Post (Quadratisch)',
    category: 'social',
    aspectRatio: '1:1',
    aspectRatioLabel: '1:1 Quadrat',
    width: 1080,
    height: 1080,
    description: 'Optimal für Social-Media-Feeds auf Instagram, Facebook und WhatsApp-Kanälen.',
  },
  {
    id: 'instagram_story',
    name: 'Instagram & Mobile Story',
    category: 'social',
    aspectRatio: '9:16',
    aspectRatioLabel: '9:16 Vollbild Mobil',
    width: 1080,
    height: 1920,
    description: 'Vollbild-Story für Smartphones, TikTok-Grafiken und WhatsApp-Statusmeldungen.',
  },
  {
    id: 'linkedin_graphic',
    name: 'LinkedIn Kampagnengrafik',
    category: 'social',
    aspectRatio: '16:9',
    aspectRatioLabel: '16:9 Querformat',
    width: 1200,
    height: 675,
    description: 'Professionelles Beitragsbild für LinkedIn-Unternehmensposts und B2B-Outreach.',
  },
  {
    id: 'website_hero',
    name: 'Website Hero Banner',
    category: 'digital',
    aspectRatio: '16:9',
    aspectRatioLabel: '16:9 Breitbild',
    width: 1920,
    height: 800,
    description: 'Titelbanner für TEFA-Webseiten, Projekt-Landingpages und Blog-Leitartikel.',
  },
  {
    id: 'project_flyer',
    name: 'Projektflyer / Infoblatt (A4)',
    category: 'print',
    aspectRatio: '3:4',
    aspectRatioLabel: '3:4 Portrait',
    width: 1240,
    height: 1754,
    description: 'Zweiseitiges Informationsblatt für lokale Schulen, Gemeinden und Bildungsmessen.',
  },
  {
    id: 'donor_presentation_cover',
    name: 'Stifter-Präsentationsdeck Cover',
    category: 'donor_reporting',
    aspectRatio: '16:9',
    aspectRatioLabel: '16:9 Folienformat',
    width: 1920,
    height: 1080,
    description: 'Titelseite für PowerPoint- und PDF-Präsentationen vor institutionellen Gebern.',
  },
  {
    id: 'project_report_cover',
    name: 'Projekt- & Wirkungsbericht Deckblatt',
    category: 'donor_reporting',
    aspectRatio: '3:4',
    aspectRatioLabel: '3:4 Berichtsbuch',
    width: 1240,
    height: 1754,
    description: 'Offizielles Deckblatt für den jährlichen TEFA-Jahres- und Evaluierungsbericht.',
  },
];

// Helper to generate consistent high-fidelity vector artwork for realistic preview & testing
export function generateConsistentSvgArtwork(
  formatId: string,
  subject: string,
  primaryColor: string = '#0f2b48',
  secondaryColor: string = '#10b981',
  accentColor: string = '#f97316'
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}"/>
        <stop offset="50%" stop-color="#1e3a5f"/>
        <stop offset="100%" stop-color="#0a192f"/>
      </linearGradient>
      <linearGradient id="solarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${accentColor}"/>
        <stop offset="100%" stop-color="#fbbf24"/>
      </linearGradient>
      <linearGradient id="ecoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${secondaryColor}"/>
        <stop offset="100%" stop-color="#059669"/>
      </linearGradient>
      <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Background Layer -->
    <rect width="1200" height="800" fill="url(#bgGrad)"/>
    <rect width="1200" height="800" fill="url(#gridPattern)"/>

    <!-- Abstract Horizon & Clean Renewable Energy Motif (Strict No People Compliance) -->
    <path d="M 0 520 Q 300 480 600 530 T 1200 500 L 1200 800 L 0 800 Z" fill="rgba(16, 185, 129, 0.15)"/>
    <path d="M 0 580 Q 400 530 800 590 T 1200 560 L 1200 800 L 0 800 Z" fill="rgba(15, 43, 72, 0.4)"/>

    <!-- Solar Panel Array Graphic -->
    <g transform="translate(420, 360)">
      <!-- Base structure -->
      <polygon points="50,160 270,160 220,240 0,240" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <!-- Solar photovoltaic cells -->
      <polygon points="60,170 260,170 215,230 15,230" fill="#0f172a" stroke="url(#ecoGrad)" stroke-width="2"/>
      <line x1="110" y1="170" x2="65" y2="230" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="160" y1="170" x2="115" y2="230" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="210" y1="170" x2="165" y2="230" stroke="#38bdf8" stroke-width="1.5"/>
      <line x1="38" y1="200" x2="238" y2="200" stroke="#38bdf8" stroke-width="1.5"/>
      <!-- Sun rays / Clean Energy Icon -->
      <circle cx="280" cy="80" r="36" fill="url(#solarGrad)" opacity="0.9"/>
      <path d="M 280 28 L 280 16 M 280 144 L 280 132 M 228 80 L 216 80 M 344 80 L 332 80 M 243 43 L 234 34 M 326 126 L 317 117 M 243 117 L 234 126 M 326 34 L 317 43" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
    </g>

    <!-- Modern Educational Workstation & IT Hardware (No Humans) -->
    <g transform="translate(140, 420)">
      <!-- Clean Minimalist Tech Desk -->
      <rect x="0" y="80" width="260" height="12" rx="4" fill="#334155"/>
      <rect x="20" y="92" width="10" height="90" fill="#1e293b"/>
      <rect x="230" y="92" width="10" height="90" fill="#1e293b"/>
      <!-- Laptop Open with Code & Green Battery Indicator -->
      <polygon points="70,75 190,75 180,20 80,20" fill="#0f172a" stroke="#64748b" stroke-width="2"/>
      <rect x="85" y="25" width="90" height="45" fill="#0284c7" opacity="0.85"/>
      <!-- Battery / Solar Power line -->
      <rect x="95" y="40" width="30" height="15" rx="3" fill="#10b981"/>
      <polygon points="60,80 200,80 215,86 45,86" fill="#475569"/>
    </g>

    <!-- Seedling & Sustainable Growth Motif -->
    <g transform="translate(860, 460)">
      <path d="M 60 120 Q 60 70 90 50 Q 80 90 60 120 Z" fill="url(#ecoGrad)"/>
      <path d="M 60 100 Q 60 60 30 45 Q 40 85 60 100 Z" fill="#34d399"/>
      <rect x="58" y="95" width="4" height="45" fill="#065f46" rx="2"/>
      <!-- Smart sensor node -->
      <circle cx="60" cy="40" r="8" fill="${accentColor}"/>
      <path d="M 60 32 A 16 16 0 0 1 76 48" stroke="rgba(255,255,255,0.7)" fill="none" stroke-width="2"/>
    </g>

    <!-- Subtle Tech / Network Nodes -->
    <g stroke="rgba(255,255,255,0.2)" stroke-width="1.5">
      <circle cx="200" cy="180" r="4" fill="#38bdf8"/>
      <circle cx="360" cy="140" r="5" fill="#10b981"/>
      <circle cx="580" cy="190" r="4" fill="${accentColor}"/>
      <circle cx="820" cy="150" r="6" fill="#38bdf8"/>
      <circle cx="980" cy="220" r="5" fill="#10b981"/>
      <line x1="200" y1="180" x2="360" y2="140"/>
      <line x1="360" y1="140" x2="580" y2="190"/>
      <line x1="580" y1="190" x2="820" y2="150"/>
      <line x1="820" y1="150" x2="980" y2="220"/>
    </g>

    <!-- Watermark / Format Identity Tag -->
    <rect x="40" y="720" width="360" height="36" rx="8" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255,255,255,0.1)"/>
    <text x="55" y="744" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="12" font-weight="600">
      TEFA CREATIVE STUDIO | NO-PEOPLE ARTWORK [${formatId.toUpperCase()}]
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SEED_CAMPAIGNS: GeneratedCampaign[] = [
  {
    id: 'camp_dfg_launch_001',
    brief: {
      id: 'brief_dfg_001',
      projectId: 'proj_dfg_003',
      projectTitle: 'Digital Future Girls – Solar-Powered IT Hub',
      title: 'Digital Future Girls: Solar-Inklusion & Bildungschancen',
      lifecyclePhase: 'fundraising_outreach',
      objective: 'Mobilisierung von Partnerschaften und Fördergeldern für 10 solarbetriebene Schulungsarbeitsplätze in Kamerun.',
      targetAudience: 'Gemeinnützige Stiftungen, bilaterale Entwicklungspartner, CSR-Förderer in Deutschland & Kamerun',
      mainMessage: 'Digitale Zukunft braucht verlässliche Energie: Solarbetriebene IT-Bildung für junge Frauen in Kamerun.',
      callToAction: 'Werden Sie Bildungspartner von TechEnergy For Africa e.V.',
      language: 'de',
      channels: ['linkedin_graphic', 'donor_presentation_cover', 'website_hero', 'billboard_poster'],
      visualStyle: 'modern_flat_vector',
      preferredColors: ['#0f2b48', '#10b981', '#f97316'],
      imageDescription: 'Moderne solarbetriebene IT-Lernstation mit Laptops, Solarmodulen und grünem Technologie-Umfeld ohne sichtbare Personen.',
      textToDisplay: {
        headline: 'Solar-Bildung für die nächste Generation',
        subtitle: '10 verlässliche Lernstationen mit sauberer Solarenergie in Yaoundé',
        callToAction: 'Jetzt TEFA-Projektpartner werden',
      },
      startDate: '2026-11-01',
      endDate: '2027-03-15',
      requiredApprovals: ['Projektleitung (Frederic Pokam)', 'Vorstand TEFA e.V.'],
      supportingDocuments: ['TEFA-2026-CMR-003_Antragsdossier.pdf', 'Machbarkeitsstudie_Solar_2026.pdf'],
      noPeopleMode: true,
      status: 'under_review',
      createdAt: '2026-10-22T08:30:00Z',
      updatedAt: '2026-10-22T09:15:00Z',
      version: 1,
    },
    brandIdentity: {
      projectName: 'Digital Future Girls',
      campaignName: 'Solar-Inklusion & Bildungschancen',
      approvedLogo: {
        useOfficialTefaLogo: true,
        logoSource: 'official_approved_asset',
        disclaimer: 'Offizielles TEFA e.V. Verbands-Brandmark (genehmigt nach Satzung).',
      },
      colorPalette: {
        primary: '#0f2b48',
        secondary: '#10b981',
        accent: '#f97316',
        neutralLight: '#ffffff',
        neutralDark: '#0f172a',
      },
      typographyGuidance: {
        headingFont: 'Plus Jakarta Sans, Inter, system-ui',
        bodyFont: 'Inter, system-ui, sans-serif',
        styleTone: 'Professionell, gemeinnützig, zukunftsorientiert und transparent',
      },
      visualComposition: 'Klarer Fokus auf saubere Solartechnologie, geöffnete Laptops, Schulungs-Equipment und grüne Entwicklung. Keine Personen.',
      visualStyle: 'modern_flat_vector',
      coreVisualSubject: 'Solarenergiesystem und IT-Lernarbeitsplatz',
      keyCampaignMessage: 'Digitale Zukunft braucht verlässliche Energie.',
      noPeopleMode: true,
      disallowedVisualElements: ['human figures', 'faces', 'silhouettes', 'crowds', 'hands'],
      allowedVisualElements: ['solar panels', 'laptops', 'books', 'seedlings', 'circuit boards', 'modern clean desks'],
    },
    masterVisual: {
      imageUrl: generateConsistentSvgArtwork('master_visual', 'Solar IT Hub', '#0f2b48', '#10b981', '#f97316'),
      promptUsed: 'High-tech solar-powered digital education hub in Cameroon. Photovoltaic panels, clean educational computer desks with open laptops, books, green energy accumulator, vibrant sun rays, modern eco-classroom setup. Professional architectural concept art. STRICT CONSTRAINT: NO humans, NO faces, NO human silhouettes, NO hands, NO crowds.',
      negativePrompt: 'people, person, human, face, silhouette, hand, crowd, messy, distorted logos, unrealistic technology',
      generatedAt: '2026-10-22T09:00:00Z',
      model: 'gemini-3.1-flash-lite-image',
      isApprovedAsMaster: true,
    },
    selectedFormats: ['billboard_poster', 'instagram_square', 'linkedin_graphic', 'website_hero', 'donor_presentation_cover'],
    assets: [
      {
        id: 'asset_dfg_billboard_001',
        campaignId: 'camp_dfg_launch_001',
        format: 'billboard_poster',
        version: 1,
        imageUrl: generateConsistentSvgArtwork('billboard_poster', 'Solar IT Hub Billboard', '#0f2b48', '#10b981', '#f97316'),
        headline: 'Solar-Bildung für die nächste Generation',
        subtitle: '10 verlässliche Lernstationen mit Solarenergie in Yaoundé',
        callToAction: 'Jetzt Bildungspartner von TEFA e.V. werden',
        overlayConfig: {
          headline: 'Solar-Bildung für die nächste Generation',
          subtitle: '10 verlässliche Lernstationen mit Solarenergie in Yaoundé',
          callToAction: 'Jetzt Bildungspartner von TEFA e.V. werden',
          organizationBadge: 'TechEnergy For Africa e.V.',
          logoPosition: 'top-left',
          textAlignment: 'left',
          fontSize: 'prominent',
          textColor: 'light',
          overlayOpacity: 0.35,
          badgeText: 'TEFA BILDUNGSINITIATIVE 2026/2027',
        },
        status: 'under_review',
        createdAt: '2026-10-22T09:10:00Z',
        updatedAt: '2026-10-22T09:10:00Z',
        isAiGenerated: true,
        modelUsed: 'gemini-3.1-flash-lite-image',
      },
      {
        id: 'asset_dfg_insta_002',
        campaignId: 'camp_dfg_launch_001',
        format: 'instagram_square',
        version: 1,
        imageUrl: generateConsistentSvgArtwork('instagram_square', 'Solar IT Hub Square', '#0f2b48', '#10b981', '#f97316'),
        headline: 'Digital Future Girls',
        subtitle: 'Bildungschancen durch saubere Solarenergie',
        callToAction: 'Erfahre mehr auf techenergyforafrica.org',
        overlayConfig: {
          headline: 'Digital Future Girls',
          subtitle: 'Bildungschancen durch saubere Solarenergie',
          callToAction: 'Erfahre mehr auf techenergyforafrica.org',
          organizationBadge: 'TechEnergy For Africa e.V.',
          logoPosition: 'top-left',
          textAlignment: 'center',
          fontSize: 'medium',
          textColor: 'light',
          overlayOpacity: 0.4,
          badgeText: 'INNOVATION & SOLAR',
        },
        status: 'under_review',
        createdAt: '2026-10-22T09:11:00Z',
        updatedAt: '2026-10-22T09:11:00Z',
        isAiGenerated: true,
        modelUsed: 'gemini-3.1-flash-lite-image',
      },
      {
        id: 'asset_dfg_linkedin_003',
        campaignId: 'camp_dfg_launch_001',
        format: 'linkedin_graphic',
        version: 1,
        imageUrl: generateConsistentSvgArtwork('linkedin_graphic', 'Solar IT Hub LinkedIn', '#0f2b48', '#10b981', '#f97316'),
        headline: 'Zukunftsfähige IT-Infrastruktur in Kamerun',
        subtitle: 'Wie TechEnergy For Africa e.V. erneuerbare Energien mit digitaler Bildung verknüpft',
        callToAction: 'Partnerschaft anfragen',
        overlayConfig: {
          headline: 'Zukunftsfähige IT-Infrastruktur in Kamerun',
          subtitle: 'Wie TechEnergy For Africa e.V. erneuerbare Energien mit digitaler Bildung verknüpft',
          callToAction: 'Partnerschaft anfragen',
          organizationBadge: 'TechEnergy For Africa e.V.',
          logoPosition: 'top-right',
          textAlignment: 'left',
          fontSize: 'medium',
          textColor: 'light',
          overlayOpacity: 0.35,
          badgeText: 'PARTNERSCHAFT & CSR',
        },
        status: 'under_review',
        createdAt: '2026-10-22T09:12:00Z',
        updatedAt: '2026-10-22T09:12:00Z',
        isAiGenerated: true,
        modelUsed: 'gemini-3.1-flash-lite-image',
      },
      {
        id: 'asset_dfg_donor_004',
        campaignId: 'camp_dfg_launch_001',
        format: 'donor_presentation_cover',
        version: 1,
        imageUrl: generateConsistentSvgArtwork('donor_presentation_cover', 'Solar IT Hub Donor Deck', '#0f2b48', '#10b981', '#f97316'),
        headline: 'Projekt-Dossier: Digital Future Girls',
        subtitle: 'Investition in nachhaltige Bildungsinfrastruktur in Kamerun',
        callToAction: 'TechEnergy For Africa e.V. – Förderübersicht 2026/2027',
        overlayConfig: {
          headline: 'Projekt-Dossier: Digital Future Girls',
          subtitle: 'Investition in nachhaltige Bildungsinfrastruktur in Kamerun',
          callToAction: 'TechEnergy For Africa e.V. – Förderübersicht 2026/2027',
          organizationBadge: 'TechEnergy For Africa e.V.',
          logoPosition: 'top-left',
          textAlignment: 'left',
          fontSize: 'prominent',
          textColor: 'light',
          overlayOpacity: 0.45,
          badgeText: 'STIFTER-PRÄSENTATION',
        },
        status: 'under_review',
        createdAt: '2026-10-22T09:13:00Z',
        updatedAt: '2026-10-22T09:13:00Z',
        isAiGenerated: true,
        modelUsed: 'gemini-3.1-flash-lite-image',
      },
    ],
    approvalHistory: [
      {
        id: 'app_hist_001',
        status: 'draft',
        changedBy: 'Frederic Pokam',
        changedByRole: 'project_manager',
        timestamp: '2026-10-22T08:30:00Z',
        comment: 'Kampagnen-Briefing und Master-Visual für Digital Future Girls erstellt.',
      },
      {
        id: 'app_hist_002',
        status: 'under_review',
        changedBy: 'Frederic Pokam',
        changedByRole: 'project_manager',
        timestamp: '2026-10-22T09:15:00Z',
        comment: 'Zur Prüfung an den Vorstand vorgelegt. Externe Veröffentlichung steht aus.',
      },
    ],
    isSavedToProject: true,
    savedToProjectId: 'proj_dfg_003',
  },
  {
    id: 'camp_ifopsim_inclusive_002',
    brief: {
      id: 'brief_ifopsim_002',
      projectId: 'proj_ifopsim_001',
      projectTitle: 'IFOPSIM – Inclusive Digital Vocational Training, Cameroon',
      title: 'Digital Skills. Inclusive Futures.',
      lifecyclePhase: 'idea_proposal',
      objective: 'Present the concept of an inclusive digital vocational training initiative for deaf and hard-of-hearing young people in Cameroon.',
      targetAudience: 'Young deaf people, educational institutions, potential project partners, and donors.',
      mainMessage: 'IFOPSIM – Digital Skills. Inclusive Futures.: Presenting the concept of an inclusive, barrier-free digital vocational training lab for deaf and hard-of-hearing young people in Cameroon.',
      callToAction: 'Discover the initiative',
      language: 'en',
      channels: ['donor_presentation_cover', 'linkedin_graphic', 'billboard_poster'],
      visualStyle: 'photo_documentary',
      preferredColors: ['#0f2b48', '#10b981', '#ffffff', '#f97316'],
      imageDescription: 'A modern, welcoming digital learning environment featuring computers, educational technology, accessible visual learning materials, and a subtle connection to Cameroon. Strictly no people, faces, hands, or silhouettes.',
      textToDisplay: {
        headline: 'IFOPSIM – Digital Skills. Inclusive Futures.',
        subtitle: 'An inclusive vocational education initiative in development.',
        callToAction: 'Discover the initiative',
      },
      startDate: '2026-11-01',
      endDate: '2027-05-31',
      requiredApprovals: ['Vorstand TEFA e.V.', 'Projektleitung (Marc Tagne)'],
      supportingDocuments: ['IFOPSIM_Inclusive_Vocational_Concept_Note_Draft.pdf'],
      noPeopleMode: true,
      status: 'draft',
      createdAt: '2026-10-24T10:00:00Z',
      updatedAt: '2026-10-24T10:00:00Z',
      version: 1,
    },
    brandIdentity: {
      projectName: 'IFOPSIM',
      campaignName: 'Digital Skills. Inclusive Futures.',
      approvedLogo: {
        useOfficialTefaLogo: true,
        logoSource: 'official_approved_asset',
        disclaimer: 'Offizielles TEFA e.V. Verbands-Brandmark (genehmigt nach Satzung).',
      },
      colorPalette: {
        primary: '#0f2b48',
        secondary: '#10b981',
        accent: '#f97316',
        neutralLight: '#ffffff',
        neutralDark: '#0f172a',
      },
      typographyGuidance: {
        headingFont: 'Plus Jakarta Sans, Inter, system-ui',
        bodyFont: 'Inter, system-ui, sans-serif',
        styleTone: 'Modern, welcoming, professional, realistic, environmentally conscious',
      },
      visualComposition: 'Modern digital vocational classroom in Douala Cameroon with accessible computer workstations, visual sign language learning charts, tropical plants, solar backup unit, warm sunlight, zero humans.',
      visualStyle: 'photo_documentary',
      coreVisualSubject: 'Accessible digital vocational training laboratory for deaf and hard-of-hearing learners in Cameroon',
      keyCampaignMessage: 'Digital Skills. Inclusive Futures.',
      noPeopleMode: true,
      disallowedVisualElements: ['human figures', 'faces', 'silhouettes', 'crowds', 'hands'],
      allowedVisualElements: ['computers', 'laptops', 'tablets', 'chalkboard diagrams', 'sign language charts', 'solar backup unit', 'tropical plants', 'wooden desks'],
    },
    masterVisual: {
      imageUrl: '/assets/images/ifopsim_master_visual_1792938889435.jpg',
      promptUsed: 'Modern welcoming digital vocational training classroom concept in Cameroon designed for inclusive education for deaf and hard-of-hearing learners. Wooden desks with open laptop computers displaying accessible visual interfaces and graphic learning materials, tablet stands with colorful visual study charts, large chalkboard with clean diagrams, subtle Douala Cameroon architectural accents, warm natural tropical sunlight through windows, lush green indoor plants, clean solar-battery power unit mounted neatly in background. Strictly NO people, NO human figures, NO faces, NO human silhouettes, NO hands, NO crowds.',
      negativePrompt: 'people, person, human, face, silhouette, hand, crowd, messy, distorted logos, unrealistic technology',
      generatedAt: '2026-10-25T07:34:50Z',
      model: 'gemini-3.1-flash-lite-image',
      isApprovedAsMaster: true,
    },
    selectedFormats: ['donor_presentation_cover', 'linkedin_graphic', 'billboard_poster'],
    assets: [
      {
        id: 'asset_ifopsim_presentation_001',
        campaignId: 'camp_ifopsim_inclusive_002',
        format: 'donor_presentation_cover',
        version: 1,
        imageUrl: '/assets/images/ifopsim_master_visual_1792938889435.jpg',
        headline: 'IFOPSIM – Digital Skills. Inclusive Futures.',
        subtitle: 'An inclusive vocational education initiative in development.',
        callToAction: 'Discover the initiative',
        overlayConfig: {
          headline: 'IFOPSIM – Digital Skills. Inclusive Futures.',
          subtitle: 'An inclusive vocational education initiative in development.',
          callToAction: 'Discover the initiative',
          organizationBadge: 'TechEnergy For Africa e.V.',
          logoPosition: 'top-left',
          textAlignment: 'left',
          fontSize: 'prominent',
          textColor: 'light',
          overlayOpacity: 0.38,
          badgeText: 'PROJECT PRESENTATION CONCEPT',
        },
        status: 'draft',
        createdAt: '2026-10-24T10:05:00Z',
        updatedAt: '2026-10-24T10:05:00Z',
        isAiGenerated: true,
        modelUsed: 'gemini-3.1-flash-lite-image',
      },
      {
        id: 'asset_ifopsim_linkedin_002',
        campaignId: 'camp_ifopsim_inclusive_002',
        format: 'linkedin_graphic',
        version: 1,
        imageUrl: '/assets/images/ifopsim_master_visual_1792938889435.jpg',
        headline: 'IFOPSIM – Digital Skills. Inclusive Futures.',
        subtitle: 'An inclusive vocational education initiative in development.',
        callToAction: 'Discover the initiative',
        overlayConfig: {
          headline: 'IFOPSIM – Digital Skills. Inclusive Futures.',
          subtitle: 'An inclusive vocational education initiative in development.',
          callToAction: 'Discover the initiative',
          organizationBadge: 'TechEnergy For Africa e.V.',
          logoPosition: 'top-right',
          textAlignment: 'left',
          fontSize: 'medium',
          textColor: 'light',
          overlayOpacity: 0.40,
          badgeText: 'INCLUSIVE VOCATIONAL INITIATIVE',
        },
        status: 'draft',
        createdAt: '2026-10-24T10:05:00Z',
        updatedAt: '2026-10-24T10:05:00Z',
        isAiGenerated: true,
        modelUsed: 'gemini-3.1-flash-lite-image',
      },
      {
        id: 'asset_ifopsim_poster_003',
        campaignId: 'camp_ifopsim_inclusive_002',
        format: 'billboard_poster',
        version: 1,
        imageUrl: '/assets/images/ifopsim_master_visual_1792938889435.jpg',
        headline: 'IFOPSIM – Digital Skills. Inclusive Futures.',
        subtitle: 'An inclusive vocational education initiative in development.',
        callToAction: 'Discover the initiative',
        overlayConfig: {
          headline: 'IFOPSIM – Digital Skills. Inclusive Futures.',
          subtitle: 'An inclusive vocational education initiative in development.',
          callToAction: 'Discover the initiative',
          organizationBadge: 'TechEnergy For Africa e.V.',
          logoPosition: 'top-left',
          textAlignment: 'left',
          fontSize: 'prominent',
          textColor: 'light',
          overlayOpacity: 0.38,
          badgeText: 'DONOR CONCEPT NOTE',
        },
        status: 'draft',
        createdAt: '2026-10-24T10:05:00Z',
        updatedAt: '2026-10-24T10:05:00Z',
        isAiGenerated: true,
        modelUsed: 'gemini-3.1-flash-lite-image',
      },
    ],
    approvalHistory: [
      {
        id: 'app_hist_ifop_001',
        status: 'draft',
        changedBy: 'Marc Tagne',
        changedByRole: 'project_manager',
        timestamp: '2026-10-24T10:00:00Z',
        comment: 'Entwurf für IFOPSIM Inklusions-Kampagnenkonzept angelegt. Ausdrücklich im Planungsstadium (Draft), keine vorzeitige Veröffentlichung.',
      },
    ],
    isSavedToProject: true,
    savedToProjectId: 'proj_ifopsim_001',
  },
  {
    id: 'camp_gen_green_awareness_001',
    brief: {
      id: 'brief_gen_green_001',
      projectId: 'proj_gen_green_002',
      projectTitle: 'Generation Green – Environmental Education and Sustainability',
      title: 'Generation Green – Small Actions, Big Change',
      lifecyclePhase: 'awareness_campaign',
      objective: 'Inspire young people to engage in environmental protection, sustainability, and practical green innovation.',
      targetAudience: 'Young people, educational institutions, potential project partners, and donors.',
      mainMessage: 'Generation Green – Small Actions, Big Change: Empowering youth through practical environmental protection, clean solar technology, and sustainable green innovation.',
      callToAction: 'Discover the initiative',
      language: 'en',
      channels: ['billboard_poster', 'instagram_square', 'linkedin_graphic'],
      visualStyle: 'photo_documentary',
      preferredColors: ['#15803d', '#0f2b48', '#ffffff', '#f59e0b'],
      imageDescription: 'A small green plant growing from a recycled computer motherboard, surrounded by subtle solar-energy and environmental design elements bathed in warm sunlight.',
      textToDisplay: {
        headline: 'Generation Green – Small Actions, Big Change',
        subtitle: 'Inspire young people to engage in environmental protection, sustainability, and practical green innovation.',
        callToAction: 'Discover the initiative',
      },
      startDate: '2026-11-01',
      endDate: '2027-04-30',
      requiredApprovals: ['Vorstand TEFA e.V.', 'Projektleitung (Amina Diallo)'],
      supportingDocuments: ['Generation_Green_Curriculum_Draft.pdf'],
      noPeopleMode: true,
      status: 'draft',
      createdAt: '2026-10-23T15:00:00Z',
      updatedAt: '2026-10-23T15:00:00Z',
      version: 1,
    },
    brandIdentity: {
      projectName: 'Generation Green',
      campaignName: 'Generation Green – Small Actions, Big Change',
      approvedLogo: {
        useOfficialTefaLogo: true,
        logoSource: 'official_approved_asset',
        disclaimer: 'Offizielles TEFA e.V. Verbands-Brandmark (genehmigt nach Satzung).',
      },
      colorPalette: {
        primary: '#15803d',
        secondary: '#0f2b48',
        accent: '#f59e0b',
        neutralLight: '#ffffff',
        neutralDark: '#0f172a',
      },
      typographyGuidance: {
        headingFont: 'Plus Jakarta Sans, Inter, system-ui',
        bodyFont: 'Inter, system-ui, sans-serif',
        styleTone: 'Modern, optimistic, professional, realistic, environmentally conscious',
      },
      visualComposition: 'Macro focus on a young green plant seedling emerging from recycled motherboard circuitry with photovoltaic cell accents and golden solar lighting. Strictly zero human figures.',
      visualStyle: 'photo_documentary',
      coreVisualSubject: 'Small plant sprout growing from recycled computer motherboard with solar-energy elements',
      keyCampaignMessage: 'Small Actions, Big Change',
      noPeopleMode: true,
      disallowedVisualElements: ['human figures', 'faces', 'silhouettes', 'crowds', 'hands'],
      allowedVisualElements: ['plant seedling', 'recycled motherboard', 'circuit board', 'photovoltaic solar cells', 'golden sunlight', 'macro natural bokeh'],
    },
    masterVisual: {
      imageUrl: '/assets/images/gengreen_master_1792768070112.jpg',
      promptUsed: 'Photorealistic macro close-up of a small vibrant green plant sprout growing upwards out of the intricate microchip circuits of a recycled computer motherboard, surrounded by miniature solar-energy cell patterns, bathed in warm natural golden sunlight rays and soft forest green bokeh. Professional, modern, optimistic environmental technology aesthetic. Strictly no people, no human figures, no faces, no hands, no human silhouettes.',
      negativePrompt: 'people, person, human, face, silhouette, hand, crowd, messy, distorted logos, unrealistic technology',
      generatedAt: '2026-10-23T15:07:00Z',
      model: 'gemini-3.1-flash-lite-image',
      isApprovedAsMaster: true,
    },
    selectedFormats: ['billboard_poster', 'instagram_square', 'linkedin_graphic'],
    assets: [
      {
        id: 'asset_gg_poster_001',
        campaignId: 'camp_gen_green_awareness_001',
        format: 'billboard_poster',
        version: 1,
        imageUrl: '/assets/images/gengreen_master_1792768070112.jpg',
        headline: 'Generation Green – Small Actions, Big Change',
        subtitle: 'Practical green innovation and environmental education with TechEnergy For Africa e.V.',
        callToAction: 'Discover the initiative',
        overlayConfig: {
          headline: 'Generation Green – Small Actions, Big Change',
          subtitle: 'Practical green innovation and environmental education with TechEnergy For Africa e.V.',
          callToAction: 'Discover the initiative',
          organizationBadge: 'TechEnergy For Africa e.V.',
          logoPosition: 'top-left',
          textAlignment: 'left',
          fontSize: 'prominent',
          textColor: 'light',
          overlayOpacity: 0.38,
          badgeText: 'TEFA ENVIRONMENTAL EDUCATION',
        },
        status: 'draft',
        createdAt: '2026-10-23T15:08:00Z',
        updatedAt: '2026-10-23T15:08:00Z',
        isAiGenerated: true,
        modelUsed: 'gemini-3.1-flash-lite-image',
      },
      {
        id: 'asset_gg_insta_002',
        campaignId: 'camp_gen_green_awareness_001',
        format: 'instagram_square',
        version: 1,
        imageUrl: '/assets/images/gengreen_master_1792768070112.jpg',
        headline: 'Generation Green – Small Actions, Big Change',
        subtitle: 'Inspiring youth in sustainability and practical solar innovation',
        callToAction: 'Discover the initiative',
        overlayConfig: {
          headline: 'Generation Green – Small Actions, Big Change',
          subtitle: 'Inspiring youth in sustainability and practical solar innovation',
          callToAction: 'Discover the initiative',
          organizationBadge: 'TechEnergy For Africa e.V.',
          logoPosition: 'top-left',
          textAlignment: 'center',
          fontSize: 'medium',
          textColor: 'light',
          overlayOpacity: 0.4,
          badgeText: 'GENERATION GREEN',
        },
        status: 'draft',
        createdAt: '2026-10-23T15:08:00Z',
        updatedAt: '2026-10-23T15:08:00Z',
        isAiGenerated: true,
        modelUsed: 'gemini-3.1-flash-lite-image',
      },
      {
        id: 'asset_gg_linkedin_003',
        campaignId: 'camp_gen_green_awareness_001',
        format: 'linkedin_graphic',
        version: 1,
        imageUrl: '/assets/images/gengreen_master_1792768070112.jpg',
        headline: 'Generation Green – Small Actions, Big Change',
        subtitle: 'Empowering youth through practical environmental protection & green innovation',
        callToAction: 'Discover the initiative',
        overlayConfig: {
          headline: 'Generation Green – Small Actions, Big Change',
          subtitle: 'Empowering youth through practical environmental protection & green innovation',
          callToAction: 'Discover the initiative',
          organizationBadge: 'TechEnergy For Africa e.V.',
          logoPosition: 'top-right',
          textAlignment: 'left',
          fontSize: 'medium',
          textColor: 'light',
          overlayOpacity: 0.36,
          badgeText: 'GREEN INNOVATION BRIEF',
        },
        status: 'draft',
        createdAt: '2026-10-23T15:08:00Z',
        updatedAt: '2026-10-23T15:08:00Z',
        isAiGenerated: true,
        modelUsed: 'gemini-3.1-flash-lite-image',
      },
    ],
    approvalHistory: [
      {
        id: 'app_hist_gg_001',
        status: 'draft',
        changedBy: 'Amina Diallo',
        changedByRole: 'member',
        timestamp: '2026-10-23T15:00:00Z',
        comment: 'Kampagnen-Entwurf Generation Green erstellt (Konzeptentwurf, unbestätigt).',
      },
    ],
    isSavedToProject: true,
    savedToProjectId: 'proj_gen_green_002',
  },
];
