# ImpactFlow – From Idea to Impact
> **Universelle Multi-Organisations-Plattform für gemeinnütziges Projekt- & Wirkungswesen**  
> *Universal NGO Project Lifecycle, Governance & Impact Management Platform*

---

## 🌟 Über die Plattform (About the Platform)

**ImpactFlow – From Idea to Impact** ist eine modulare, organisationsneutrale Open-Source-fähige Plattform für gemeinnützige Vereine, Stiftungen, NGOs, Sozialunternehmen und internationale Hilfsorganisationen.

Die Plattform wurde ursprünglich für **TechEnergy For Africa e.V. (TEFA)** ([www.techenergyforafrica.org](https://www.techenergyforafrica.org)) entwickelt und ist nun so modularisiert, dass **beliebige unabhängige Organisationen weltweit** ihre eigenen Workspaces, Programme und Projekte isoliert, sicher und mehrsprachig (Deutsch, Englisch, Französisch) verwalten können.

### 🌐 Live-Umgebungen
- **Entwicklungsumgebung:** [https://ais-dev-wn7zzzlzasx7xfyj6difbl-600145407527.europe-west3.run.app](https://ais-dev-wn7zzzlzasx7xfyj6difbl-600145407527.europe-west3.run.app)
- **Produktiv- & Freigabeumgebung:** [https://ais-pre-wn7zzzlzasx7xfyj6difbl-600145407527.europe-west3.run.app](https://ais-pre-wn7zzzlzasx7xfyj6difbl-600145407527.europe-west3.run.app)

---

## 🏢 Kern-Hierarchie & Architektur

```text
PLATFORM (ImpactFlow)
  └── WORKSPACE / ORGANISATION (z.B. TechEnergy For Africa e.V., Global Eco Foundation)
        └── PROGRAMME / PORTFOLIOS (z.B. TGIEP – Global Internship & Education Programme)
              └── PROJEKTE (z.B. IFOPSIM Douala, Generation Green Bafoussam)
                    ├── 12-Phasen Lebenszyklus (Idee bis Impact)
                    ├── Budget & Finanzierung (EUR, USD, XAF, GBP, CHF)
                    ├── Sensitivitäts- & Finanzsimulator
                    ├── Creative Studio (KI-gestützte Kampagnen & Canvas)
                    ├── IT & Solar Asset Inventar
                    ├── Vier-Augen Governance & Audit-Log
                    └── Dossier-Export (PDF/Print)
```

---

## 🚀 Schnelleinstieg für Endnutzer & Programmleiter (User Quickstart)

### 1. Workspace auswählen oder neu anlegen
- Oben im **Header** finden Sie das Auswahlfeld **Workspace**.
- Standardmäßig ist **TechEnergy For Africa e.V.** (`org_tefa`) aktiv.
- Klicken Sie auf `+ Neue Organisation anlegen...`, um für Ihre eigene Organisation (z. B. Verein, Stiftung, NGO) einen neuen, vollständig isolierten Arbeitsbereich mit individueller Währung und Sprache anzulegen.

### 2. Benutzerprofil verwalten & wechseln
- Klicken Sie oben rechts auf das Profil-Icon oder unten links in der Seitenleiste auf Ihr Profil.
- **Vorkonfigurierte Profile:**
  - `pikop@techenergyforafrica.org` (Vorstand & Projektsteuerung)
  - `mistral@techenergyforafrica.org` (AI & Systems Administrator)
  - `info@techenergyforafrica.org` (Zentrale Geschäftsstelle & Operations)
  - `fredericpokam26@gmail.com` (Externer Diaspora- & Universitätspartner)
  - `jm.consultant@yahoo.com` (Externer Monitoring & Evaluation Berater)
- **Eigenes Profil anlegen:** Sie können mit einem Klick ein neues Profil mit beliebigem Namen, Jobtitel und E-Mail-Adresse (inkl. `@gmail.com`, `@yahoo.com`, etc.) anlegen.

### 3. Der 12-Phasen Projektlebenszyklus
Über die linke Seitenleiste steuern Sie ein Projekt von der Entstehung bis zur Wirkungsmessung:
1. **Dossier-Übersicht:** Executive Dashboard, KPI-Karten, Countdown und Readiness-Ampel.
2. **Project Intelligence:** BI-Analytics, Budget vs. Ist-Kosten, Inklusionsquote.
3. **Antragswizard (Modul A):** Projektidee, SMART-Ziele, Zielgruppen, Barrierefreiheit.
4. **KI-Entscheidungsberater (Tiebreaker):** Neutrale SWOT- und Kriterienanalyse für Vorstand & Projektleiter.
5. **Machbarkeitsprüfung (Governance):** 7 Dimensionen mit klarer Trennung von Fakten und Hypothesen.
6. **Planung (Gantt & Kanban):** Meilensteine, Arbeitspakete, Fälligkeiten und Verantwortliche.
7. **Budget & Finanzierung:** Kostenpositionen, Fördermittel und Spendenzusagen.
8. **Projekt-Simulator:** Interaktiver Schieberegler für Teilnehmer, Hardware und Betriebskosten.
9. **Partner & Fundraising:** Sponsoren, Stiftungen, Förderstatus und Absichtserklärungen (MoU).
10. **Creative Studio:** Automatisierte Erstellung von Social-Media-Grafiken & Postern.
11. **Inventar & IT-Hardware:** Erfassung von Laptops, Solarwechselrichtern und Batterien.
12. **Wirkungsevaluation & Abschluss:** SDG-Indikatoren, Verwendungsnachweise und Lessons Learned.

Ausführliche Anleitungen finden Sie im [USER_GUIDE.md](./USER_GUIDE.md).

---

## 💻 Leitfaden für Entwickler (Developer Guide)

### 1. Technische Voraussetzungen
- **Node.js** >= 20.x
- **npm** >= 10.x
- Google AI Studio API-Key (`GEMINI_API_KEY` in `.env`)

### 2. Lokale Installation & Start
```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Entwicklungsserver starten (Fullstack Express + Vite auf Port 3000)
npm run dev
```
Die Anwendung öffnet sich unter `http://localhost:3000`.

### 3. Test-Suite ausführen
Die gesamte Plattform ist mit einer deterministischen Regression- und Datenintegritäts-Testsuite abgesichert:
```bash
npm test
```
*Aktueller Stand:* **51 Tests erfolgreich bestanden (100 % Pass Rate).**

### 4. TypeScript-Prüfung & Build
```bash
# TypeScript Typen überprüfen
npm run lint

# Produktiven Build erstellen
npm run build
```

Ausführliche Details zur API, Multi-Mandanten-Architektur und den Datenmodellen finden Sie im [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md).

---

## 🔒 Datenschutz, Governance & Isolation

1. **Strikte Trennung:** Projekte, Dokumente und Finanzen einer Organisation sind für andere Organisationen im Backend über Header-Validierung gesperrt.
2. **Keine Datenverschleppung:** Neue Workspaces starten mit 0 Projekten; TEFA-interne Daten und TGIEP-Akten werden niemals automatisch exponiert.
3. **Fakten vs. Hypothesen:** Alle Indikatoren kennzeichnen ungeprüfte Annahmen transparent als *Hypothese / In Prüfung*, um Fehlentscheidungen auszuschließen.
4. **Vier-Augen-Prinzip:** Ein Antragsteller kann den eigenen Projektantrag oder die Budgetfreigabe im System nicht selbst genehmigen.

---

## 📜 Lizenz & Trägerschaft
- **Plattform:** ImpactFlow Core
- **Initiative & Trägerschaft:** TechEnergy For Africa e.V., Berlin / Douala
- **Webseite:** [https://www.techenergyforafrica.org](https://www.techenergyforafrica.org)
- **Kontakt:** `info@techenergyforafrica.org`
