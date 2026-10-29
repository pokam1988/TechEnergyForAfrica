# ImpactFlow – Entwicklerhandbuch (Developer Guide)
> **Architektur, Multi-Mandanten-Isolation, REST API und Test-Spezifikation**

---

## 1. Technischer Stack

- **Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Three.js (3D Solar Lab Digital Twin).
- **Backend:** Node.js Express mit TypeScript via `tsx server.ts`.
- **Datenpersistenz:** Dateibasierte persistente JSON-Datenbank im Verzeichnis `/data/` (`projects.json`, `organizations.json`, `programmes.json`, `inventory.json`, `audit_logs.json`, `campaigns.json`).
- **KI-Integration:** `@google/genai` TypeScript SDK (Modelle: `gemini-3.8-flash` für Text/Proposal/SWOT-Tiebreaker, `gemini-3.1-flash-lite-image` / `gemini-nano-banana-2.1` für Creative Studio).
- **Test-Framework:** Native Node.js Test Runner (`node:test`, `node:assert/strict`) via `tsx --test tests/*.test.ts`.

---

## 2. Projektstruktur

```text
/
├── server.ts                    # Express Server & REST API Endpoints
├── index.html                   # HTML Einstiegspunkt (ImpactFlow Branding)
├── package.json                 # Skripte & Abhängigkeiten
├── README.md                    # Projekt-Überblick
├── USER_GUIDE.md                # Benutzer- & Programmleiter-Handbuch
├── DEVELOPER_GUIDE.md           # Dieses Entwicklerhandbuch
├── data/                        # Persistente JSON-Datenbankdateien
├── tests/                       # Vollständige Regression- & Integritäts-Tests
│   ├── regression.test.ts
│   ├── dashboard_regression_integrity.test.ts
│   ├── ifopsim_demo_verification.test.ts
│   ├── project_intelligence.test.ts
│   ├── creative_studio.test.ts
│   └── multi_org_and_profile.test.ts
└── src/
    ├── types/index.ts           # Kern-Typdefinitionen (Project, Organization, UserProfile)
    ├── data/                    # Seed-Datensätze (Organizations, Projects, Campaigns)
    │   ├── seedOrganizations.ts # TEFA (org_tefa), Global Eco (org_global_eco), TGIEP
    │   ├── seedProjects.ts      # IFOPSIM, Generation Green, Digital Future Girls
    │   └── seedCampaigns.ts     # Creative Studio Kampagnenvorlagen
    ├── context/                 # State-Management-Schicht
    │   ├── OrganizationContext.tsx # Aktiver Workspace, Org-Wechsel, Onboarding
    │   ├── AuthRoleContext.tsx     # Benutzerprofile, Rollen, 4-Augen-Audit
    │   └── ProjectContext.tsx      # Projektdaten, Filterung nach activeOrgId
    ├── i18n/                    # Mehrsprachigkeit (DE, EN, FR)
    ├── components/              # Modulare UI-Komponenten
    │   ├── Header.tsx           # Globaler Header, Workspace- & Profilwähler
    │   ├── Sidebar.tsx          # 15 Module / Phasen Navigation
    │   ├── organization/        # NewOrganizationModal.tsx
    │   ├── profile/             # UserProfileModal.tsx
    │   ├── dashboard/           # OverviewDashboard.tsx (KPIs, Charts)
    │   ├── intelligence/        # ProjectIntelligenceView.tsx
    │   ├── simulator/           # ProjectSimulator.tsx (Sensitivitätsanalyse)
    │   ├── creative-studio/     # CreativeStudioView.tsx (Canvas & Marketing)
    │   └── ...                  # Proposal, Feasibility, Planning, Finance, etc.
    └── utils/                   # Berechnungs- und Rendering-Helfer (canvasRenderer.ts)
```

---

## 3. Architektur der Mandantentrennung (Multi-Organization Isolation)

### 3.1 Hierarchie & Entitäten
```typescript
interface Organization {
  id: string;              // z.B. 'org_tefa', 'org_global_eco'
  name: string;            // 'TechEnergy For Africa e.V.'
  legalForm?: string;      // 'Eingetragener Verein (e.V.)'
  country: string;         // 'Deutschland'
  website: string;         // 'https://www.techenergyforafrica.org'
  defaultCurrency: 'EUR' | 'USD' | 'XAF' | 'GBP' | 'CHF';
  timeZone: string;
  primaryLanguage: 'de' | 'en' | 'fr';
  status: 'active' | 'suspended';
  createdAt: string;
}

interface Project {
  id: string;
  organizationId: string;  // Zwingende Mandanten-Zuordnung (Default: 'org_tefa')
  programmeId?: string;    // Optionale Zuordnung (z.B. 'prog_tgiep')
  referenceId: string;     // z.B. TEFA-2026-CMR-001
  title: string;
  ...
}
```

### 3.2 Backend Isolation (`server.ts`)
- Bei jedem `GET /api/projects` wird der Header `x-organization-id` ausgewertet:
```typescript
app.get('/api/projects', (req: Request, res: Response) => {
  const orgId = (req.headers['x-organization-id'] as string) || (req.query.orgId as string);
  if (orgId) {
    const orgProjects = projects.filter((p) => (p.organizationId || 'org_tefa') === orgId);
    return res.json(orgProjects);
  }
  res.json(projects);
});
```
- Beim Anlegen von Projekten (`POST /api/projects`) wird die `organizationId` zwingend vergeben:
```typescript
const orgId = newProj.organizationId || (req.headers['x-organization-id'] as string) || 'org_tefa';
newProj.organizationId = orgId;
```

### 3.3 Frontend Isolation (`ProjectContext.tsx`)
```typescript
const { activeOrgId } = useOrganization();
const projects = allProjects.filter((p) => (p.organizationId || 'org_tefa') === activeOrgId);
```
Sobald der Benutzer im Header die Organisation wechselt, aktualisieren sich sämtliche Dashboards, Listen und Meilensteine ohne Seiten-Reload.

---

## 4. REST API Referenz

| Methode | Endpunkt | Beschreibung | Authentifizierung / Header |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/system/status` | Systemstatus, Speicherort, aktive Organisation | `x-organization-id` |
| `GET` | `/api/organizations` | Liste aller registrierten Organisationen | öffentlich |
| `POST` | `/api/organizations` | Neue Organisation onboarden | JSON Body (`name`, `country`, ...) |
| `PUT` | `/api/organizations/:id` | Stammdaten einer Organisation aktualisieren | JSON Body |
| `GET` | `/api/programmes` | Programme der Organisation abrufen | `x-organization-id` |
| `POST` | `/api/programmes` | Neues Programm anlegen | JSON Body (`organizationId`, `name`, ...) |
| `GET` | `/api/projects` | Projekte der Organisation abrufen | `x-organization-id`, `x-user-role` |
| `POST` | `/api/projects` | Neues Projekt anlegen | JSON Body |
| `PUT` | `/api/projects/:id` | Projekt aktualisieren | Governance-Prüfung nach Rolle |
| `DELETE` | `/api/projects/:id` | Projekt löschen | Nur autorisierte Rollen |
| `POST` | `/api/ai/proposal-assist` | KI-Vorschlag zur Antragsoptimierung | JSON (`title`, `problemStatement`) |
| `POST` | `/api/ai/advisor` | KI-Entscheidungs-Tiebreaker (SWOT) | JSON (`criteria`, `options`) |

---

## 5. Testen & Qualitätssicherung

Die Plattform verfügt über 51 automatisierte Unit- und Integrationstests:

```bash
# Alle Tests ausführen
npm test

# TypeScript Syntax- und Typenprüfung
npm run lint

# Lokaler Produktionsbuild
npm run build
```

### Richtlinien für neue Features:
1. **Keine harten Abhängigkeiten zu TEFA/TGIEP im Core-Code:** Spezifische Daten gehören in `org_tefa` und `prog_tgiep`.
2. **Finanzformeln niemals unbegründet ändern:** Alle Budget- und Ist-Kosten-Berechnungen müssen 100% kongruent mit den Regressionstests bleiben.
3. **Fakten vs. Hypothesen:** Jedes neue Datenfeld für Kennzahlen muss ein `evidenceStatus` Feld (`confirmed_fact`, `hypothetical_assumption`, `missing_information`, `ai_generated`) unterstützen.
