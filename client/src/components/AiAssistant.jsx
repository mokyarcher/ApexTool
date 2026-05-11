import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../api.js';

const WELCOME_MSG = {
  role: 'assistant',
  content: '你好！我是探路者，APEX TOOL 的 AI 助手。你可以问我关于网站的任何问题，或者告诉我你想看什么，我帮你快速跳转！\n\n比如试试说：\n- 「带我看绿币商店」\n- 「我想查看传家宝」\n- 「最新更新了什么？」',
};

const QUICK_ACTIONS = [
  { label: '通行证奖励', msg: '带我看通行证' },
  { label: '绿币商店', msg: '我想看奇异碎片商店' },
  { label: '传家宝', msg: '带我看传家宝' },
  { label: '最新更新', msg: '带我看最新的更新公告' },
];

function parseNav(text) {
  const match = text.match(/\[NAV:(\/[^\]]*)\]/);
  if (!match) return { clean: text, path: null };
  return { clean: text.replace(/\[NAV:\/[^\]]*\]/g, '').trim(), path: match[1] };
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);
  const [playerCards, setPlayerCards] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  function doNav(path) {
    const [pathname, hash] = path.split('#');
    navigate(pathname);
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
    setPendingNav(null);
  }

  async function sendMessage(text) {
    if (!text.trim() || streaming) return;
    const userMsg = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);
    setPendingNav(null);
    setPlayerCards(null);

    const assistantMsg = { role: 'assistant', content: '' };
    setMessages([...newMessages, assistantMsg]);

    try {
      const chatHistory = newMessages
        .filter(m => m !== WELCOME_MSG)
        .map(m => ({ role: m.role, content: m.content }));

      const stream = api.aiChat(chatHistory);
      let full = '';
      for await (const chunk of stream) {
        if (typeof chunk === 'object' && chunk.type === 'playerCards') {
          setPlayerCards(chunk.players);
          continue;
        }
        full += chunk;
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: full };
          return copy;
        });
      }

      const { clean, path } = parseNav(full);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: clean };
        return copy;
      });
      if (path) setPendingNav(path);
    } catch (err) {
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: 'assistant', content: `抱歉，出了点问题：${err.message}` };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
          open
            ? 'bg-zinc-800 border border-zinc-600 rotate-90 scale-90'
            : 'bg-gradient-to-br from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 hover:scale-110 hover:shadow-red-500/40'
        }`}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[380px] max-h-[600px] flex flex-col border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/50 transition-all duration-300 origin-bottom-right ${
          open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gradient-to-r from-red-950/50 to-transparent">
          <div className="w-8 h-8 grid place-items-center bg-gradient-to-br from-red-500 to-red-700 rounded-full">
            <Bot size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">探路者 AI</div>
            <div className="text-[11px] text-zinc-500">APEX TOOL 智能助手</div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            在线
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-hide">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 shrink-0 grid place-items-center rounded-full text-white ${
                m.role === 'user' ? 'bg-zinc-700' : 'bg-gradient-to-br from-red-500 to-red-700'
              }`}>
                {m.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>
              <div className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-red-600/20 border border-red-500/20 text-white'
                  : 'bg-white/5 border border-white/10 text-zinc-300'
              }`}>
                {m.content || (streaming && i === messages.length - 1 ? (
                  <span className="flex items-center gap-2 text-zinc-500">
                    <Loader2 size={14} className="animate-spin" /> 思考中...
                  </span>
                ) : null)}
              </div>
            </div>
          ))}

          {/* Player selection cards */}
          {playerCards && !streaming && (
            <div className="space-y-2">
              <div className="text-xs text-zinc-500 text-center">点击选择正确的账号：</div>
              <div className="space-y-1.5">
                {playerCards.map((p) => (
                  <button
                    key={p.uid}
                    onClick={() => { setPlayerCards(null); sendMessage(`查 ${p.uid} 战绩`); }}
                    className="w-full flex items-center gap-3 p-2.5 bg-zinc-900/60 border border-white/5 hover:border-red-500/40 hover:bg-zinc-900/80 transition-all text-left group"
                  >
                    {p.rankImg ? (
                      <img src={p.rankImg} alt="" className="w-8 h-8 object-contain shrink-0" />
                    ) : (
                      <div className="w-8 h-8 bg-zinc-800 grid place-items-center shrink-0"><User size={14} className="text-zinc-600" /></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-bold truncate group-hover:text-red-400 transition-colors">{p.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                        <span className="bg-zinc-800 px-1.5 py-0.5">{p.platform}</span>
                        {p.level && <span>Lv.{p.level}{p.prestige && p.prestige !== '0' ? ` (阶段${Number(p.prestige) + 1})` : ''}</span>}
                        {p.rp && <span className="text-amber-500/80 font-bold">{p.rp} RP</span>}
                      </div>
                      {p.legend && <div className="text-[10px] text-zinc-600 mt-0.5">{p.legend}</div>}
                    </div>
                    <ArrowRight size={14} className="text-zinc-600 group-hover:text-red-400 shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation button */}
          {pendingNav && !streaming && (
            <div className="flex justify-center">
              <button
                onClick={() => doNav(pendingNav)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-600/30 hover:border-red-500/50 transition-all"
              >
                <ArrowRight size={14} /> 前往页面
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick actions (show only when no user messages yet) */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(a => (
              <button
                key={a.label}
                onClick={() => sendMessage(a.msg)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-zinc-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
              >
                <Sparkles size={11} /> {a.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-white/10 p-3 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题..."
            disabled={streaming}
            className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
            className="w-9 h-9 grid place-items-center bg-red-600 hover:bg-red-500 text-white transition-colors disabled:opacity-30 disabled:hover:bg-red-600"
          >
            {streaming ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </>
  );
}
