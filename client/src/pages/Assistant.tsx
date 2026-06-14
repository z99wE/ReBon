import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Bot, Send, Loader2, Sparkles, Cpu, Zap } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

interface Message { role: "user" | "assistant"; content: string; provider?: string; latencyMs?: number; }

const SUGGESTED_PROMPTS = [
  "What's my biggest carbon category?",
  "How can I reduce my transport emissions?",
  "What does 100kg CO₂ mean in real life?",
  "Give me 3 easy wins for this week",
  "How do I compare to the average person?",
];

const providerColors: Record<string, string> = { groq: "text-orange-400", nvidia_nim: "text-green-400", sarvam: "text-blue-400" };
const providerLabels: Record<string, string> = { groq: "Groq", nvidia_nim: "NVIDIA NIM", sarvam: "Sarvam AI" };

export default function Assistant() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatMutation = trpc.assistant.chat.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.content, provider: data.provider, latencyMs: data.latencyMs }]);
    },
    onError: (e) => { toast.error(e.message); setMessages(prev => prev.slice(0, -1)); },
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    chatMutation.mutate({
      message: text,
      history: messages.map(m => ({ role: m.role, content: m.content })),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-indigo-600/10 border border-primary/30 flex items-center justify-center mx-auto pulse-glow">
          <Bot className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white mb-2">Meet ReBon AI</h2>
          <p className="text-white/50 max-w-sm">Your intelligent carbon coach powered by Groq, NVIDIA NIM, and Sarvam AI</p>
        </div>
        <a href={getLoginUrl()} className="btn-primary px-8 py-3 rounded-xl font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Sign In to Chat
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-indigo-600/10 border border-primary/30 flex items-center justify-center pulse-glow">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-black text-white">ReBon AI</h1>
          <div className="flex items-center gap-2 text-xs text-white/50">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Multi-model routing: Groq · NVIDIA NIM · Sarvam AI
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="text-4xl mb-3">🌱</div>
              <h3 className="font-bold text-white mb-1">Hi! I'm ReBon AI</h3>
              <p className="text-sm text-white/50">Ask me anything about your carbon footprint, climate science, or how to reduce your impact.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map(prompt => (
                <button key={prompt} onClick={() => sendMessage(prompt)} className="text-left p-3 rounded-xl border border-white/10 hover:border-primary/40 hover:bg-indigo-600/5 text-sm text-white/50 hover:text-white transition-all">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-indigo-600/10 border border-primary/30 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                <Bot className="w-3.5 h-3.5 text-primary" />
              </div>
            )}
            <div className={`max-w-[85%] ${msg.role === "user" ? "bg-indigo-600/15 border border-primary/30 rounded-2xl rounded-tr-sm" : "bg-white/5/50 border border-white/10 rounded-2xl rounded-tl-sm"} px-4 py-3`}>
              {msg.role === "assistant" ? (
                <div className="text-sm text-white prose-sm">
                  <Streamdown>{msg.content}</Streamdown>
                </div>
              ) : (
                <p className="text-sm text-white">{msg.content}</p>
              )}
              {msg.provider && (
                <div className={`flex items-center gap-1 mt-2 text-[10px] ${providerColors[msg.provider] ?? "text-white/50"}`}>
                  <Cpu className="w-2.5 h-2.5" />
                  {providerLabels[msg.provider] ?? msg.provider}
                  {msg.latencyMs && <span className="text-white/50 ml-1">{msg.latencyMs}ms</span>}
                </div>
              )}
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-indigo-600/10 border border-primary/30 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
              <Bot className="w-3.5 h-3.5 text-primary" />
            </div>
            <div className="bg-white/5/50 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-white/50">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking</span>
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1 h-1 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1 h-1 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder="Ask ReBon AI anything about carbon..."
            disabled={chatMutation.isPending}
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || chatMutation.isPending}
            className="w-12 h-12 rounded-xl btn-primary flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {chatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[10px] text-white/50">
          <Zap className="w-2.5 h-2.5" />
          Powered by multi-model routing: Groq (fast) · NVIDIA NIM (deep) · Sarvam AI (multilingual)
        </div>
      </div>
    </div>
  );
}
