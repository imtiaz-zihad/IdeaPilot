"use client";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { Startup } from "@/types";

interface Message {
  _id:       string;
  role:      "user" | "assistant";
  content:   string;
  createdAt: string;
}

const SUGGESTED = [
  "What should be my go-to-market strategy?",
  "How should I price my product?",
  "What are my biggest risks right now?",
  "How can I acquire my first 100 customers?",
  "What team members should I hire first?",
  "How do I prepare for a seed round?",
];

export default function AIChatPage() {
  const [startups,    setStartups]    = useState<Startup[]>([]);
  const [selected,    setSelected]    = useState("");
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showClear,   setShowClear]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Load startups
  useEffect(() => {
    api.get("/startups").then(({ data }) => {
      setStartups(data.data);
      if (data.data.length > 0) setSelected(data.data[0]._id);
    }).finally(() => setFetching(false));
  }, []);

  // Load chat history when startup changes
  useEffect(() => {
    if (!selected) return;
    setLoadingMsgs(true);
    setMessages([]);
    api.get(`/chat/${selected}`)
      .then(({ data }) => setMessages(data.data.messages))
      .catch(() => setMessages([]))
      .finally(() => setLoadingMsgs(false));
  }, [selected]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading || !selected) return;

    // Optimistic UI — add user message immediately
    const tempMsg: Message = {
      _id:       Date.now().toString(),
      role:      "user",
      content:   text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post(`/chat/${selected}`, { message: text });
      const aiMsg: Message = {
        _id:       (Date.now() + 1).toString(),
        role:      "assistant",
        content:   data.data.response,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
      setInput(text);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    if (!selected) return;
    await api.delete(`/chat/${selected}`);
    setMessages([]);
    setShowClear(false);
  };

  const handleSuggest = (s: string) => {
    setInput(s);
    inputRef.current?.focus();
  };

  const selectedStartup = startups.find(s => s._id === selected);

  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">

      {/* ── Top bar ── */}
      <div className="bg-bg2 border-b border-border px-6 py-3 flex items-center gap-3 flex-wrap shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-[16px]">
            🤝
          </div>
          <div>
            <p className="text-[14px] font-semibold text-text">AI Co-Founder</p>
            <p className="text-[11px] text-text3">Powered by Gemini · Knows your startup</p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Startup selector */}
          <div className="flex items-center gap-2">
            <label className="text-[12px] text-text3 shrink-0">Startup:</label>
            {fetching ? (
              <div className="input text-text3 w-48 pointer-events-none text-[13px]">Loading...</div>
            ) : startups.length === 0 ? (
              <div className="input text-text3 w-48 pointer-events-none text-[13px]">No startups</div>
            ) : (
              <select
                className="input w-48 text-[13px]"
                value={selected}
                onChange={e => setSelected(e.target.value)}
              >
                {startups.map(s => (
                  <option key={s._id} value={s._id}>{s.startupName}</option>
                ))}
              </select>
            )}
          </div>

          {/* Clear button */}
          {messages.length > 0 && (
            <button
              onClick={() => setShowClear(true)}
              className="btn-ghost text-[12px] px-3 py-1.5"
            >
              🗑 Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">

        {loadingMsgs ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="spinner-lg w-8 h-8 mb-3" />
              <p className="text-text3 text-[13px]">Loading conversation...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-[32px] mb-4">
              🤝
            </div>
            <h2 className="text-[18px] font-bold text-text mb-2">
              Your AI Co-Founder is ready
            </h2>
            {selectedStartup && (
              <p className="text-[13px] text-text2 mb-6">
                I know everything about <strong className="text-accent">{selectedStartup.startupName}</strong> —
                your idea, market, scores, and financial projections.
                Ask me anything.
              </p>
            )}
            {/* Suggested questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              {SUGGESTED.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggest(s)}
                  className="text-left px-4 py-3 rounded-[12px] bg-bg2 border border-border text-[13px] text-text2 hover:border-accent hover:text-text transition-all duration-150 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ── Message list ── */
          <div className="flex flex-col gap-5 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[14px] mt-0.5
                  ${msg.role === "user"
                    ? "bg-accent text-white"
                    : "bg-bg3 border border-border"}`}
                >
                  {msg.role === "user" ? "👤" : "🤝"}
                </div>

                {/* Bubble */}
                <div className={`max-w-[75%] flex flex-col gap-1
                  ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className={`px-4 py-3 rounded-[14px] text-[14px] leading-relaxed
                    ${msg.role === "user"
                      ? "bg-accent text-white rounded-tr-[4px]"
                      : "bg-bg2 border border-border text-text rounded-tl-[4px]"}`}
                  >
                    {/* Render line breaks */}
                    {msg.content.split("\n").map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-text3 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-bg3 border border-border flex items-center justify-center text-[14px] shrink-0">
                  🤝
                </div>
                <div className="px-4 py-3 bg-bg2 border border-border rounded-[14px] rounded-tl-[4px] flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-text3"
                      style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input area ── */}
      <div className="shrink-0 border-t border-border bg-bg2 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selected
                  ? `Ask your AI Co-Founder anything about ${selectedStartup?.startupName ?? "your startup"}...`
                  : "Select a startup to start chatting..."
              }
              disabled={!selected || loading}
              rows={1}
              className="input flex-1 resize-none leading-relaxed py-3 min-h-[46px] max-h-[140px]"
              style={{ overflowY: "auto" }}
              onInput={e => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = Math.min(t.scrollHeight, 140) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading || !selected}
              className="btn-primary shrink-0 h-[46px] px-5 disabled:opacity-40"
            >
              {loading
                ? <span className="spinner w-4 h-4" />
                : <SendIcon />
              }
            </button>
          </div>
          <p className="text-[11px] text-text3 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ── Clear confirm modal ── */}
      {showClear && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 fade-in"
          onClick={e => e.target === e.currentTarget && setShowClear(false)}
        >
          <div className="bg-bg2 border border-border2 rounded-[16px] p-7 w-full max-w-sm slide-up">
            <h3 className="text-[17px] font-bold text-text mb-2">Clear conversation?</h3>
            <p className="text-[13px] text-text2 leading-relaxed mb-5">
              This will permanently delete all messages with your AI Co-Founder for this startup.
            </p>
            <div className="flex gap-2.5 justify-end">
              <button onClick={() => setShowClear(false)} className="btn-ghost">Cancel</button>
              <button onClick={handleClear} className="btn-danger">Yes, clear</button>
            </div>
          </div>
        </div>
      )}

      {/* bounce keyframe */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);