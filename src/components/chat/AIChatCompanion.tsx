import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useProjects } from '../../context/ProjectContext';
import { useOrganization } from '../../context/OrganizationContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { ActiveTab } from '../Sidebar';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Trash2,
  Copy,
  Check,
  Bot,
  User as UserIcon,
  Cpu,
  RefreshCw,
  ArrowRight,
  FileDown,
  Compass,
  Plus,
  ShieldCheck,
  Building,
  HelpCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
  model?: string;
}

interface AIChatCompanionProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  onOpenExport?: () => void;
  onOpenNewProject?: () => void;
  onOpenProfile?: () => void;
  onOpenNewOrg?: () => void;
}

export const AIChatCompanion: React.FC<AIChatCompanionProps> = ({
  isOpen,
  onClose,
  onToggle,
  onNavigateTab,
  onOpenExport,
  onOpenNewProject,
  onOpenProfile,
  onOpenNewOrg,
}) => {
  const { t, language } = useLanguage();
  const { activeProject } = useProjects();
  const { activeOrganization } = useOrganization();
  const { currentUser } = useAuthRole();

  const [provider, setProvider] = useState<'gemini' | 'openai'>('gemini');
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content:
          language === 'fr'
            ? `**Bonjour ${currentUser.name.split(' ')[0]} !** Je suis votre Compagnon & Guide interactif ImpactFlow.\n\nJe vous aide à la fois sur la méthodologie de projet ONG (antennes, cadrage bailleur, budget) et sur la **navigation directe dans l'application** (approbation à 4 yeux, simulateur financier, contrôle des pièces comptables, export de dossier).\n\nPosez-moi une question sur le fonctionnement ou cliquez sur une suggestion ci-dessous :`
            : language === 'en'
            ? `**Hello ${currentUser.name.split(' ')[0]}!** I am your interactive ImpactFlow Companion & App Guide.\n\nI assist you with both NGO project methodology (grant proposals, budgets, KPIs) and **direct navigation inside this web app** (Four-Eyes approvals, financial simulator, receipt accounting, PDF exports).\n\nAsk me how to use any feature or click one of the quick guide questions below:`
            : `**Hallo ${currentUser.name.split(' ')[0]}!** Ich bin Ihr interaktiver ImpactFlow Assistent & App-Guide.\n\nIch helfe Ihnen sowohl bei der NGO-Projektmethodik (Förderanträge, Budgets, KPIs) als auch bei der **direkten Navigation in dieser Web-App** (Vier-Augen-Genehmigungen, Finanzsimulator, Belegprüfung, PDF-Dossier-Export).\n\nFragen Sie mich nach Funktionen oder wählen Sie einen der Schnelltipps unten:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'gemini',
        model: 'gemini-3.8-flash',
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  // Financial calculations for active project context
  const totalPlanned = activeProject?.budgetItems.reduce((s, b) => s + b.plannedCost, 0) || 0;
  const confirmedFunding = activeProject?.fundingSources
    .filter((f) => f.status === 'confirmed')
    .reduce((s, f) => s + f.amount, 0) || 0;
  const fundingGap = Math.max(0, totalPlanned - confirmedFunding);

  // Action dispatcher when user clicks a token badge
  const handleActionClick = (actionType: 'nav' | 'action', target: string, label: string) => {
    if (actionType === 'nav') {
      const validTabs: ActiveTab[] = [
        'dashboard',
        'intelligence',
        'proposal',
        'advisor',
        'feasibility',
        'planning',
        'budget',
        'simulator',
        'partners',
        'creative_studio',
        'inventory',
        'monitoring',
        'finance',
        'impact',
        'closure',
        'audit',
      ];
      if (validTabs.includes(target as ActiveTab) && onNavigateTab) {
        onNavigateTab(target as ActiveTab);
        setActionNotice(`Navigiert zu: ${label}`);
        setTimeout(() => setActionNotice(null), 2500);
      }
    } else if (actionType === 'action') {
      if (target === 'export' && onOpenExport) {
        onOpenExport();
        setActionNotice('Export-Dossier geöffnet');
        setTimeout(() => setActionNotice(null), 2500);
      } else if (target === 'new_project' && onOpenNewProject) {
        onOpenNewProject();
        setActionNotice('Projekt-Erstellung geöffnet');
        setTimeout(() => setActionNotice(null), 2500);
      } else if (target === 'profile' && onOpenProfile) {
        onOpenProfile();
        setActionNotice('Profil & Rollen-Umschaltung geöffnet');
        setTimeout(() => setActionNotice(null), 2500);
      } else if (target === 'new_org' && onOpenNewOrg) {
        onOpenNewOrg();
        setActionNotice('Neue Organisation anlegen geöffnet');
        setTimeout(() => setActionNotice(null), 2500);
      }
    }
  };

  const quickPrompts = [
    {
      label: t.chat?.promptHowToUse || '🧭 Wie nutze ich diese App?',
      prompt:
        language === 'fr'
          ? `Comment utiliser cette application ImpactFlow ? Expliquez-moi les 12 phases du cycle de vie et comment naviguer dans le menu.`
          : language === 'en'
          ? `How do I use this ImpactFlow application? Please explain the 12 lifecycle phases and how to navigate through the modules.`
          : `Wie nutze ich die ImpactFlow Plattform? Erkläre mir die 12 Phasen des Lebenszyklus und wie ich mich im Menü bewege.`,
    },
    {
      label: t.chat?.promptHowToApprove || '🛡️ Vier-Augen-Genehmigung',
      prompt:
        language === 'fr'
          ? `Comment fonctionne la validation à quatre yeux (Four-Eyes Principle) et comment changer de rôle utilisateur ?`
          : language === 'en'
          ? `How does the Four-Eyes governance approval work and how do I switch user roles to approve a project?`
          : `Wie funktioniert die Vier-Augen-Genehmigung (Four-Eyes Governance) und wie wechsle ich die Rolle zum Freigeben?`,
    },
    {
      label: t.chat?.promptHowToSimulator || '📊 Finanzsimulator nutzen',
      prompt:
        language === 'fr'
          ? `Comment utiliser le simulateur financier interactif pour tester des scénarios de subventions et de taux de change ?`
          : language === 'en'
          ? `How do I use the interactive financial simulator to test grant scenarios and inflation/FX risks?`
          : `Wie nutze ich den interaktiven Finanzsimulator, um Förderquote, Währungskurse und Risiken zu simulieren?`,
    },
    {
      label: t.chat?.promptHowToExport || '📄 Dossier exportieren',
      prompt:
        language === 'fr'
          ? `Comment générer et exporter le dossier complet de projet au format PDF ou Word pour les bailleurs ?`
          : language === 'en'
          ? `How do I generate and export the complete project dossier as a PDF report for donors?`
          : `Wie kann ich das vollständige Projektdossier und den Finanzbericht als PDF/Druckversion exportieren?`,
    },
    {
      label: t.chat?.promptImproveProposal || '💡 Antrag optimieren',
      prompt:
        language === 'fr'
          ? `Comment optimiser la formulation des objectifs et de la justification de "${activeProject?.title || 'notre projet'}" pour maximiser nos chances auprès des bailleurs de fonds internationaux ?`
          : language === 'en'
          ? `How can we strengthen the problem statement, SMART objectives, and donor narrative for "${activeProject?.title || 'our project'}"?`
          : `Wie können wir die Problemstellung, SMART-Ziele und Begründung für "${activeProject?.title || 'unser Vorhaben'}" für institutionelle Fördergeber optimieren?`,
    },
    {
      label: t.chat?.promptCheckBudget || '📊 Budget & Lücke prüfen',
      prompt:
        language === 'fr'
          ? `Nous avons un budget prévisionnel de ${totalPlanned.toLocaleString()} € et un déficit de ${fundingGap.toLocaleString()} €. Quelles stratégies de cofinancement recommandez-vous ?`
          : language === 'en'
          ? `Our planned budget is € ${totalPlanned.toLocaleString()} with a net funding gap of € ${fundingGap.toLocaleString()}. What co-financing and grant strategy do you advise?`
          : `Bei einem Gesamtbudget von € ${totalPlanned.toLocaleString()} besteht eine Lücke von € ${fundingGap.toLocaleString()}. Welche Kofinanzierungs- und Fördermittelstrategie schlagen Sie vor?`,
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/companion-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role,
          'x-user-name': currentUser.name,
        },
        body: JSON.stringify({
          query: text,
          provider,
          lang: language,
          messages: messages.concat(userMsg).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          projectContext: activeProject
            ? {
                id: activeProject.id,
                referenceId: activeProject.referenceId,
                title: activeProject.title,
                country: activeProject.country,
                lifecyclePhase: activeProject.lifecyclePhase,
                status: activeProject.status,
                totalPlanned,
                confirmedFunding,
                fundingGap,
                beneficiaries: activeProject.proposal.beneficiaryCountPlanned,
              }
            : null,
          orgContext: {
            name: activeOrganization?.name || 'TechEnergy For Africa e.V.',
            defaultCurrency: activeOrganization?.defaultCurrency || 'EUR',
            website: activeOrganization?.website || 'https://www.techenergyforafrica.org',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: data.reply || 'Keine Antwort erhalten.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: data.provider,
        model: data.model,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error('AI Companion error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content:
          language === 'fr'
            ? `⚠️ Une erreur de connexion est survenue. Veuillez vérifier votre connexion ou réessayer.`
            : language === 'en'
            ? `⚠️ A network or processing error occurred. Please verify your connection or try again.`
            : `⚠️ Verbindung zum KI-Dienst konnte nicht aufgebaut werden. Bitte versuchen Sie es erneut.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'offline',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleClear = () => {
    if (window.confirm(language === 'fr' ? "Effacer l'historique du chat ?" : language === 'en' ? 'Clear chat history?' : 'Chat-Verlauf wirklich leeren?')) {
      setMessages([
        {
          id: 'msg-cleared',
          role: 'assistant',
          content:
            language === 'fr'
              ? "Historique réinitialisé. Comment puis-je vous aider aujourd'hui ?"
              : language === 'en'
              ? 'Conversation reset. How can I assist you with your project today?'
              : 'Verlauf zurückgesetzt. Wie kann ich Sie heute bei Ihrem Projekt unterstützen?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          provider: 'gemini',
        },
      ]);
    }
  };

  // Render markdown-like text with basic formatting (bold, headers, bullets) and clickable action tokens
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 mt-2 text-xs sm:text-sm">
                {renderInlineTokensAndSpans(trimmed.replace('### ', ''))}
              </h4>
            );
          }
          if (trimmed.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-slate-900 mt-2 text-sm">
                {renderInlineTokensAndSpans(trimmed.replace('## ', ''))}
              </h3>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-emerald-500 font-bold shrink-0">•</span>
                <span>{renderInlineTokensAndSpans(bulletText)}</span>
              </div>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-emerald-600 font-semibold shrink-0">
                  {trimmed.match(/^\d+\./)?.[0]}
                </span>
                <span>{renderInlineTokensAndSpans(trimmed.replace(/^\d+\.\s*/, ''))}</span>
              </div>
            );
          }
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{renderInlineTokensAndSpans(trimmed)}</p>;
        })}
      </div>
    );
  };

  const renderInlineTokensAndSpans = (text: string) => {
    const tokenRegex = /(\[\[(?:nav|action):[^|\]]+\|[^\]]+\]\])/g;
    const segments = text.split(tokenRegex);

    return segments.map((seg, segIdx) => {
      const match = seg.match(/^\[\[(nav|action):([^|\]]+)\|([^\]]+)\]\]$/);
      if (match) {
        const [, actionType, target, label] = match;
        const isNav = actionType === 'nav';
        return (
          <button
            key={`token-${segIdx}`}
            type="button"
            onClick={() => handleActionClick(actionType as 'nav' | 'action', target, label)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 my-0.5 mx-1 rounded-md text-xs font-semibold border shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer ${
              isNav
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-300'
            }`}
            title={`Klicken um auszuführen: ${label}`}
          >
            {isNav ? (
              <Compass className="w-3 h-3 text-emerald-600 shrink-0" />
            ) : target === 'export' ? (
              <FileDown className="w-3 h-3 text-teal-600 shrink-0" />
            ) : target === 'new_project' ? (
              <Plus className="w-3 h-3 text-emerald-600 shrink-0" />
            ) : target === 'profile' ? (
              <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
            ) : (
              <Building className="w-3 h-3 text-blue-600 shrink-0" />
            )}
            <span>{label}</span>
            <ArrowRight className="w-2.5 h-2.5 opacity-60" />
          </button>
        );
      }

      return <React.Fragment key={`text-${segIdx}`}>{renderBoldSpans(seg)}</React.Fragment>;
    });
  };

  const renderBoldSpans = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        aria-label="ImpactFlow KI-Begleiter öffnen"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg hover:shadow-xl hover:from-emerald-500 hover:to-teal-600 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
      >
        <div className="relative">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-slate-900"></span>
        </div>
        <span className="font-semibold text-xs sm:text-sm tracking-wide">
          {t.chat?.badge || 'KI-Begleiter'}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ${
        isMinimized
          ? 'bottom-4 right-4 w-72 sm:w-80 h-14'
          : 'bottom-2 sm:bottom-4 right-2 sm:right-4 w-[calc(100vw-1rem)] sm:w-[460px] md:w-[500px] h-[580px] max-h-[calc(100vh-2rem)]'
      } bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden`}
    >
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0 border-b border-slate-700">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shrink-0 shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs sm:text-sm truncate text-white">
                {t.chat?.title || 'ImpactFlow KI-Begleiter'}
              </h3>
            </div>
            <p className="text-[10px] text-emerald-300 truncate">
              {activeProject ? `[${activeProject.referenceId}] ${activeProject.title}` : activeOrganization?.name || 'Universal NGO Platform'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 text-slate-300">
          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            title={isMinimized ? t.chat?.maximize || 'Maximieren' : t.chat?.minimize || 'Minimieren'}
            className="p-1 hover:text-white hover:bg-slate-700/60 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleClear}
            title={t.chat?.clearHistory || 'Verlauf leeren'}
            className="p-1 hover:text-rose-300 hover:bg-slate-700/60 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title={t.chat?.close || 'Schließen'}
            className="p-1 hover:text-white hover:bg-slate-700/60 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body Section (hidden if minimized) */}
      {!isMinimized && (
        <>
          {/* Subheader: Provider Selector & Active Context Badge */}
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between gap-2 shrink-0 text-[11px]">
            {/* Model Provider Toggle */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  provider === 'gemini'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-3 h-3" />
                <span>Gemini 3.8</span>
              </button>
              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  provider === 'openai'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="OpenAI ChatGPT Schnittstelle (Bereit & konfiguriert)"
              >
                <Bot className="w-3 h-3" />
                <span>ChatGPT</span>
              </button>
            </div>

            {/* Context Pill */}
            {activeProject && (
              <div className="flex items-center gap-1 text-slate-500 truncate">
                <span className="font-mono text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                  {t.phases[activeProject.lifecyclePhase] || activeProject.lifecyclePhase}
                </span>
                <span className="text-[10px] text-amber-700 font-medium hidden xs:inline">
                  Lücke: €{fundingGap.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Action Navigation Notice Banner */}
          {actionNotice && (
            <div className="bg-emerald-600 text-white text-[11px] font-semibold px-3 py-1.5 flex items-center justify-between gap-2 shadow-xs shrink-0 animate-pulse">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>{actionNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setActionNotice(null)}
                className="text-white/80 hover:text-white p-0.5 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-100/50">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-xl p-3 shadow-xs relative group ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    {isUser ? (
                      <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      renderFormattedContent(msg.content)
                    )}

                    <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-200/40 text-[10px] opacity-75">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <div className="flex items-center gap-1.5">
                          {msg.provider && (
                            <span className="uppercase text-[9px] font-mono tracking-wider">
                              {msg.provider}
                            </span>
                          )}
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="hover:text-emerald-600 transition-colors flex items-center gap-0.5"
                            title="Antwort kopieren"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs py-2 px-1">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                <span>{t.chat?.thinking || 'KI analysiert Projektdaten...'}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 transition-colors shrink-0 disabled:opacity-50"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 shrink-0 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chat?.placeholder || 'Frage zum aktiven Projekt, Antrag oder Budget stellen...'}
              disabled={isLoading}
              className="flex-1 bg-slate-50 border border-slate-300 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1 transition-colors shrink-0"
              title="Nachricht senden"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
