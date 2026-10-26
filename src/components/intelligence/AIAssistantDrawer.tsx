import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ExternalLink,
  ShieldAlert,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Search,
  MapPin,
  Cpu,
  RefreshCw,
  Play,
  Pause,
} from 'lucide-react';
import { IntelligenceFilters } from './types';
import { useAuthRole } from '../../context/AuthRoleContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: IntelligenceFilters;
  onSelectProject?: (projectId: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  facts?: string[];
  recommendations?: string[];
  references?: { id: string; referenceId: string; title: string; metric?: string }[];
  dataLimitations?: string[];
  modelUsed?: string;
  grounding?: {
    webSearchQueries?: string[];
    groundingChunks?: any[];
  } | null;
  timestamp: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onSelectProject,
}) => {
  const { currentUser } = useAuthRole();
  const { language } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Model & Grounding Controls
  const [selectedModel, setSelectedModel] = useState<'gemini-4-argon' | 'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [useSearch, setUseSearch] = useState<boolean>(false);
  const [useMaps, setUseMaps] = useState<boolean>(false);

  // Audio Recording (Microphone via gemini-3.5-transcribe)
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // TTS Voice Briefing Audio Playback (gemini-3.8-flash-lite-tts)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    'Welche Projekte benötigen dringende Management-Aufmerksamkeit?',
    'Welche Projekte weisen die größte bestätigte Finanzierungslücke auf?',
    'Welche Meilensteine sind aktuell überfällig?',
    'Welche Förderanträge sind noch in Prüfung?',
    'Welche Ausgaben weisen fehlende Belegnachweise auf?',
  ];

  // Send query to assistant
  const handleRunQuery = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);
    setErrorMsg(null);

    // Prepare previous history for server
    const historyPayload = messages.slice(-4).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content,
    }));

    try {
      const res = await fetch('/api/intelligence/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'visitor',
          'x-user-id': currentUser?.id || 'anonymous',
          'x-user-name': currentUser?.name || 'Anonymous',
        },
        body: JSON.stringify({
          query: queryText,
          lang: language || 'de',
          filters,
          conversationHistory: historyPayload,
          modelId: selectedModel,
          useSearch,
          useMaps,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'asst_' + Date.now(),
        role: 'assistant',
        content: data.answer || 'Keine Antwort empfangen.',
        facts: data.facts || [],
        recommendations: data.recommendations || [],
        references: data.references || [],
        dataLimitations: data.dataLimitations || [],
        modelUsed: data.modelUsed || selectedModel,
        grounding: data.grounding || null,
        timestamp: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      console.error('Error fetching intelligence assistant:', err);
      setErrorMsg('KI-Analyse konnte nicht abgerufen werden. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          setIsLoading(true);
          try {
            const trRes = await fetch('/api/ai/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioData: base64Data, mimeType: 'audio/webm' }),
            });
            const trData = await trRes.json();
            if (trData.text) {
              setInputQuery(trData.text);
              handleRunQuery(trData.text);
            }
          } catch (tErr) {
            console.error('Transcribe error:', tErr);
            setErrorMsg('Sprachtranskription fehlgeschlagen.');
          } finally {
            setIsLoading(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (micErr) {
      console.warn('Microphone permission issue:', micErr);
      setErrorMsg('Mikrofonzugriff nicht möglich oder verweigert.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Executive Audio Briefing
  const handlePlayExecutiveBriefing = async (textSnippet?: string) => {
    if (isPlayingAudio && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    setIsGeneratingAudio(true);
    setErrorMsg(null);

    const summaryText =
      textSnippet ||
      (messages.length > 0 && messages[messages.length - 1].role === 'assistant'
        ? messages[messages.length - 1].content.slice(0, 400)
        : 'Guten Tag. Hier ist das aktuelle TEFA Executive Controlling Briefing. Alle operativen Solarkennzahlen in Kamerun werden überwacht.');

    try {
      const res = await fetch('/api/ai/live-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: summaryText, voice: 'Kore' }),
      });

      if (!res.ok) throw new Error(`Briefing HTTP ${res.status}`);
      const data = await res.json();

      if (data.audioData) {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio();
        }
        audioPlayerRef.current.src = data.audioData;
        audioPlayerRef.current.onended = () => setIsPlayingAudio(false);
        await audioPlayerRef.current.play();
        setIsPlayingAudio(true);
      }
    } catch (bErr) {
      console.error('Executive briefing error:', bErr);
      setErrorMsg('Executive Voice Briefing konnte nicht abgespielt werden.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[580px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">TEFA Project Intelligence Assistant</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Multi-Turn
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Controlling & Governance • Grounded Knowledge Base
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Executive Audio Briefing trigger */}
          <button
            onClick={() => handlePlayExecutiveBriefing()}
            disabled={isGeneratingAudio}
            title="Akustisches Executive Briefing anhören (Gemini 3.8 Flash Lite TTS)"
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              isPlayingAudio
                ? 'bg-emerald-500 text-slate-900 border-emerald-400 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {isGeneratingAudio ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : isPlayingAudio ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
            <span className="hidden sm:inline text-[11px]">
              {isPlayingAudio ? 'Stopp' : 'Audio-Briefing'}
            </span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Model & Grounding Toolbar */}
      <div className="px-4 py-2 bg-slate-800 text-xs border-b border-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-semibold">Modell:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as any)}
            className="bg-slate-900 text-slate-200 text-xs rounded border border-slate-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="gemini-4-argon">Gemini 4 Argon (Deep Audit & Governance)</option>
            <option value="gemini-3.8-flash">Gemini 3.8 Flash (Operations & Standard)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast KPI Lookups)</option>
          </select>
        </div>

        {/* Search & Maps Grounding Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setUseSearch(!useSearch);
              if (!useSearch) setUseMaps(false);
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 border transition-colors ${
              useSearch
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Google Search Grounding für Förderrichtlinien & BMZ/GIZ Vorgaben"
          >
            <Search className="w-3 h-3" /> Search
          </button>
          <button
            onClick={() => {
              setUseMaps(!useMaps);
              if (!useMaps) setUseSearch(false);
            }}
            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 border transition-colors ${
              useMaps
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Google Maps Grounding für Routen & Projektstandorte in Kamerun"
          >
            <MapPin className="w-3 h-3" /> Maps
          </button>
        </div>
      </div>

      {/* Body: Chat Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick prompt suggestions when empty */}
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <span className="font-bold">Willkommen im TEFA Project Intelligence Assistant.</span> Sie können Fragen zu Finanzströmen, Meilensteinen, Belegen und Governance-Freigaben stellen. Die Antworten trennen strikt verifizierte Fakten von Handlungsempfehlungen.
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Häufige Controlling- & Managementfragen:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputQuery(qp);
                      handleRunQuery(qp);
                    }}
                    className="text-xs text-left bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
          >
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 px-1">
              <span>{msg.role === 'user' ? 'Sie' : 'TEFA Intelligence AI'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
              {msg.modelUsed && (
                <span className="ml-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded">
                  {msg.modelUsed}
                </span>
              )}
            </div>

            <div
              className={`max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs w-full'
              }`}
            >
              {/* Primary text */}
              <div className="whitespace-pre-line font-normal">{msg.content}</div>

              {/* Assistant structured parts */}
              {msg.role === 'assistant' && (
                <div className="mt-3 space-y-2.5 pt-3 border-t border-slate-200/80">
                  {/* Facts */}
                  {msg.facts && msg.facts.length > 0 && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg">
                      <div className="text-[11px] font-bold text-blue-900 mb-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Verifizierte Fakten:
                      </div>
                      <ul className="text-[11px] text-blue-950 space-y-1 list-disc list-inside">
                        {msg.facts.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                      <div className="text-[11px] font-bold text-emerald-900 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Empfehlungen:
                      </div>
                      <ul className="text-[11px] text-emerald-950 space-y-1 list-disc list-inside">
                        {msg.recommendations.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* References */}
                  {msg.references && msg.references.length > 0 && (
                    <div className="p-2 bg-white border border-slate-200 rounded-lg">
                      <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        Referenzen:
                      </div>
                      <div className="space-y-1">
                        {msg.references.map((ref) => (
                          <div
                            key={ref.id}
                            className="flex items-center justify-between text-[11px] p-1.5 bg-slate-50 rounded border border-slate-100"
                          >
                            <div>
                              <span className="font-semibold text-slate-900">{ref.title}</span>
                              <span className="ml-1.5 font-mono text-[10px] text-blue-600">
                                {ref.referenceId}
                              </span>
                            </div>
                            {onSelectProject && (
                              <button
                                onClick={() => onSelectProject(ref.id)}
                                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded border border-slate-200"
                              >
                                Öffnen <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Grounding metadata proof */}
                  {msg.grounding && msg.grounding.webSearchQueries && msg.grounding.webSearchQueries.length > 0 && (
                    <div className="text-[10px] text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      Grounded Web Queries: {msg.grounding.webSearchQueries.join(', ')}
                    </div>
                  )}

                  {/* Audio Briefing button for this specific response */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handlePlayExecutiveBriefing(msg.content)}
                      className="text-[10px] text-slate-600 hover:text-blue-600 flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      <Volume2 className="w-3 h-3" /> Diesen Befund vorlesen
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            <div className="text-xs">
              <div className="font-semibold text-slate-800">
                {selectedModel} führt Controlling-Analyse durch...
              </div>
              <div className="text-[11px] text-slate-500">
                Gleiche Finanzströme, Meilensteine und Berechtigungen ab
              </div>
            </div>
          </div>
        )}

        {/* Error notice */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer input with Voice Dictation & Text Input */}
      <div className="p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRunQuery(inputQuery);
          }}
          className="flex items-center gap-2"
        >
          {/* Microphone dictation toggle */}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2.5 rounded-lg border transition-colors ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title={isRecording ? 'Aufnahme stoppen & transkribieren' : 'Sprachaufnahme starten (Gemini 3.5 Transcribe)'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={isRecording ? 'Höre zu... sprechen Sie Ihre Frage' : 'Frage zu Budget, Meilensteinen, Risiken...'}
            className="flex-1 text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading || isRecording}
          />

          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim() || isRecording}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Fragen
          </button>
        </form>
      </div>
    </div>
  );
};
