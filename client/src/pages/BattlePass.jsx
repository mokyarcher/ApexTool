import { useMemo, useState, useEffect, useCallback } from 'react';
import { Star, Lock, Gift, Package, Sparkles, Coins, Wrench, Crown, Zap, ShieldCheck, X, Info } from 'lucide-react';
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
      <button className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10" onClick={handleClose}><X size={28} /></button>
      <img
        src={src}
        alt={alt}
        className={`max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-all duration-400 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function RewardCard({ r, onImageClick }) {
  const Icon = typeIcon[r.type] || Gift;
  const rarity = r.rarity || 'common';
  return (
    <div className="card p-3 flex flex-col gap-2 hover:border-apex-red/60 hover:scale-[1.04] hover:-translate-y-1 hover:shadow-lg hover:shadow-apex-red/15 transition-all duration-200 ease-out">
      <div className="flex items-center justify-between">
        <span className="font-display text-xl text-white">Lv.{r.level}</span>
        {(() => { const t = TIER_META[r.tier] || TIER_META.free; const TIcon = t.icon; return (
          <span className={`chip ${t.cls}`}><TIcon size={12} /> {t.label}</span>
        ); })()}
      </div>
      <div
        className={`aspect-square rounded-lg border flex items-center justify-center overflow-hidden rarity-${rarity} ${r.image ? 'cursor-pointer' : ''}`}
        onClick={() => r.image && onImageClick(r)}
      >
        {r.image ? (
          <img
            src={r.image}
            alt={r.nameCN || r.name}
            className="w-full h-full object-contain p-2"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
          />
        ) : null}
        <Icon size={40} style={{ display: r.image ? 'none' : 'block' }} />
      </div>
      <div>
        <div className="text-sm text-white leading-tight">{(r.nameCN || r.name)}{r.amount ? ` ×${r.amount}` : ''}</div>
        <div className="flex gap-1 mt-1 flex-wrap">
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

  const filtered = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data.rewards;
    return data.rewards.filter((r) => r.tier === filter);
  }, [data, filter]);

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <section className="card p-6 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <div className="text-zinc-400 text-sm">Season {data.season} · {data.splitId}</div>
          <h1 className="font-display text-4xl md:text-5xl text-white leading-none mt-1">{data.name}</h1>
          <p className="text-zinc-400 mt-2 max-w-xl">{data.description}</p>
          <div className="flex gap-2 mt-3 text-sm flex-wrap items-center">
            <span className="chip bg-zinc-700/40 text-zinc-200 border border-zinc-600/40"><Lock size={14} />免费</span>
            <span className="chip rarity-legendary"><Star size={14} />高级 {data.pricePremium} 币</span>
            <span className="chip bg-purple-600/25 text-purple-200 border border-purple-500/50"><ShieldCheck size={14} />终极 ¥{(data.priceUltimate / 100).toFixed(0)}</span>
            <span className="chip bg-amber-500/25 text-amber-200 border border-amber-500/50"><Crown size={14} />终极+ ¥{(data.priceUltimatePlus / 100).toFixed(0)}</span>
            <button onClick={() => setShowInfo(true)} className="chip bg-sky-600/20 text-sky-200 border border-sky-500/40 hover:bg-sky-600/30 transition cursor-pointer"><Info size={14} />详细信息</button>
          </div>
        </div>
        <div className="text-right text-xs text-zinc-400">
          <div>开始: {data.startDate}</div>
          <div>结束: {data.endDate}</div>
          <div className="mt-1">共 {data.rewards.length} 项奖励</div>
        </div>
      </section>

      <div className="flex items-center gap-2">
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
            className={`px-3 py-1.5 rounded-lg text-sm border transition ${
              filter === o.k ? 'border-apex-red text-white bg-apex-red/15' : 'border-apex-border text-zinc-300 hover:text-white'
            }`}
          >
            {o.label}
          </button>
        ))}
        <div className="ml-auto text-sm text-zinc-400">显示 {filtered.length} / {data.rewards.length}</div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((r, i) => (
          <RewardCard key={`${r.level}-${r.tier}-${i}`} r={r} onImageClick={(rw) => setLightbox(rw)} />
        ))}
      </div>

      {lightbox && (
        <Lightbox
          src={lightbox.image.replace('/bp/', '/bp/full/')}
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
