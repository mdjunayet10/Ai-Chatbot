/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  X,
  Send,
  Sparkles,
  Code2,
  PenTool,
  Languages,
  Lightbulb,
  Heart,
  Bot,
  User,
  Paperclip,
  Image as ImageIcon,
  ArrowRight,
  RotateCcw,
  Download,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { ChatThread, ChatMessage, PersonaId, Persona } from "./types";
import { PERSONAS, getPersona } from "./personas";
import MessageItem from "./components/MessageItem";

// Local storage keys
const STORAGE_THREADS_KEY = "ai_chatbot_threads_v1";
const STORAGE_ACTIVE_THREAD_KEY = "ai_chatbot_active_thread_id_v1";

// Mapping icons for personas
const iconMap: Record<string, any> = {
  Sparkles: Sparkles,
  Code2: Code2,
  PenTool: PenTool,
  Languages: Languages,
  Lightbulb: Lightbulb,
  Heart: Heart,
};

export default function App() {
  // Chat Threads State
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>("");

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Attachment state (support for inline images)
  const [selectedImage, setSelectedImage] = useState<{ mimeType: string; data: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Threads from localStorage or seed first thread
  useEffect(() => {
    try {
      const storedThreads = localStorage.getItem(STORAGE_THREADS_KEY);
      const storedActiveId = localStorage.getItem(STORAGE_ACTIVE_THREAD_KEY);

      if (storedThreads) {
        const parsed: ChatThread[] = JSON.parse(storedThreads);
        if (parsed.length > 0) {
          setThreads(parsed);
          if (storedActiveId && parsed.some(t => t.id === storedActiveId)) {
            setActiveThreadId(storedActiveId);
          } else {
            setActiveThreadId(parsed[0].id);
          }
          return;
        }
      }

      // No stored threads - seed an initial general thread
      const initialThreadId = "default-thread-id";
      const initialThread: ChatThread = {
        id: initialThreadId,
        title: "Welcome Chat",
        personaId: "general",
        messages: [
          {
            id: "welcome-msg",
            role: "model",
            parts: [
              {
                text: "Hello! I am your AI Assistant. How can I help you today? You can choose specialized personas from the list below, upload images to brainstorm, or start multiple conversation threads!"
              }
            ],
            timestamp: Date.now()
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setThreads([initialThread]);
      setActiveThreadId(initialThreadId);
    } catch (e) {
      console.error("Failed to parse stored chat threads", e);
    }
  }, []);

  // Sync threads and active ID to localStorage
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem(STORAGE_THREADS_KEY, JSON.stringify(threads));
    }
  }, [threads]);

  useEffect(() => {
    if (activeThreadId) {
      localStorage.setItem(STORAGE_ACTIVE_THREAD_KEY, activeThreadId);
    }
  }, [activeThreadId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [threads, activeThreadId, isGenerating]);

  // Find active thread and active persona
  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];
  const activePersona = activeThread ? getPersona(activeThread.personaId) : PERSONAS[0];

  // Colors for styling based on active persona theme
  const themeColors: Record<string, {
    bg: string;
    text: string;
    border: string;
    accent: string;
    focus: string;
    ring: string;
    bubbleBg: string;
    lightText: string;
  }> = {
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
      accent: "bg-indigo-600 hover:bg-indigo-700 text-white",
      focus: "focus:border-indigo-500 focus:ring-indigo-500",
      ring: "ring-indigo-500",
      bubbleBg: "bg-indigo-50/50",
      lightText: "text-indigo-500"
    },
    emerald: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      accent: "bg-emerald-600 hover:bg-emerald-700 text-white",
      focus: "focus:border-emerald-500 focus:ring-emerald-500",
      ring: "ring-emerald-500",
      bubbleBg: "bg-emerald-50/50",
      lightText: "text-emerald-500"
    },
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      accent: "bg-amber-600 hover:bg-amber-700 text-white",
      focus: "focus:border-amber-500 focus:ring-amber-500",
      ring: "ring-amber-500",
      bubbleBg: "bg-amber-50/50",
      lightText: "text-amber-500"
    },
    rose: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
      accent: "bg-rose-600 hover:bg-rose-700 text-white",
      focus: "focus:border-rose-500 focus:ring-rose-500",
      ring: "ring-rose-500",
      bubbleBg: "bg-rose-50/50",
      lightText: "text-rose-500"
    },
    sky: {
      bg: "bg-sky-50",
      text: "text-sky-600",
      border: "border-sky-100",
      accent: "bg-sky-600 hover:bg-sky-700 text-white",
      focus: "focus:border-sky-500 focus:ring-sky-500",
      ring: "ring-sky-500",
      bubbleBg: "bg-sky-50/50",
      lightText: "text-sky-500"
    },
    violet: {
      bg: "bg-violet-50",
      text: "text-violet-600",
      border: "border-violet-100",
      accent: "bg-violet-600 hover:bg-violet-700 text-white",
      focus: "focus:border-violet-500 focus:ring-violet-500",
      ring: "ring-violet-500",
      bubbleBg: "bg-violet-50/50",
      lightText: "text-violet-500"
    }
  };

  const activeTheme = themeColors[activePersona.themeColor] || themeColors.indigo;

  // Create a new thread
  const handleCreateThread = (personaId: PersonaId = "general") => {
    const persona = getPersona(personaId);
    const newId = `thread-${Date.now()}`;
    const newThread: ChatThread = {
      id: newId,
      title: `New ${persona.name}`,
      personaId,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: "model",
          parts: [
            {
              text: `Hello! I am your ${persona.name}. ${persona.tagline}. Let's chat!`
            }
          ],
          timestamp: Date.now()
        }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    setThreads([newThread, ...threads]);
    setActiveThreadId(newId);
    setSidebarOpen(false);
    setError(null);
  };

  // Switch active thread persona
  const handleChangePersona = (personaId: PersonaId) => {
    if (!activeThread) return;

    const persona = getPersona(personaId);
    const updatedThreads = threads.map(t => {
      if (t.id === activeThread.id) {
        // Update both persona and thread title if it's the initial/default title
        const titleNeedsUpdate = t.title.startsWith("New ") || t.title === "Welcome Chat";
        return {
          ...t,
          personaId,
          title: titleNeedsUpdate ? `New ${persona.name}` : t.title,
          updatedAt: Date.now()
        };
      }
      return t;
    });

    setThreads(updatedThreads);
    setError(null);
  };

  // Delete a thread
  const handleDeleteThread = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const filtered = threads.filter(t => t.id !== id);

    if (filtered.length === 0) {
      // Re-seed if last thread deleted
      const seedId = "default-thread-id-reseed";
      const seedThread: ChatThread = {
        id: seedId,
        title: "Welcome Chat",
        personaId: "general",
        messages: [
          {
            id: "welcome-reseed",
            role: "model",
            parts: [{ text: "Hello! I am your AI Assistant. Let me know what you want to achieve today!" }],
            timestamp: Date.now()
          }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setThreads([seedThread]);
      setActiveThreadId(seedId);
    } else {
      setThreads(filtered);
      if (activeThreadId === id) {
        setActiveThreadId(filtered[0].id);
      }
    }
  };

  // File Upload Handlers (converts image files to base64 inlineData)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPEG, WEBP, etc.)");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract pure base64 (removes prefix like 'data:image/png;base64,')
      const base64Data = result.split(",")[1];
      setSelectedImage({
        mimeType: file.type,
        data: base64Data,
        name: file.name
      });
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend && !selectedImage) return;

    if (!activeThread) return;

    setError(null);
    setIsGenerating(true);
    setInput("");

    // Create user message part
    const messageParts = [];
    if (textToSend) {
      messageParts.push({ text: textToSend });
    }

    if (selectedImage) {
      messageParts.push({
        inlineData: {
          mimeType: selectedImage.mimeType,
          data: selectedImage.data
        }
      });
      // Clear attached image
      removeSelectedImage();
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      parts: messageParts,
      timestamp: Date.now()
    };

    // Append user message immediately to the UI
    const updatedMessages = [...activeThread.messages, userMessage];
    
    // Update thread title if it's the first non-system user message
    let updatedTitle = activeThread.title;
    const userMessageCount = updatedMessages.filter(m => m.role === "user").length;
    if (userMessageCount === 1 && textToSend) {
      updatedTitle = textToSend.length > 25 ? textToSend.substring(0, 25) + "..." : textToSend;
    }

    setThreads(prev =>
      prev.map(t =>
        t.id === activeThread.id
          ? { ...t, messages: updatedMessages, title: updatedTitle, updatedAt: Date.now() }
          : t
      )
    );

    try {
      // Format Gemini conversational history.
      // The API format expects: { role: 'user' | 'model', parts: [{ text: '...' }] }
      const apiContents = updatedMessages.map(m => {
        return {
          role: m.role,
          parts: m.parts.map(p => {
            if (p.inlineData) {
              return {
                inlineData: {
                  mimeType: p.inlineData.mimeType,
                  data: p.inlineData.data
                }
              };
            }
            return { text: p.text || "" };
          })
        };
      });

      // API post request to proxy Express endpoint
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: apiContents,
          systemInstruction: activePersona.systemInstruction
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Internal Server Error");
      }

      const responseData = await response.json();

      const assistantMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: "model",
        parts: [{ text: responseData.text }],
        timestamp: Date.now()
      };

      setThreads(prev =>
        prev.map(t =>
          t.id === activeThread.id
            ? { ...t, messages: [...updatedMessages, assistantMessage], updatedAt: Date.now() }
            : t
        )
      );

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected connection error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Keyboard shortcut Enter sends, Shift+Enter breaks line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear current thread history
  const handleClearThreadHistory = () => {
    if (!activeThread) return;

    const clearedThread: ChatThread = {
      ...activeThread,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: "model",
          parts: [{ text: `Thread cleared. Let's start fresh!` }],
          timestamp: Date.now()
        }
      ],
      updatedAt: Date.now()
    };

    setThreads(threads.map(t => t.id === activeThread.id ? clearedThread : t));
    setError(null);
  };

  // Download whole thread transcript as Markdown
  const handleDownloadTranscript = () => {
    if (!activeThread) return;

    let markdown = `# Chat Transcript: ${activeThread.title}\n`;
    markdown += `Persona: ${activePersona.name} (${activePersona.tagline})\n`;
    markdown += `Date: ${new Date(activeThread.createdAt).toLocaleDateString()}\n\n---\n\n`;

    activeThread.messages.forEach(m => {
      const sender = m.role === "user" ? "User" : activePersona.name;
      const text = m.parts.find(p => p.text)?.text || "";
      const time = new Date(m.timestamp).toLocaleTimeString();
      
      markdown += `### **${sender}** *(${time})*\n\n${text}\n\n`;
      if (m.parts.some(p => p.inlineData)) {
        markdown += `*(Attached Image: image_upload)*\n\n`;
      }
    });

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${activeThread.title.toLowerCase().replace(/\s+/g, "_")}_transcript.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 text-gray-900 font-sans" id="app-root">
      {/* 1. SIDEBAR (RESPONSIVE DRAWERS & FLOATS) */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex w-76 flex-col border-r border-gray-200 bg-white transition-transform duration-300 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        id="app-sidebar"
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Bot size={20} />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm leading-tight">AI Chatbot</h1>
              <span className="text-[10px] text-gray-400 font-mono">Gemini 3.5 Flash</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 md:hidden"
            title="Close sidebar"
            id="btn-sidebar-close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Action - Create New Thread */}
        <div className="p-3">
          <button
            onClick={() => handleCreateThread("general")}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-98 text-sm cursor-pointer"
            id="btn-new-chat"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto px-2 py-3" id="threads-container">
          <div className="mb-2 px-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Conversations</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              {threads.length}
            </span>
          </div>

          <div className="space-y-1">
            {threads.map(t => {
              const isActive = t.id === activeThreadId;
              const p = getPersona(t.personaId);
              const PersonaIcon = iconMap[p.iconName] || Sparkles;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveThreadId(t.id);
                    setSidebarOpen(false);
                    setError(null);
                  }}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all cursor-pointer ${
                    isActive
                      ? "bg-indigo-50 text-indigo-900 border-l-3 border-indigo-600"
                      : "hover:bg-gray-50 text-gray-700 hover:text-gray-950"
                  }`}
                  id={`thread-item-${t.id}`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                        isActive
                          ? "bg-white border-indigo-100 text-indigo-600"
                          : "bg-gray-50 border-gray-100 text-gray-500"
                      }`}
                    >
                      <PersonaIcon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium leading-normal">{t.title}</p>
                      <p className="truncate text-[10px] text-gray-400 font-mono">
                        {new Date(t.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Delete button (hidden by default, visible on hover) */}
                  <button
                    onClick={(e) => handleDeleteThread(t.id, e)}
                    className="rounded-md p-1 opacity-0 text-gray-400 transition-opacity hover:bg-gray-100 hover:text-rose-600 group-hover:opacity-100"
                    title="Delete Chat"
                    id={`btn-delete-${t.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info and Applet credentials warning */}
        <div className="border-t border-gray-100 p-3 bg-gray-50/50">
          <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 p-2.5 shadow-2xs">
            <Clock size={14} className="text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-400">Environment System</p>
              <p className="truncate text-[11px] font-medium text-gray-700">Cloud Host Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAY for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. MAIN CONVERSATION SCREEN */}
      <div className="flex flex-1 flex-col overflow-hidden bg-white" id="main-content-panel">
        {/* Header bar */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-3xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 md:hidden cursor-pointer"
              title="Open sidebar"
              id="btn-sidebar-open"
            >
              <Menu size={20} />
            </button>

            {/* Selected Persona Indicator */}
            {activeThread && (
              <div className="flex items-center gap-2.5">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${activeTheme.bg} ${activeTheme.border}`}>
                  {(() => {
                    const PersonaIcon = iconMap[activePersona.iconName] || Sparkles;
                    return <PersonaIcon size={18} className={activeTheme.text} />;
                  })()}
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-gray-900 leading-tight">
                    {activePersona.name}
                  </h2>
                  <span className="text-[10px] text-gray-400 block truncate max-w-44 md:max-w-96 font-medium">
                    {activePersona.tagline}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Chat tools: Clean transcript, download transcript */}
          {activeThread && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDownloadTranscript}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 shadow-3xs transition-all hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                title="Download transcript"
                id="btn-download"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </button>

              <button
                onClick={handleClearThreadHistory}
                className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-600 shadow-3xs transition-all hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                title="Clear current thread"
                id="btn-clear"
              >
                <RotateCcw size={14} />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Persona Selector Rail (Top horizontal layout) */}
        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-2 overflow-x-auto scrollbar-none flex gap-2">
          {PERSONAS.map(p => {
            const isCurrent = activePersona.id === p.id;
            const PersonaIcon = iconMap[p.iconName] || Sparkles;
            const colors = themeColors[p.themeColor] || themeColors.indigo;

            return (
              <button
                key={p.id}
                onClick={() => handleChangePersona(p.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
                  isCurrent
                    ? `${colors.bg} ${colors.border} ${colors.text} ring-1 ${colors.ring}`
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                id={`persona-rail-btn-${p.id}`}
              >
                <PersonaIcon size={13} />
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>

        {/* 3. MESSAGE LIST CONTAINER */}
        <div className="flex-1 overflow-y-auto px-4 py-2 md:px-8" id="chat-messages-scroller">
          {activeThread && activeThread.messages.length > 0 ? (
            <div className="mx-auto max-w-4xl divide-y divide-gray-100">
              {activeThread.messages.map(m => (
                <MessageItem key={m.id} message={m} persona={activePersona} />
              ))}

              {/* Waiting for Response typing animation */}
              {isGenerating && (
                <div className="flex w-full gap-3 py-6 md:gap-4 justify-start">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border shadow-xs ${activeTheme.bg} ${activeTheme.border}`}>
                    <Bot size={18} className={activeTheme.text} />
                  </div>
                  <div className="flex flex-col gap-1.5 max-w-[75%] items-start">
                    <div className="flex items-center gap-1 rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500 shadow-2xs">
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Error state display block */}
              {error && (
                <div className="my-4 rounded-xl border border-red-100 bg-red-50 p-4 shadow-sm">
                  <div className="flex gap-2">
                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-800">Connection Error</p>
                      <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{error}</p>
                      <button
                        onClick={() => handleSendMessage(activeThread.messages[activeThread.messages.length - 2]?.parts.find(p => p.text)?.text)}
                        className="mt-2 text-xs font-semibold text-red-600 hover:text-red-800 underline block"
                      >
                        Try Retrying Last Message
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            // No Messages State (Shouldn't normally occur due to welcome seeds)
            <div className="flex h-full flex-col items-center justify-center p-6 text-center">
              <Bot className="h-12 w-12 text-gray-300 animate-pulse mb-3" />
              <p className="text-sm font-semibold text-gray-600">This thread has no messages</p>
              <button
                onClick={() => handleCreateThread("general")}
                className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
              >
                Create general conversation
              </button>
            </div>
          )}
        </div>

        {/* Prompt Starters Helper block - visible when thread has only welcome prompt */}
        {activeThread && activeThread.messages.length === 1 && (
          <div className="bg-gray-50 border-t border-gray-100 px-4 py-4 md:px-8">
            <div className="mx-auto max-w-4xl">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                Suggested Prompt Starters
              </span>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activePersona.promptStarters.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(starter);
                      // focus on textarea if convenient
                    }}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 text-left text-xs text-gray-600 shadow-2xs hover:border-indigo-300 hover:bg-indigo-50/20 hover:text-indigo-900 transition-all cursor-pointer"
                    id={`starter-btn-${idx}`}
                  >
                    <span className="truncate pr-2">{starter}</span>
                    <ArrowRight size={12} className="text-gray-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. CHAT INPUT BAR CONTAINER */}
        <div className="border-t border-gray-200 bg-white p-4 md:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Display selected image attachment preview */}
            {selectedImage && (
              <div className="mb-2 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/40 p-2 max-w-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-indigo-200 bg-white p-0.5 shadow-3xs">
                    <img
                      src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`}
                      alt="Attachment preview"
                      className="h-full w-full object-cover rounded-md"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-indigo-950 leading-tight">
                      {selectedImage.name}
                    </p>
                    <span className="text-[10px] text-indigo-500 font-mono block">Image attachment</span>
                  </div>
                </div>
                <button
                  onClick={removeSelectedImage}
                  className="rounded-lg p-1 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-900 cursor-pointer"
                  title="Remove image"
                  id="btn-remove-preview-image"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Chat form box */}
            <div className="relative flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50/50 p-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 shadow-3xs">
              {/* File Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-2xs hover:bg-gray-100 cursor-pointer"
                title="Attach an image for multimodal insights"
                id="btn-attachment"
              >
                <Paperclip size={16} />
              </button>

              {/* Invisible HTML File input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
                id="file-uploader-input"
              />

              {/* Chat Text Area Input */}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${activePersona.name}... (Press Enter to send)`}
                rows={1}
                disabled={isGenerating}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-900 outline-hidden placeholder:text-gray-400 resize-none min-h-[40px] max-h-32"
                id="text-input-field"
              />

              {/* Send Button */}
              <button
                onClick={() => handleSendMessage()}
                disabled={isGenerating || (!input.trim() && !selectedImage)}
                className={`flex h-10 w-10 items-center justify-center rounded-xl font-medium shadow-sm transition-all active:scale-95 cursor-pointer ${
                  (input.trim() || selectedImage) && !isGenerating
                    ? activeTheme.accent
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
                id="btn-send-message"
                title="Send Message"
              >
                <Send size={16} />
              </button>
            </div>

            {/* Applet info footer */}
            <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 px-1">
              <span>Shift + Enter for new line. Powered by Gemini.</span>
              <span className="flex items-center gap-1 font-medium text-gray-500">
                <Clock size={11} />
                <span>Responsive Design Mode Active</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
