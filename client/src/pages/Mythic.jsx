import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame, Sparkles, X, RotateCcw, ArrowLeft } from 'lucide-react';
import '@google/model-viewer/dist/model-viewer.min.js';
import { api } from '../api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Loader, ErrorBox } from '../components/Loader.jsx';

/* ── Currency icons ── */
function ShardIcon({ size = 14 }) {
  return <Flame size={size} className="text-red-500 inline" />;
}
function TokenIcon({ size = 14 }) {
  return <Sparkles size={size} className="text-green-400 inline" />;
}

/* ── Paginated horizontal scroll with side arrow buttons ── */
function PagedRow({ children, itemsPerPage = 5 }) {
  const items = Array.isArray(children) ? children : [children];
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const [page, setPage] = useState(0);
  const pageItems = items.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="relative flex items-center gap-2">
      {/* Left arrow */}
      {totalPages > 1 && (
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="w-10 h-40 shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/60 border border-zinc-700/40 text-white/50 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600 transition-all disabled:opacity-20 disabled:hover:bg-zinc-900/60 disabled:hover:text-white/50 disabled:hover:border-zinc-700/40"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {/* Cards + page indicators */}
      <div className="flex-1 min-w-0">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${itemsPerPage}, 1fr)` }}>
          {pageItems}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                onClick={() => setPage(i)}
                className={`h-1 rounded-full transition-all cursor-pointer ${i === page ? 'w-6 bg-red-500' : 'w-4 bg-zinc-600 hover:bg-zinc-500'}`}
              />
            ))}
          </div>
        )}
      </div>
      {/* Right arrow */}
      {totalPages > 1 && (
        <button
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={page === totalPages - 1}
          className="w-10 h-40 shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/60 border border-zinc-700/40 text-white/50 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600 transition-all disabled:opacity-20 disabled:hover:bg-zinc-900/60 disabled:hover:text-white/50 disabled:hover:border-zinc-700/40"
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
}

/* ── Section header with currency display ── */
function MythicSectionHeader({ title, shards, tokens }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="font-display text-2xl text-white font-bold">{title}</h2>
      <div className="flex items-center gap-3 text-sm">
        {shards !== undefined && (
          <span className="flex items-center gap-1 text-red-400 font-semibold"><ShardIcon /> {shards}</span>
        )}
        {tokens !== undefined && (
          <span className="flex items-center gap-1 text-green-400 font-semibold"><TokenIcon /> {tokens}</span>
        )}
      </div>
    </div>
  );
}

/* ── Heirloom card ── */
function HeirloomCard({ item, onClick }) {
  return (
    <div
      className="flex-1 min-w-0 card overflow-hidden border-red-900/40 hover:border-red-500/60 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden bg-gradient-to-b from-zinc-800/80 to-zinc-900/80" style={{ aspectRatio: '325/600' }}>
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>
    </div>
  );
}

/* ── Prestige skin card (wider, with badge icons on the right) ── */
function PrestigeCard({ item, onClick }) {
  return (
    <div
      className="flex-1 min-w-0 card overflow-hidden border-red-900/40 hover:border-red-500/60 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-b from-zinc-800/80 to-zinc-900/80">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>
    </div>
  );
}

/* ── Prestige Skin Detail Modal ── */
function PrestigeDetailModal({ item, onClose }) {
  const [visible, setVisible] = useState(false);
  const [activeLevel, setActiveLevel] = useState(0);
  useEffect(() => { const h = (e) => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, []);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  function close() { setVisible(false); setTimeout(onClose, 400); }

  const levels = item.levels || [];
  const current = levels[activeLevel];

  return (
    <div className={`fixed inset-0 z-50 transition-all duration-400 ease-out ${visible ? 'bg-black/90 backdrop-blur-md' : 'bg-black/0'}`} onClick={close}>
      <button className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10" onClick={close}><X size={28} /></button>
      <div
        className={`absolute inset-0 flex transition-all duration-400 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left panel - info */}
        <div className="w-[40%] flex flex-col justify-between px-10 py-10 relative z-10">
          <div>
            <h2 className="font-display text-5xl text-white font-bold">{item.name}</h2>
            <div className="w-full h-px bg-zinc-700 mt-3 mb-3" />
            <div className="text-sm text-zinc-400 mb-5">{item.desc}</div>

            {/* Level icons row */}
            <div className="flex items-center gap-2 mb-5">
              {levels.map((lv, i) => (
                <div key={lv.level} className="flex items-center gap-2">
                  <div
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                      i === activeLevel
                        ? 'border-red-500 shadow-lg shadow-red-500/30 scale-105'
                        : 'border-zinc-600/50 hover:border-zinc-400 opacity-60 hover:opacity-100'
                    }`}
                    onMouseEnter={() => setActiveLevel(i)}
                  >
                    <img src={lv.icon} alt={`等级 ${lv.level}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  {i < levels.length - 1 && <span className="text-zinc-600 text-lg">»</span>}
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="text-sm text-zinc-500 leading-relaxed">
              威望级皮肤是稀有度为神话级的传奇外观皮肤，每一款都有 3 个等级（威望皮肤共有 3 个版本）。玩家解锁 1 级威望级皮肤后，可以完成挑战，解锁 2 级和 3 级（无需额外花费）。挑战开放后，玩家可以在任何时候选择完成这些挑战，没有时间限制。
            </div>
          </div>

          {/* ESC back */}
          <button className="flex items-center gap-3 text-zinc-400 hover:text-white transition" onClick={close}>
            <span className="text-sm border border-zinc-600 rounded px-2 py-1">ESC</span>
            <span className="text-sm">返回</span>
          </button>
        </div>

        {/* Right panel - skin image with red smoke bg */}
        <div className="w-[55%] relative overflow-hidden">
          {/* Red smoke background */}
          <div className="absolute inset-0 apex-viewer-bg">
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
              <defs>
                <filter id="prestige-smoke-filter" x="-50%" y="-50%" width="200%" height="200%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="5" result="noise">
                    <animate attributeName="seed" from="0" to="100" dur="20s" repeatCount="indefinite" />
                  </feTurbulence>
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="80" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
            </svg>
            <ApexParticles count={25} />
          </div>
          {/* Skin image */}
          {current && (
            <img
              key={current.level}
              src={current.image}
              alt={`${item.name} 等级${current.level}`}
              className="absolute inset-0 w-full h-full object-contain object-center z-10 transition-opacity duration-300"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Artifact section: base + evolutions in one row ── */
function ArtifactRow({ item, onClickImage }) {
  return (
    <div className="flex gap-3">
      {/* Base artifact card */}
      <div
        className="w-[240px] shrink-0 card overflow-hidden border-red-900/40 hover:border-red-500/60 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200 cursor-pointer"
        onClick={() => onClickImage(item.image, item.name)}
      >
        <div className="aspect-[4/5] relative overflow-hidden bg-zinc-900/80 flex items-center justify-center">
          <img src={item.image} alt={item.name} className="w-full h-full object-contain p-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
        <div className="p-3 space-y-1">
          <div className="text-sm text-red-400 font-semibold">{item.name}</div>
          <div className="text-xs text-zinc-500">{item.type}</div>
          <div className="flex items-center gap-1 text-sm font-bold text-red-400 mt-1">
            <ShardIcon size={13} /> {item.price}
          </div>
        </div>
      </div>
      {/* Evolution set cards */}
      {item.evolutions && item.evolutions.map((evo) => (
        <div
          key={evo.id}
          className="w-[280px] shrink-0 card overflow-hidden border-red-900/40 hover:border-red-500/60 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200 cursor-pointer relative"
          onClick={() => onClickImage(evo.image, evo.name)}
        >
          {/* Cost badge */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 text-xs font-bold text-green-400 bg-black/60 rounded px-2 py-0.5">
            <TokenIcon size={12} /> {evo.costPerItem} 每件
          </div>
          <div className="aspect-[5/3] relative overflow-hidden bg-gradient-to-br from-red-900/30 to-zinc-900/80">
            <img src={evo.image} alt={evo.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div className="p-3 space-y-1">
            <div className="text-sm text-red-400 font-semibold">{evo.name}</div>
            <div className="text-xs text-zinc-500">{evo.type}</div>
            <div className="text-xs text-zinc-400 mt-1">已拥有 {evo.owned}/{evo.total} 件物品</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Set card (for 通用近战 and 神话武器) ── */
function SetCard({ item, onClick }) {
  return (
    <div
      className="flex-1 min-w-0 card overflow-hidden border-red-900/40 hover:border-red-500/60 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-200 cursor-pointer relative"
      onClick={onClick}
    >
      {/* Cost badge */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 text-xs font-bold bg-black/60 rounded px-2 py-0.5">
        {item.costPerItem >= 150 ? (
          <span className="text-red-400"><ShardIcon size={12} /> {item.costPerItem} 每件</span>
        ) : (
          <span className="text-green-400"><TokenIcon size={12} /> {item.costPerItem} 每件</span>
        )}
      </div>
      <div className="aspect-[5/3] relative overflow-hidden bg-gradient-to-br from-red-900/30 to-zinc-900/80">
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>
    </div>
  );
}

/* ── Melee Set Detail Modal ── */
function MeleeSetModal({ set, onClose, onViewModel }) {
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState(0);
  const perPage = 4;
  useEffect(() => { const h = (e) => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, []);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  function close() { setVisible(false); setTimeout(onClose, 400); }

  const variants = set.variants || [];
  const totalPages = Math.ceil(variants.length / perPage);
  const pageItems = variants.slice(page * perPage, (page + 1) * perPage);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-400 ease-out ${visible ? 'bg-black/85 backdrop-blur-md' : 'bg-black/0'}`} onClick={close}>
      <button className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10" onClick={close}><X size={28} /></button>
      <button className="absolute bottom-6 left-6 z-10 flex items-center gap-3 text-zinc-400 hover:text-white transition" onClick={close}>
        <span className="text-sm border border-zinc-600 rounded px-2 py-1">ESC</span>
        <span className="text-sm">返回</span>
      </button>
      <div
        className={`relative w-full max-w-[1400px] transition-all duration-400 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4">
          <h2 className="font-display text-3xl text-white font-bold">{set.name}</h2>
          <div className="text-sm text-zinc-400 mt-1">已拥有 {set.owned}/{set.total} 件物品</div>
        </div>
        {/* Variant cards with pagination */}
        <div className="flex items-center gap-3">
          {totalPages > 1 && (
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-10 h-48 shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/60 border border-zinc-700/40 text-white/50 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600 transition-all disabled:opacity-20 disabled:hover:bg-zinc-900/60 disabled:hover:text-white/50 disabled:hover:border-zinc-700/40"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="grid gap-5 p-3" style={{ gridTemplateColumns: `repeat(${perPage}, 1fr)` }}>
              {pageItems.map((v, idx) => {
                const isBase = page === 0 && idx === 0;
                return (
                  <div
                    key={v.id}
                    className={`rounded-xl overflow-hidden border transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:brightness-110 hover:shadow-xl ${
                      isBase
                        ? 'border-amber-500/60 hover:border-amber-400 hover:shadow-amber-500/20 bg-gradient-to-b from-amber-900/20 to-zinc-900/80'
                        : 'border-red-900/40 hover:border-red-500/60 hover:shadow-red-500/10 bg-gradient-to-b from-zinc-800/80 to-zinc-900/90'
                    }`}
                    onClick={() => onViewModel(v)}
                  >
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img src={v.image} alt={v.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setPage(i)}
                    className={`h-1 rounded-full transition-all cursor-pointer ${i === page ? 'w-6 bg-red-500' : 'w-4 bg-zinc-600 hover:bg-zinc-500'}`}
                  />
                ))}
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="w-10 h-48 shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/60 border border-zinc-700/40 text-white/50 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600 transition-all disabled:opacity-20 disabled:hover:bg-zinc-900/60 disabled:hover:text-white/50 disabled:hover:border-zinc-700/40"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Floating hexagonal particles ── */
function ApexParticles({ count = 50 }) {
  const particles = useRef(
    Array.from({ length: count }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 3 + Math.random() * 7,
      opacity: 0.4 + Math.random() * 0.6,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * -10,
      color: Math.random() > 0.3
        ? `rgb(${200 + Math.random() * 55}, ${140 + Math.random() * 60}, ${20 + Math.random() * 40})`
        : `rgb(${180 + Math.random() * 75}, ${50 + Math.random() * 30}, ${20 + Math.random() * 20})`,
    }))
  ).current;
  return (
    <div className="apex-particles">
      {particles.map((p, i) => (
        <div
          key={i}
          className="apex-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size * 1.15,
            backgroundColor: p.color,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ── 3D Model Viewer Modal ── */
function ModelViewer3D({ item, onClose }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('download'); // 'download' | 'processing' | 'done'
  const [loadError, setLoadError] = useState(false);
  const mvRef = useRef(null);
  const lastProgressTime = useRef(Date.now());
  const stallTimer = useRef(null);

  useEffect(() => { const h = (e) => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, []);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  useEffect(() => {
    const el = mvRef.current;
    if (!el) return;
    const onProgress = (e) => {
      const p = Math.round(e.detail.totalProgress * 100);
      setProgress(p);
      lastProgressTime.current = Date.now();
      clearTimeout(stallTimer.current);
      if (p < 100) {
        stallTimer.current = setTimeout(() => {
          if (phase !== 'done') setPhase('processing');
        }, 1500);
      }
    };
    const onLoad = () => {
      clearTimeout(stallTimer.current);
      setProgress(100);
      setPhase('done');
    };
    const onError = () => {
      clearTimeout(stallTimer.current);
      setLoadError(true);
      setPhase('done');
    };
    el.addEventListener('progress', onProgress);
    el.addEventListener('load', onLoad);
    el.addEventListener('error', onError);
    return () => {
      clearTimeout(stallTimer.current);
      el.removeEventListener('progress', onProgress);
      el.removeEventListener('load', onLoad);
      el.removeEventListener('error', onError);
    };
  }, []);

  function close() { setVisible(false); setTimeout(onClose, 400); }
  const isLoading = phase !== 'done';
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-400 ease-out ${visible ? 'bg-black/85 backdrop-blur-md' : 'bg-black/0'}`} onClick={close}>
      <button className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10" onClick={close}><X size={28} /></button>
      <div
        className={`relative w-[90vw] h-[85vh] max-w-[1200px] transition-all duration-400 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Info overlay */}
        <div className="absolute top-6 left-6 z-10">
          <h2 className="font-display text-3xl text-white font-bold">{item.name}</h2>
          <div className="text-sm text-zinc-400 mt-1">{item.tag || `${item.legend} · 传家宝`}</div>
          <div className="flex items-center gap-1 text-red-400 font-bold mt-2"><ShardIcon size={16} /> {item.price}</div>
        </div>
        <button className="absolute bottom-6 left-6 z-10 flex items-center gap-3 text-zinc-400 hover:text-white transition" onClick={close}>
          <span className="text-sm border border-zinc-600 rounded px-2 py-1">ESC</span>
          <span className="text-sm">返回</span>
        </button>
        {/* Top progress bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 z-10">
            <div className="h-1 bg-zinc-800/50 w-full">
              <div
                className={`h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ease-out ${phase === 'processing' ? 'animate-pulse' : ''}`}
                style={{ width: phase === 'processing' ? '100%' : `${progress}%` }}
              />
            </div>
          </div>
        )}
        {/* Model not found message */}
        {loadError && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
            <div className="text-5xl mb-4">🚀</div>
            <div className="text-xl text-zinc-300 font-semibold">模型文件正在路上</div>
            <div className="text-sm text-zinc-500 mt-2">Model file is on the way...</div>
          </div>
        )}
        {/* Apex background + particles + model-viewer */}
        <div className="apex-viewer-bg" style={{ width: '100%', height: '100%' }}>
          {/* SVG noise filter for smoke */}
          <svg style={{ position: 'absolute', width: 0, height: 0 }}>
            <defs>
              <filter id="apex-smoke-filter" x="-50%" y="-50%" width="200%" height="200%">
                <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="2" result="noise">
                  <animate attributeName="seed" from="0" to="100" dur="20s" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="80" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
          </svg>
          <ApexParticles />
          <model-viewer
            ref={mvRef}
            src={item.model}
            alt={item.name}
            camera-controls
            auto-rotate
            autoplay
            shadow-intensity="0.8"
            exposure="1.2"
            tone-mapping="commerce"
            interaction-prompt="auto"
            style={{ width: '100%', height: '100%', position: 'relative', zIndex: 2, background: 'transparent' }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Lightbox ── */
function MythicLightbox({ src, alt, onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const h = (e) => { if (e.key === 'Escape') close(); }; document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, []);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  function close() { setVisible(false); setTimeout(onClose, 400); }
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-400 ease-out ${visible ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0'}`} onClick={close}>
      <button className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10" onClick={close}><X size={28} /></button>
      <img src={src} alt={alt} className={`max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-all duration-400 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

/* ── Main page ── */
export default function Mythic() {
  const { data, loading, error, reload } = useFetch(api.mythic, []);
  const [lightbox, setLightbox] = useState(null);
  const [modelViewer, setModelViewer] = useState(null);
  const [meleeSet, setMeleeSet] = useState(null);
  const [prestigeDetail, setPrestigeDetail] = useState(null);

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  if (!data) return null;

  const { heirlooms, prestigeSkins, artifacts, universalMelee, mythicWeapons } = data;

  function openLightbox(src, alt) {
    setLightbox({ src, alt });
  }

  return (
    <div className="space-y-10">

      {/* ── 传家宝 ── */}
      {heirlooms && (
        <section>
          <MythicSectionHeader title={heirlooms.name} shards={heirlooms.currency.shards} />
          <PagedRow itemsPerPage={5}>
            {heirlooms.items.map((item) => (
              <HeirloomCard key={item.id} item={item} onClick={() => item.model ? setModelViewer(item) : openLightbox(item.image, item.name)} />
            ))}
          </PagedRow>
        </section>
      )}

      {/* ── 威望级皮肤 ── */}
      {prestigeSkins && (
        <section>
          <MythicSectionHeader title={prestigeSkins.name} shards={prestigeSkins.currency.shards} />
          <PagedRow itemsPerPage={3}>
            {prestigeSkins.items.map((item) => (
              <PrestigeCard key={item.id} item={item} onClick={() => setPrestigeDetail(item)} />
            ))}
          </PagedRow>
        </section>
      )}

      {/* ── APEX 神器（暂时隐藏） ──
      {artifacts && (
        <section>
          <MythicSectionHeader title={artifacts.name} shards={artifacts.currency.shards} tokens={artifacts.currency.tokens} />
          <div className="space-y-4">
            {artifacts.items.map((item) => (
              <div key={item.id} className="overflow-x-auto scrollbar-hide">
                <ArtifactRow item={item} onClickImage={openLightbox} />
              </div>
            ))}
          </div>
        </section>
      )}
      */}

      {/* ── 通用近战 ── */}
      {universalMelee && (
        <section>
          <MythicSectionHeader title={universalMelee.name} shards={universalMelee.currency.shards} tokens={universalMelee.currency.tokens} />
          <PagedRow itemsPerPage={3}>
            {universalMelee.items.map((item) => (
              <SetCard key={item.id} item={item} onClick={() => setMeleeSet(item)} />
            ))}
          </PagedRow>
        </section>
      )}

      {/* ── 神话武器 ── */}
      {mythicWeapons && (
        <section>
          <MythicSectionHeader title={mythicWeapons.name} shards={mythicWeapons.currency.shards} tokens={mythicWeapons.currency.tokens} />
          <PagedRow itemsPerPage={3}>
            {mythicWeapons.items.map((item) => (
              <SetCard key={item.id} item={item} onClick={() => openLightbox(item.image, item.name)} />
            ))}
          </PagedRow>
        </section>
      )}

      {/* ── Prestige Detail Modal ── */}
      {prestigeDetail && (
        <PrestigeDetailModal item={prestigeDetail} onClose={() => setPrestigeDetail(null)} />
      )}

      {/* ── Melee Set Modal ── */}
      {meleeSet && (
        <MeleeSetModal
          set={meleeSet}
          onClose={() => setMeleeSet(null)}
          onViewModel={(variant) => setModelViewer({ ...variant, legend: meleeSet.name })}
        />
      )}

      {/* ── 3D Model Viewer ── */}
      {modelViewer && (
        <ModelViewer3D item={modelViewer} onClose={() => setModelViewer(null)} />
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <MythicLightbox src={lightbox.src} alt={lightbox.alt} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
