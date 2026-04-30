import { useMemo, useState, useEffect, useCallback } from 'react';
import { Star, Lock, Gift, Package, Sparkles, Coins, Wrench, Crown, Zap, ShieldCheck, X, Info, Clock } from 'lucide-react';
import { api } from '../api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Loader, ErrorBox } from '../components/Loader.jsx';

const RARITY_CN = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说'
};

const TIER_META = {
  free:          { label: '免费',  icon: Lock,        cls: 'bg-zinc-700/40 text-zinc-200 border border-zinc-600/40' },
  premium:       { label: '高级',  icon: Star,        cls: 'bg-apex-red/20 text-red-200 border border-apex-red/50' },
  ultimate:      { label: '终极',  icon: ShieldCheck, cls: 'bg-purple-600/25 text-purple-200 border border-purple-500/50' },
  ultimate_plus: { label: '终极+', icon: Crown,       cls: 'bg-amber-500/25 text-amber-200 border border-amber-500/50' }
};

const typeIcon = {
  skin: Sparkles,
  legend: Star,
  pack: Package,
  coins: Coins,
  materials: Wrench,
  emote: Gift,
  badge: Gift,
  banner: Gift,
  stat_tracker: Gift
};

function Lightbox({ src, alt, onClose }) {
  const [visible, setVisible] = useState(false);
  const handleKey = useCallback((e) => { if (e.key === 'Escape') handleClose(); }, [onClose]);
  useEffect(() => { document.addEventListener('keydown', handleKey); return () => document.removeEventListener('keydown', handleKey); }, [handleKey]);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 400);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-400 ease-out ${visible ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0'}`}
      onClick={handleClose}
    >
      <img
        src={src}
        alt={alt}
        className={`max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-all duration-400 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        onClick={(e) => e.stopPropagation()}
      />
      <button onClick={handleClose} className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white hover:scale-110 transition-all duration-200 cursor-pointer z-10">
        <span className="chip bg-zinc-700/40 text-zinc-300 border-zinc-600/40 text-xs px-2 py-1">ESC</span> 返回
      </button>
    </div>
  );
}

function TierButton({ icon: Icon, label, cls, tipImage, onImageClick }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <button
        className={`px-4 py-2 text-sm font-semibold border transition-all duration-200 flex items-center gap-1.5 cursor-pointer hover:brightness-125 hover:shadow-lg hover:shadow-white/15 hover:-translate-y-0.5 active:translate-y-0 ${cls}`}
        onClick={() => tipImage && onImageClick && onImageClick(tipImage, label)}
      >
        <Icon size={15} /> {label}
      </button>
      {show && tipImage && (
        <div className="absolute bottom-full left-0 mb-3 z-50">
          <div className="absolute left-8 -bottom-1.5 w-3 h-3 rotate-45 bg-zinc-900/95 border-r border-b border-white/10" />
          <div className="border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
            <img src={tipImage} alt="" style={{ width: '460px', height: 'auto' }} />
          </div>
        </div>
      )}
    </div>
  );
}

const RARITY_GLOW = {
  common: 'from-zinc-700/30 to-zinc-900/60 hover:border-zinc-400/50 hover:shadow-zinc-500/10',
  rare: 'from-blue-900/30 to-zinc-900/60 hover:border-blue-400/60 hover:shadow-blue-500/15',
  epic: 'from-purple-900/30 to-zinc-900/60 hover:border-purple-400/60 hover:shadow-purple-500/15',
  legendary: 'from-amber-900/25 to-zinc-900/60 hover:border-amber-400/60 hover:shadow-amber-500/15',
  mythic: 'from-red-900/30 to-zinc-900/60 hover:border-red-400/60 hover:shadow-red-500/15',
};

function RewardCard({ r, onImageClick }) {
  const Icon = typeIcon[r.type] || Gift;
  const rarity = r.rarity || 'common';
  const glow = RARITY_GLOW[rarity] || RARITY_GLOW.common;
  return (
    <div className={`group relative card !rounded-none overflow-hidden bg-gradient-to-b ${glow} hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg transition-all duration-250 ease-out`}>
      {/* Shine sweep on hover */}
      <div className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/8 to-transparent opacity-0 transition-all duration-600 group-hover:translate-x-full group-hover:opacity-100" />
      {/* Top bar: level + tier */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <span className="font-display text-lg text-white/90">Lv.{r.level}</span>
        {(() => { const t = TIER_META[r.tier] || TIER_META.free; const TIcon = t.icon; return (
          <span className={`chip ${t.cls}`}><TIcon size={11} /> {t.label}</span>
        ); })()}
      </div>
      {/* Image area */}
      <div
        className={`aspect-square mx-2 mb-1 border flex items-center justify-center overflow-hidden rarity-${rarity} ${r.image ? 'cursor-pointer' : ''}`}
        onClick={() => r.image && onImageClick(r)}
      >
        {r.image ? (
          <img
            src={r.image}
            alt={r.nameCN || r.name}
            className="w-full h-full object-contain p-1.5 transition duration-400 group-hover:scale-[1.06] group-hover:brightness-110"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
          />
        ) : null}
        <Icon size={36} className="text-zinc-500" style={{ display: r.image ? 'none' : 'block' }} />
      </div>
      {/* Info bar */}
      <div className="px-3 py-2.5 bg-black/25">
        <div className="text-sm text-white leading-tight truncate">{(r.nameCN || r.name)}{r.amount ? ` ×${r.amount}` : ''}</div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          <span className={`chip rarity-${rarity}`}>{RARITY_CN[rarity] || rarity}</span>
          {r.reactive && <span className="chip rarity-legendary">动态</span>}
        </div>
      </div>
    </div>
  );
}

export default function BattlePass() {
  const { data, loading, error, reload } = useFetch(api.battlepass, []);
  const [filter, setFilter] = useState('all'); // all | free | premium | ultimate | ultimate_plus
  const [lightbox, setLightbox] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!data) return;
    function calc() {
      const diff = new Date(data.endDate).getTime() - Date.now();
      if (diff <= 0) { setCountdown('已结束'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${d}天${h}小时${m}分`);
    }
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data.rewards;
    return data.rewards.filter((r) => r.tier === filter);
  }, [data, filter]);

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <div className="relative">

      <div className="sticky top-14 z-30 bg-zinc-950/95 backdrop-blur-sm -mx-4 px-4 pb-3">
        <section className="relative card !rounded-none overflow-hidden">
          {/* ── Hero section gradient overlay ── */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(239,68,68,0.15),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(168,85,247,0.12),transparent_50%)]" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-red-950/20 via-transparent to-purple-950/15" />
          <div className="relative p-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <div className="text-zinc-400 text-sm">Season {data.season} · {data.splitId}</div>
            <h1 className="font-display text-4xl md:text-5xl text-white leading-none mt-1">{data.name}</h1>
            {countdown && (
              <div className="flex items-center gap-2 mt-2 text-amber-300 font-semibold">
                <Clock size={16} />
                <span>剩余时间：{countdown}</span>
              </div>
            )}
            <p className="text-zinc-400 mt-2 max-w-xl">{data.description}</p>
            <div className="flex gap-3 mt-4 flex-wrap items-center">
              <TierButton icon={Lock} label="免费" cls="bg-zinc-700/40 text-zinc-200 border-zinc-600/40 hover:bg-zinc-700/60" tipImage="/bp/tier-free.jpg" onImageClick={(src, alt) => setLightbox({ image: src, name: alt })} />
              <TierButton icon={Star} label={`高级 ${data.pricePremium} 币`} cls="bg-red-500/15 text-red-200 border-red-500/40 hover:bg-red-500/25" tipImage="/bp/tier-premium.jpg" onImageClick={(src, alt) => setLightbox({ image: src, name: alt })} />
              <TierButton icon={ShieldCheck} label={`终极 ¥${(data.priceUltimate / 100).toFixed(0)}`} cls="bg-purple-600/20 text-purple-200 border-purple-500/40 hover:bg-purple-600/30" tipImage="/bp/tier-ultimate.jpg" onImageClick={(src, alt) => setLightbox({ image: src, name: alt })} />
              <TierButton icon={Crown} label={`终极+ ¥${(data.priceUltimatePlus / 100).toFixed(0)}`} cls="bg-amber-500/20 text-amber-200 border-amber-500/40 hover:bg-amber-500/30" tipImage="/bp/tier-ultimate-plus.jpg" onImageClick={(src, alt) => setLightbox({ image: src, name: alt })} />
              <button onClick={() => setShowInfo(true)} className="px-4 py-2 text-sm font-semibold bg-sky-600/20 text-sky-200 border border-sky-500/40 transition-all duration-200 cursor-pointer flex items-center gap-1.5 hover:brightness-125 hover:shadow-lg hover:shadow-sky-500/15 hover:-translate-y-0.5 active:translate-y-0"><Info size={15} />奖励对比</button>
            </div>
          </div>
          <div className="text-right text-base text-zinc-300 space-y-1.5">
            <div>开始: <span className="text-white font-semibold text-lg">{data.startDate}</span></div>
            <div>结束: <span className="text-white font-semibold text-lg">{data.endDate}</span></div>
            <div className="mt-2 text-xl text-white font-bold">共 {data.rewards.length} 项奖励</div>
          </div>
          </div>
        </section>

        <div className="flex items-center gap-2 mt-3">
          {[
            { k: 'all', label: '全部' },
            { k: 'free', label: '免费' },
            { k: 'premium', label: '高级' },
            { k: 'ultimate', label: '终极' },
            { k: 'ultimate_plus', label: '终极+' }
          ].map((o) => (
            <button
              key={o.k}
              onClick={() => setFilter(o.k)}
              className={`px-3 py-1.5 text-sm border transition ${
                filter === o.k ? 'border-apex-red text-white bg-apex-red/15' : 'border-apex-border text-zinc-300 hover:text-white'
              }`}
            >
              {o.label}
            </button>
          ))}
          <div className="ml-auto text-sm text-zinc-400">显示 {filtered.length} / {data.rewards.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((r, i) => (
          <RewardCard key={`${r.level}-${r.tier}-${i}`} r={r} onImageClick={(rw) => setLightbox(rw)} />
        ))}
      </div>

      {lightbox && (
        <Lightbox
          src={lightbox.image.startsWith('/bp/tier-') ? lightbox.image : lightbox.image.replace('/bp/', '/bp/full/')}
          alt={lightbox.nameCN || lightbox.name}
          onClose={() => setLightbox(null)}
        />
      )}

      {showInfo && (
        <Lightbox
          src="/bp/tier-info.jpg"
          alt="通行证档位详细信息"
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
}
