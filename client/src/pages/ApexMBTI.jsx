import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, Share2, ChevronLeft, Swords, Users, Brain, Shield } from 'lucide-react';
import { QUESTIONS, PERSONALITIES, DIMENSIONS, calcPersonality } from '../data/apexMBTI.js';

const TOTAL = QUESTIONS.length;

export default function ApexMBTI() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('landing'); // landing | quiz | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [slideDir, setSlideDir] = useState('right');
  const [animKey, setAnimKey] = useState(0);
  const cardRef = useRef(null);

  // Calculate scores from answers
  const scores = useMemo(() => {
    const s = { combat: 50, coop: 50, strategy: 50, risk: 50 };
    for (const [qId, optIdx] of Object.entries(answers)) {
      const q = QUESTIONS.find(qq => qq.id === Number(qId));
      if (!q) continue;
      const opt = q.options[optIdx];
      if (!opt?.scores) continue;
      for (const [dim, val] of Object.entries(opt.scores)) {
        s[dim] = Math.max(0, Math.min(100, s[dim] + val));
      }
    }
    return s;
  }, [answers]);

  const personality = useMemo(() => calcPersonality(scores), [scores]);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / TOTAL) * 100;

  const handleSelect = (optIdx) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[current].id]: optIdx }));
    // Auto advance after short delay
    if (current < TOTAL - 1) {
      setTimeout(() => {
        setSlideDir('right');
        setAnimKey(k => k + 1);
        setCurrent(c => c + 1);
      }, 300);
    }
  };

  const goTo = (idx) => {
    setSlideDir(idx > current ? 'right' : 'left');
    setAnimKey(k => k + 1);
    setCurrent(idx);
  };

  const handleSubmit = () => {
    if (answeredCount < TOTAL) return;
    setPhase('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrent(0);
    setPhase('landing');
    window.scrollTo({ top: 0 });
  };

  const handleStart = () => {
    setPhase('quiz');
    window.scrollTo({ top: 0 });
  };

  // ======================== LANDING ========================
  if (phase === 'landing') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        {/* Hero */}
        <div className="relative text-center py-12 border border-white/5 bg-zinc-950/60 overflow-hidden">
          <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent" />
          <div className="relative z-10">
            <div className="text-xs text-red-400/80 tracking-widest uppercase mb-3">Apex Legends · 娱乐测试</div>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-3">
              竞技场<span className="text-red-500">人格</span>测试
            </h1>
            <p className="text-sm text-zinc-500 mt-2">{TOTAL} 道题，揭示你在 Apex 竞技场的真实人格</p>
          </div>
        </div>

        {/* Personality grid */}
        <div className="border border-white/5 bg-zinc-950/40 p-5">
          <h2 className="text-xs text-zinc-500 text-center mb-4">16 种竞技场人格</h2>
          <div className="grid grid-cols-4 gap-2">
            {PERSONALITIES.map(p => (
              <div
                key={p.code}
                className="text-center py-2 px-1 border border-white/5 bg-zinc-900/50 hover:border-red-500/20 transition cursor-default group"
              >
                <div className="text-[10px] font-bold tracking-wider" style={{ color: p.color }}>{p.code}</div>
                <div className="text-[11px] text-zinc-400 group-hover:text-white transition mt-0.5">{p.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Start button */}
        <div className="text-center space-y-4">
          <button
            onClick={handleStart}
            className="px-10 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-lg tracking-wider transition shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
          >
            开始测试
          </button>
          <p className="text-[11px] text-zinc-600">本测试纯属娱乐，结果仅供参考 🎮</p>
        </div>
      </div>
    );
  }

  // ======================== QUIZ ========================
  if (phase === 'quiz') {
    const q = QUESTIONS[current];
    const selectedOpt = answers[q.id];

    return (
      <div className="max-w-2xl mx-auto space-y-4 pb-12">
        {/* Progress bar */}
        <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-sm border-b border-white/5 py-3 px-1">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
            <button onClick={handleRestart} className="flex items-center gap-1 hover:text-white transition">
              <ChevronLeft size={14} /> 返回首页
            </button>
            <span>{answeredCount} / {TOTAL}</span>
          </div>
          <div className="h-1 bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="border border-white/5 bg-zinc-950/60 overflow-hidden">
          <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
          <div key={animKey} className="p-5 sm:p-6 animate-page-slide" style={{ '--slide-from': slideDir === 'right' ? '60px' : '-60px' }} ref={cardRef}>
            {/* Question header */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 border border-red-500/20">
                第 {current + 1} 题 / 共 {TOTAL} 题
              </span>
            </div>

            {/* Question text */}
            <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed mb-6">
              {q.question}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {q.options.map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full flex items-start gap-3 p-3.5 border text-left transition group ${
                      isSelected
                        ? 'border-red-500/50 bg-red-500/10 text-white'
                        : 'border-white/5 bg-zinc-900/30 text-zinc-400 hover:border-white/15 hover:text-white hover:bg-zinc-800/40'
                    }`}
                  >
                    <span className={`shrink-0 w-7 h-7 grid place-items-center text-xs font-bold border ${
                      isSelected
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-white/10 text-zinc-500 group-hover:border-white/20 group-hover:text-zinc-300'
                    }`}>
                      {letter}
                    </span>
                    <span className="text-sm leading-relaxed pt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => current > 0 && goTo(current - 1)}
            disabled={current === 0}
            className="flex items-center gap-1 px-4 py-2 text-xs border border-white/5 text-zinc-500 hover:text-white hover:border-white/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={13} /> 上一题
          </button>

          {answeredCount >= TOTAL ? (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-lg shadow-red-500/20"
            >
              提交并查看结果
            </button>
          ) : (
            <button
              onClick={() => current < TOTAL - 1 && goTo(current + 1)}
              disabled={current >= TOTAL - 1}
              className="flex items-center gap-1 px-4 py-2 text-xs border border-white/5 text-zinc-500 hover:text-white hover:border-white/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              下一题 <ArrowRight size={13} />
            </button>
          )}
        </div>

        {/* Question dots */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {QUESTIONS.map((qq, i) => {
            const answered = answers[qq.id] !== undefined;
            const isCurrent = i === current;
            return (
              <button
                key={qq.id}
                onClick={() => goTo(i)}
                className={`w-6 h-6 text-[10px] font-bold border transition ${
                  isCurrent
                    ? 'border-red-500 bg-red-500/20 text-red-400'
                    : answered
                      ? 'border-green-500/30 bg-green-500/10 text-green-400'
                      : 'border-white/5 bg-zinc-900/30 text-zinc-600 hover:border-white/15'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ======================== RESULT ========================
  const dimIcons = { combat: Swords, coop: Users, strategy: Brain, risk: Shield };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Personality card */}
      <div className="relative border border-white/5 bg-zinc-950/60 overflow-hidden">
        <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-red-500/3 to-transparent" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="text-xs text-zinc-500 mb-1">你的竞技场人格</div>
          <div className="flex items-end gap-3 mb-4">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white">{personality.name}</h1>
            <span
              className="text-2xl sm:text-3xl font-black tracking-widest mb-0.5"
              style={{ color: personality.color }}
            >
              {personality.code}
            </span>
          </div>

          {/* Legend association */}
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs text-zinc-500">代表传奇:</span>
            <span className="text-sm font-bold" style={{ color: personality.color }}>{personality.legend}</span>
            <span className="text-xs text-zinc-600">({personality.legendEN})</span>
          </div>

          {/* Tagline */}
          <div className="px-4 py-3 border-l-2 bg-zinc-900/40 mb-6" style={{ borderColor: personality.color }}>
            <p className="text-sm text-zinc-300 italic">"{personality.tagline}"</p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">人格解读</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{personality.description}</p>
          </div>

          {/* Strengths / Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="border border-green-500/10 bg-green-500/5 p-4">
              <h4 className="text-xs font-bold text-green-400 mb-2">✦ 优势</h4>
              <ul className="space-y-1">
                {personality.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-red-500/10 bg-red-500/5 p-4">
              <h4 className="text-xs font-bold text-red-400 mb-2">✦ 弱点</h4>
              <ul className="space-y-1">
                {personality.weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-1.5">
                    <span className="text-red-500 mt-0.5">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Dimension scores */}
      <div className="border border-white/5 bg-zinc-950/60 p-5 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-5">四维度评分</h3>
        <div className="space-y-5">
          {Object.entries(DIMENSIONS).map(([key, dim]) => {
            const val = scores[key];
            const Icon = dimIcons[key];
            const isHigh = val >= 50;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-300">{dim.name}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 border ${
                    isHigh
                      ? 'text-red-400 border-red-500/20 bg-red-500/10'
                      : 'text-blue-400 border-blue-500/20 bg-blue-500/10'
                  }`}>
                    {isHigh ? dim.high : dim.low}
                  </span>
                </div>
                <div className="h-2 bg-zinc-800 overflow-hidden relative">
                  <div
                    className="absolute inset-y-0 left-0 transition-all duration-700"
                    style={{
                      width: `${val}%`,
                      background: `linear-gradient(90deg, #3B82F6, ${val > 50 ? '#EF4444' : '#3B82F6'})`,
                    }}
                  />
                  {/* Center marker */}
                  <div className="absolute left-1/2 inset-y-0 w-px bg-white/20" />
                </div>
                <p className="text-[11px] text-zinc-600 mt-1">
                  {isHigh ? dim.highDesc : dim.lowDesc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* All personality distribution */}
      <div className="border border-white/5 bg-zinc-950/60 p-5 sm:p-6">
        <h3 className="text-sm font-bold text-white mb-4">全部竞技场人格</h3>
        <div className="grid grid-cols-4 gap-2">
          {PERSONALITIES.map(p => {
            const isYou = p.code === personality.code;
            return (
              <div
                key={p.code}
                className={`text-center py-2.5 px-1 border transition ${
                  isYou
                    ? 'border-red-500/40 bg-red-500/10'
                    : 'border-white/5 bg-zinc-900/30'
                }`}
              >
                <div className="text-[10px] font-bold tracking-wider" style={{ color: p.color }}>{p.code}</div>
                <div className={`text-[11px] mt-0.5 ${isYou ? 'text-white font-bold' : 'text-zinc-500'}`}>
                  {p.name}
                </div>
                {isYou && (
                  <div className="text-[9px] text-red-400 mt-1 font-bold">← 你</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleRestart}
          className="flex items-center gap-1.5 px-5 py-2.5 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition text-xs"
        >
          <RotateCcw size={13} /> 重新测试
        </button>
        <button
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard?.writeText(url).then(() => alert('链接已复制！分享给朋友一起测试吧'));
          }}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
        >
          <Share2 size={13} /> 分享给朋友
        </button>
      </div>

      <p className="text-center text-[11px] text-zinc-600">本测试纯属娱乐，结果仅供参考 🎮</p>
    </div>
  );
}
