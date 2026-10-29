import { Organization, Programme } from '../types';

export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: 'org_tefa',
    name: 'TechEnergy For Africa e.V.',
    legalForm: 'Eingetragener Verein (e.V.)',
    country: 'Deutschland',
    website: 'https://www.techenergyforafrica.org',
    defaultCurrency: 'EUR',
    timeZone: 'Europe/Berlin',
    primaryLanguage: 'de',
    description:
      'Gemeinnütziger Verein mit Sitz in Berlin zur Förderung von erneuerbaren Energien, digitaler Inklusion und nachhaltigen Bildungspartnerschaften in Afrika.',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'org_global_eco',
    name: 'Global Eco & Community Foundation',
    legalForm: 'International Nonprofit Foundation',
    country: 'Schweiz',
    website: 'https://global-eco-community.org',
    defaultCurrency: 'CHF',
    timeZone: 'Europe/Zurich',
    primaryLanguage: 'en',
    description:
      'Independent charitable foundation advancing community-led ecology, clean water access, and vocational inclusion across multiple continents.',
    status: 'active',
    createdAt: '2025-09-15T00:00:00Z',
  },
];

export const SEED_PROGRAMMES: Programme[] = [
  {
    id: 'prog_tgiep',
    organizationId: 'org_tefa',
    name: 'TGIEP – The Global Internship & Education Programme',
    description:
      'Cross-border vocational internship, digital skills transfer, and academic collaboration programme connecting students, universities, and practical NGO initiatives between Europe and Africa.',
    lead: 'Dr. Frederic Pokam',
    status: 'active',
    createdAt: '2025-06-01T00:00:00Z',
  },
];
