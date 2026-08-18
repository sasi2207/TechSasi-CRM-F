import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API } from "@/lib/api";
import { cn } from "@/lib/utils";

const suggestions = [
  "Which courses have the lowest fee collection rate?",
  "Summarize this week's lead pipeline.",
  "Give me a plan to improve student attendance.",
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm TechSasi AI. Ask me anything about your students, sales pipeline, or revenue." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [session] = useState(() => `sess-${Date.now()}`);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);
    setSending(true);

    // FIX: Token சரியான பெயரில் உள்ளதா என்பதை உறுதி செய்தல்
    const token = localStorage.getItem("token") || localStorage.getItem("techsasi_token");

    try {
      const resp = await fetch(`${API}/ai/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Token இருந்தால் Header-ல் சேர்ப்போம்
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ message: msg, session_id: session }),
      });

      // 401 Error வந்தால் பயனருக்குத் தெரியப்படுத்துதல்
      if (!resp.ok) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { 
            role: "assistant", 
            content: resp.status === 401 
              ? "Your session has expired. Please logout and login again." 
              : `Sorry, I couldn't respond right now (Error ${resp.status}).` 
          };
          return copy;
        });
        setSending(false);
        return;
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() || "";
        for (const chunk of parts) {
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const payload = line.slice(6);
              if (payload === "[DONE]") continue;
              const text = payload.replace(/\\n/g, "\n");
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = {
                  role: "assistant",
                  content: (copy[copy.length - 1].content || "") + text,
                };
                return copy;
              });
            }
          }
        }
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `Network error: ${e.message}` };
        return copy;
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        data-testid="ai-chat-fab"
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full btn-gradient flex items-center justify-center focus-ring"
        aria-label="Open AI Assistant"
      >
        {open ? <X className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </button>

      <div
        data-testid="ai-chat-panel"
        className={cn(
          "fixed bottom-24 right-6 z-40 w-[min(420px,calc(100vw-2rem))] h-[560px] rounded-2xl glass-strong shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        )}
      >
        <div className="px-4 py-3 border-b border-border/40 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-outfit font-semibold text-sm">TechSasi AI</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Powered by Gemini AI</div>
          </div>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap",
                m.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              )}
            >
              {m.content || (sending && i === messages.length - 1 ? "…" : "")}
            </div>
          ))}
          {messages.length === 1 && (
            <div className="pt-2 space-y-2">
              <div className="text-xs text-muted-foreground">Try asking:</div>
              {suggestions.map((s) => (
                <button
                  key={s}
                  data-testid={`ai-suggestion-${s.slice(0, 10)}`}
                  onClick={() => send(s)}
                  className="block w-full text-left text-xs px-3 py-2 rounded-lg bg-muted/60 hover:bg-muted transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border/40 p-3 flex items-center gap-2">
          <input
            data-testid="ai-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your ERP data…"
            className="flex-1 bg-muted/60 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            disabled={sending}
          />
          <Button
            data-testid="ai-chat-send"
            size="icon"
            className="btn-gradient hover:opacity-90"
            onClick={() => send()}
            disabled={sending || !input.trim()}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </>
  );
}