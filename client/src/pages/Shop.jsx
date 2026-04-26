import { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingBag, Clock, Coins, Wrench, ChevronRight, ChevronLeft, X, Package, Gift, Percent, Palette, Sparkles } from 'lucide-react';
import { api } from '../api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Loader, ErrorBox } from '../components/Loader.jsx';

/* ── helpers ─────────────────────────────────────────── */

function useCountdown(startDate, durationDays) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    function calc() {
      const end = new Date(startDate).getTime() + durationDays * 86400000;
      const diff = end - Date.now();
      if (diff <= 0) { setRemaining('已结束'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${d}天${h}小时${m}分`);
    }
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [startDate, durationDays]);
  return remaining;
}

const RARITY_CLS = {
  mythic: 'rarity-mythic',
  legendary: 'rarity-legendary',
  epic: 'rarity-epic',
  rare: 'rarity-rare',
  common: 'rarity-common'
};

/* ── Milestone Detail Modal ──────────────────────────── */

const RARITY_LABEL = { legendary: '传说', epic: '史诗', rare: '稀有', common: '普通', mythic: '神话' };

function MilestoneModal({ data, onClose }) {
  const [visible, setVisible] = useState(false);
  const [hoveredReward, setHoveredReward] = useState(null);
  const [pinnedReward, setPinnedReward] = useState(null);
  const [page, setPage] = useState(0);
  const handleKey = useCallback((e) => { if (e.key === 'Escape') handleClose(); }, []);
  useEffect(() => { document.addEventListener('keydown', handleKey); return () => document.removeEventListener('keydown', handleKey); }, [handleKey]);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 400);
  }

  const d = data.detail;
  const previewItem = hoveredReward || pinnedReward;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-400 ease-out ${visible ? 'bg-black/85 backdrop-blur-sm' : 'bg-black/0'}`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-[1100px] max-h-[90vh] overflow-hidden rounded-xl bg-apex-panel border border-apex-border shadow-2xl transition-all duration-400 ease-out ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute top-4 right-4 text-white/60 hover:text-white transition z-10" onClick={handleClose}>
          <X size={24} />
        </button>

        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left panel – detail info / hover preview */}
          <div className="lg:w-[380px] shrink-0 border-b lg:border-b-0 lg:border-r border-apex-border flex flex-col bg-zinc-900/60 relative overflow-hidden">
            {/* Hover preview overlay */}
            <div className={`absolute inset-0 z-10 flex flex-col bg-zinc-900/95 transition-all duration-300 ${previewItem ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
              <div className="flex-1 flex items-center justify-center p-4">
                {previewItem && (
                  <img
                    key={previewItem.id}
                    src={previewItem.image.replace('/rewards/', '/rewards/full/')}
                    alt={previewItem.name}
                    className="max-w-full max-h-[50vh] object-contain rounded-lg animate-[fadeScale_0.25s_ease-out]"
                  />
                )}
              </div>
              {previewItem && (
                <div className="p-4 border-t border-apex-border space-y-1">
                  <div className="font-display text-lg text-white">{previewItem.name}</div>
                  <span className={`chip inline-flex text-xs ${RARITY_CLS[previewItem.rarity] || 'rarity-common'}`}>
                    {RARITY_LABEL[previewItem.rarity] || previewItem.rarity}
                  </span>
                </div>
              )}
            </div>

            {/* Default detail info */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Header */}
              <div className="flex items-start gap-3">
                {d.icon && <img src={d.icon} alt="" className="w-14 h-14 rounded-lg shrink-0" />}
                <div>
                  <div className="font-display text-xl text-white leading-tight">{d.title}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">{d.subtitle}</div>
                </div>
              </div>

              {/* Bundle contents + probabilities */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <div className="text-zinc-300 font-semibold">组合包内含</div>
                  {d.bundleContents.map((line, i) => (
                    <div key={i} className="text-zinc-400">{line}</div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <div className="text-zinc-300 font-semibold">各种物品概率</div>
                  {d.probabilities.map((p, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-zinc-400">{p.label}</span>
                      <span className="text-zinc-200">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bundle purchase options */}
              <div className="space-y-2">
                {d.bundles.map((b, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-800/50 rounded-lg p-2.5 border border-apex-border">
                    <div className="flex items-center gap-2">
                      {b.discount && <span className="chip bg-green-600/20 text-green-300 border border-green-500/40 text-[10px]">-{b.discount}%</span>}
                      <span className="text-sm text-white">{b.count} 个组合包</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {b.priceMaterials && (
                        <span className="flex items-center gap-1 text-zinc-300"><Wrench size={12} />{b.priceMaterials}</span>
                      )}
                      <span className="flex items-center gap-1 text-amber-300"><Coins size={12} />{b.priceCoins}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 min-w-0">
            {/* Milestone progress */}
            <div>
              <div className="text-sm text-zinc-300 font-semibold mb-3">里程碑进度</div>
              <div className="flex items-center gap-1 overflow-x-auto pb-2">
                {d.milestones.map((m, idx) => (
                  <div key={m.id} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-20 h-20 rounded-lg border border-apex-border bg-zinc-800/50 overflow-hidden">
                        {m.reward.image && (
                          <img src={m.reward.image} alt={m.reward.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 text-xs text-zinc-400">
                        <Package size={12} />{m.requiredPacks}
                      </div>
                    </div>
                    {idx < d.milestones.length - 1 && (
                      <div className="w-8 h-0.5 bg-zinc-700 mx-1 mt-[-18px]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">已收集的组合包池物品 <span className="text-zinc-200">{d.totalItems} 件</span></span>
              <div className="flex gap-3">
                {[
                  { r: 'mythic', label: '神话' },
                  { r: 'legendary', label: '传说' },
                  { r: 'epic', label: '史诗' }
                ].map(({ r, label }) => {
                  const count = d.rewards.filter(rw => rw.rarity === r).length;
                  return count > 0 ? (
                    <span key={r} className={`${RARITY_CLS[r] || ''} chip text-[10px]`}>0/{count} {label}</span>
                  ) : null;
                })}
              </div>
            </div>

            {/* Reward grid – paginated */}
            {(() => {
              const COLS = 8;
              const ROWS = 2;
              const featuredItem = d.rewards.find(r => r.featured);
              const normalItems = d.rewards.filter(r => !r.featured);
              // page 0: featured (takes 2 cols × 3 rows) + first (COLS-2)*ROWS normal items
              // page 1+: COLS*ROWS items per page
              const page0Count = (COLS - 3) * ROWS;
              const page1Items = normalItems.slice(page0Count);
              const laterPerPage = COLS * ROWS;
              const totalPages = 1 + Math.max(0, Math.ceil(page1Items.length / laterPerPage));

              function RewardCell({ rw }) {
                return (
                  <div
                    className={`relative aspect-[1/2] rounded-lg border overflow-hidden cursor-pointer hover:scale-[1.04] hover:shadow-lg transition-all duration-200 ${RARITY_CLS[rw.rarity] || 'rarity-common'} ${pinnedReward?.id === rw.id ? 'ring-2 ring-apex-red' : ''}`}
                    onMouseEnter={() => setHoveredReward(rw)}
                    onMouseLeave={() => setHoveredReward(null)}
                    onClick={() => setPinnedReward(pinnedReward?.id === rw.id ? null : rw)}
                  >
                    <img src={rw.image} alt={rw.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    {hoveredReward?.id === rw.id && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-sm p-1.5 text-center">
                        <div className="text-[11px] text-white leading-tight truncate">{rw.name}</div>
                        <div className={`text-[10px] ${RARITY_CLS[rw.rarity] ? 'text-inherit' : 'text-zinc-400'}`}>{RARITY_LABEL[rw.rarity] || rw.rarity}</div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <>
                  {page === 0 ? (
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)`, gridAutoFlow: 'column' }}>
                      {/* Featured hero item – spans 2 cols × full rows */}
                      {featuredItem && (
                        <div
                          className={`row-span-2 col-span-3 relative rounded-lg border overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-200 ${RARITY_CLS[featuredItem.rarity] || 'rarity-common'} ${pinnedReward?.id === featuredItem.id ? 'ring-2 ring-apex-red' : ''}`}
                          onMouseEnter={() => setHoveredReward(featuredItem)}
                          onMouseLeave={() => setHoveredReward(null)}
                          onClick={() => setPinnedReward(pinnedReward?.id === featuredItem.id ? null : featuredItem)}
                        >
                          <img src={featuredItem.image.replace('/rewards/', '/rewards/full/')} alt={featuredItem.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm rounded-lg p-2 max-w-[100px]">
                            <div className="text-xs text-white font-semibold leading-tight truncate">{featuredItem.name}</div>
                            <span className={`chip text-[10px] mt-1 ${RARITY_CLS[featuredItem.rarity] || ''}`}>{RARITY_LABEL[featuredItem.rarity] || featuredItem.rarity}</span>
                          </div>
                        </div>
                      )}
                      {/* Normal items */}
                      {normalItems.slice(0, page0Count).map((rw) => (
                        <RewardCell key={rw.id} rw={rw} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)`, gridAutoFlow: 'column' }}>
                      {page1Items.slice((page - 1) * laterPerPage, page * laterPerPage).map((rw) => (
                        <RewardCell key={rw.id} rw={rw} />
                      ))}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 pt-2">
                      <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="p-1.5 rounded-lg border border-apex-border hover:border-apex-red hover:text-white disabled:opacity-30 disabled:hover:border-apex-border transition"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`w-8 h-1.5 rounded-full transition ${i === page ? 'bg-apex-red' : 'bg-zinc-600 hover:bg-zinc-500'}`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page === totalPages - 1}
                        className="p-1.5 rounded-lg border border-apex-border hover:border-apex-red hover:text-white disabled:opacity-30 disabled:hover:border-apex-border transition"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </>
              );
            })()}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Double Strike Bundle Detail Modal ── */
function DoubleStrikeModal({ item, onClose }) {
  const [hovered, setHovered] = useState(0);
  const active = item.contents[hovered];

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-apex-panel border border-apex-border rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ maxWidth: 1440, maxHeight: '90vh', width: '95vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="absolute top-3 right-3 z-20 text-white/60 hover:text-white transition" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Left panel - info */}
        <div className="w-[420px] shrink-0 p-8 flex flex-col justify-between border-r border-apex-border/50">
          <div>
            {/* Title + separator */}
            <h2 className="font-display text-4xl text-white font-bold leading-tight tracking-wide">{item.name}</h2>
            <div className="h-[2px] bg-gradient-to-r from-zinc-400 to-transparent mt-3 mb-5" />

            {/* Sub-item icon grid */}
            <div className="flex gap-3">
              {item.contents.map((c, i) => {
                const borderColor = c.rarity === '史诗' ? 'border-purple-500' : 'border-amber-500';
                const activeShadow = c.rarity === '史诗' ? 'shadow-purple-500/30' : 'shadow-amber-500/30';
                return (
                  <div
                    key={c.id}
                    onMouseEnter={() => setHovered(i)}
                    className={`w-[72px] h-[72px] rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200 ${
                      i === hovered
                        ? `${borderColor} shadow-lg ${activeShadow} scale-105`
                        : `${borderColor}/60 hover:${borderColor}`
                    }`}
                  >
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom: price + buttons */}
          <div className="space-y-3">
            <div className="text-sm text-red-500 font-bold">金币不足</div>
            {/* Price bar */}
            <div className="flex items-center gap-4 bg-zinc-800/80 rounded-lg px-5 py-3 border border-zinc-600/50">
              <span className="text-white font-bold text-base">{item.discount}% 折扣</span>
              <span className="line-through text-zinc-500 text-base flex items-center gap-1"><Coins size={14} /> {item.originalPrice.toLocaleString()}</span>
              <span className="text-amber-300 font-bold text-base flex items-center gap-1"><Coins size={14} /> {item.salePrice.toLocaleString()}</span>
            </div>
            {/* Action buttons */}
            <div className="flex gap-3">
              <button className="flex-1 bg-zinc-700/60 hover:bg-zinc-600/60 border border-zinc-600/50 rounded-lg py-2.5 text-center text-sm text-zinc-300 transition">
                <div className="flex items-center justify-center gap-1.5"><Gift size={14} /> 赠礼</div>
                <div className="text-xs text-zinc-500 mt-0.5">需要登录验证</div>
              </button>
              <button className="flex-1 bg-amber-600/80 hover:bg-amber-500/80 border border-amber-500/50 rounded-lg py-2.5 text-center text-sm text-white font-semibold transition">
                获得 APEX 金币
              </button>
            </div>
            {/* ESC hint */}
            <div className="text-xs text-zinc-500 pt-1">
              <span className="chip bg-zinc-700/40 text-zinc-300 border-zinc-600/40 mr-2 text-[10px] px-1.5 py-0.5">ESC</span> 返回
            </div>
          </div>
        </div>

        {/* Right panel - large preview */}
        <div className="flex-1 relative flex items-center justify-center bg-zinc-900/50 overflow-hidden">
          <img
            key={active.id}
            src={active.image}
            alt={active.name}
            className="w-full h-full object-contain animate-[fadeScale_0.3s_ease-out]"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Main Shop Page ──────────────────────────────────── */

/* ── helpers ── */
function toFullImage(path) {
  const i = path.lastIndexOf('/');
  return path.slice(0, i) + '/full' + path.slice(i);
}

/* ── Lightbox ── */
function ShopLightbox({ src, alt, onClose }) {
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

/* ── Paginated row with side arrow buttons ── */
function ScrollRow({ children, itemsPerPage = 5 }) {
  const items = Array.isArray(children) ? children : [children];
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const [page, setPage] = useState(0);
  const pageItems = items.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="relative flex items-center gap-2">
      {totalPages > 1 && (
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="w-10 h-40 shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/60 border border-zinc-700/40 text-white/50 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600 transition-all disabled:opacity-20 disabled:hover:bg-zinc-900/60 disabled:hover:text-white/50 disabled:hover:border-zinc-700/40"
        >
          <ChevronLeft size={22} />
        </button>
      )}
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

/* ── Discount Shop Card (reused by double-strike, featured-bundle, premium) ── */
function DiscountShopCard({ item, onClick }) {
  return (
    <div className="card overflow-hidden hover:border-apex-red/60 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:shadow-apex-red/15 transition-all duration-200">
      <div className="aspect-[3/4] relative overflow-hidden bg-zinc-800/50 cursor-pointer" onClick={onClick}>
        {item.discount && (
          <span className="absolute top-2 left-2 z-10 chip bg-green-600/80 text-white border-0 text-xs font-bold">
            -{item.discount}%
          </span>
        )}
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      <div className="p-3 space-y-1">
        <div className="text-sm text-white leading-tight">{item.name}</div>
        <div className="flex items-center gap-2 text-xs mt-1">
          {item.originalPrice && (
            <span className="line-through text-zinc-500"><Coins size={11} className="inline" /> {item.originalPrice}</span>
          )}
          <span className="text-amber-300 font-semibold"><Coins size={11} className="inline" /> {item.salePrice}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Section header helper ── */
function ShopSectionHeader({ title, countdown }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-display text-2xl text-white">{title}</h2>
      <div className="flex items-center gap-1.5 text-sm text-zinc-400">
        <Clock size={14} /> 刷新：{countdown}
      </div>
    </div>
  );
}

export default function Shop() {
  const { data: msData, loading: msLoading, error: msError, reload: msReload } = useFetch(api.milestone, []);
  const { data: psData, loading: psLoading, error: psError, reload: psReload } = useFetch(api.premiumShop, []);
  const { data: dsData, loading: dsLoading, error: dsError, reload: dsReload } = useFetch(api.doubleStrike, []);
  const { data: fbData, loading: fbLoading, error: fbError, reload: fbReload } = useFetch(api.featuredBundle, []);
  const { data: rcData, loading: rcLoading, error: rcError, reload: rcReload } = useFetch(api.recolor, []);
  const { data: exData, loading: exLoading, error: exError, reload: exReload } = useFetch(api.exotic, []);
  const [showMilestone, setShowMilestone] = useState(false);
  const [exPage, setExPage] = useState(0);
  const [shopLightbox, setShopLightbox] = useState(null);
  const [dsDetail, setDsDetail] = useState(null);

  const msCountdown = useCountdown(msData?.startDate, msData?.durationDays);
  const psCountdown = useCountdown(psData?.startDate, psData?.durationDays);
  const dsCountdown = useCountdown(dsData?.startDate, dsData?.durationDays);
  const fbCountdown = useCountdown(fbData?.startDate, fbData?.durationDays);
  const rcCountdown = useCountdown(rcData?.startDate, rcData?.durationDays);
  const exCountdown = useCountdown(exData?.startDate, exData?.durationDays);

  if (msLoading || psLoading || dsLoading || fbLoading || rcLoading || exLoading) return <Loader />;

  return (
    <div className="space-y-8">
      {/* ── 里程碑收集 ── */}
      {msError ? (
        <ErrorBox error={msError} onRetry={msReload} />
      ) : msData && (
        <section className="space-y-3">
          <ShopSectionHeader title={msData.name} countdown={msCountdown} />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <div
              className="lg:col-span-2 card overflow-hidden cursor-pointer group hover:border-apex-red/60 transition-all duration-200"
              onClick={() => setShowMilestone(true)}
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={msData.banner}
                  alt={msData.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="font-display text-xl text-white">{msData.name}</div>
                  <div className="text-xs text-zinc-300 mt-1 flex items-center gap-1">
                    {msData.description} <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {msData.featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="card p-3 flex flex-col gap-2 hover:border-apex-red/60 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:shadow-apex-red/15 transition-all duration-200"
                >
                  <div className="aspect-square rounded-lg border border-apex-border overflow-hidden bg-zinc-800/50">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                  <div>
                    <div className="text-sm text-white leading-tight">{item.name}</div>
                    {item.legend && <div className="text-xs text-zinc-400">{item.legend}</div>}
                  </div>
                  <div className="flex items-center gap-3 text-xs mt-auto">
                    <span className="flex items-center gap-1 text-zinc-300"><Wrench size={12} />{item.priceMaterials}</span>
                    <span className="flex items-center gap-1 text-amber-300"><Coins size={12} />{item.priceCoins}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 双重击商店 ── */}
      {dsError ? (
        <ErrorBox error={dsError} onRetry={dsReload} />
      ) : dsData && (
        <section className="space-y-3">
          <ShopSectionHeader title={dsData.name} countdown={dsCountdown} />
          <ScrollRow>
            {dsData.items.map((item) => (
              <DiscountShopCard key={item.id} item={item} onClick={() => setDsDetail(item)} />
            ))}
          </ScrollRow>
        </section>
      )}

      {/* ── 高级射击商店 ── */}
      {psError ? (
        <ErrorBox error={psError} onRetry={psReload} />
      ) : psData && (
        <section className="space-y-3">
          <ShopSectionHeader title={psData.name} countdown={psCountdown} />
          <ScrollRow>
            {psData.items.map((item) => (
              <DiscountShopCard key={item.id} item={item} onClick={() => setShopLightbox({ src: toFullImage(item.image), alt: item.name })} />
            ))}
          </ScrollRow>
        </section>
      )}

      {/* ── 精选组合包商店 ── */}
      {fbError ? (
        <ErrorBox error={fbError} onRetry={fbReload} />
      ) : fbData && (
        <section className="space-y-3">
          <ShopSectionHeader title={fbData.name} countdown={fbCountdown} />
          <ScrollRow>
            {fbData.items.map((item) => (
              <DiscountShopCard key={item.id} item={item} onClick={() => setShopLightbox({ src: toFullImage(item.image), alt: item.name })} />
            ))}
          </ScrollRow>
        </section>
      )}

      {/* ── 改色 ── */}
      {rcError ? (
        <ErrorBox error={rcError} onRetry={rcReload} />
      ) : rcData && (
        <section className="space-y-3">
          <ShopSectionHeader title={rcData.name} countdown={rcCountdown} />
          <ScrollRow>
            {rcData.items.map((item) => (
              <div
                key={item.id}
                className="card overflow-hidden hover:border-apex-red/60 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:shadow-apex-red/15 transition-all duration-200"
              >
                <div className="aspect-[3/4] relative overflow-hidden bg-zinc-800/50 cursor-pointer" onClick={() => setShopLightbox({ src: toFullImage(item.image), alt: item.name })}>
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div className="p-3 space-y-1">
                  <div className="text-sm text-white leading-tight">{item.name}</div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    {item.priceMaterials && (
                      <span className="flex items-center gap-1 text-zinc-300"><Wrench size={11} /> {item.priceMaterials}</span>
                    )}
                    {item.priceTokens && (
                      <span className="flex items-center gap-1 text-amber-300"><Coins size={11} /> {item.priceTokens}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </ScrollRow>
        </section>
      )}

      {/* ── 奇异商店 ── */}
      {exError ? (
        <ErrorBox error={exError} onRetry={exReload} />
      ) : exData && (() => {
        const perPage = 6;
        const totalPages = Math.ceil(exData.items.length / perPage);
        return (
          <section className="space-y-3">
            <ShopSectionHeader title={exData.name} countdown={exCountdown} />
            <div className="flex items-center gap-2">
              {totalPages > 1 && (
                <button
                  onClick={() => setExPage(Math.max(0, exPage - 1))}
                  disabled={exPage === 0}
                  className="w-10 h-40 shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/60 border border-zinc-700/40 text-white/50 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600 transition-all disabled:opacity-20 disabled:hover:bg-zinc-900/60 disabled:hover:text-white/50 disabled:hover:border-zinc-700/40"
                >
                  <ChevronLeft size={22} />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <div className="grid grid-rows-2 gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridAutoFlow: 'column' }}>
                  {exData.items.slice(exPage * perPage, (exPage + 1) * perPage).map((item) => (
                    <div
                      key={item.id}
                      className="card overflow-hidden hover:border-apex-red/60 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-lg hover:shadow-apex-red/15 transition-all duration-200"
                    >
                      <div className="aspect-[5/2] relative overflow-hidden bg-zinc-800/50 cursor-pointer" onClick={() => setShopLightbox({ src: toFullImage(item.image), alt: item.name })}>
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setExPage(i)}
                        className={`h-1 rounded-full transition-all cursor-pointer ${i === exPage ? 'w-6 bg-red-500' : 'w-4 bg-zinc-600 hover:bg-zinc-500'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {totalPages > 1 && (
                <button
                  onClick={() => setExPage(Math.min(totalPages - 1, exPage + 1))}
                  disabled={exPage === totalPages - 1}
                  className="w-10 h-40 shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/60 border border-zinc-700/40 text-white/50 hover:text-white hover:bg-zinc-800/80 hover:border-zinc-600 transition-all disabled:opacity-20 disabled:hover:bg-zinc-900/60 disabled:hover:text-white/50 disabled:hover:border-zinc-700/40"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>
          </section>
        );
      })()}

      {/* ── Milestone Detail Modal ── */}
      {showMilestone && msData && (
        <MilestoneModal data={msData} onClose={() => setShowMilestone(false)} />
      )}

      {/* ── Double Strike Detail Modal ── */}
      {dsDetail && (
        <DoubleStrikeModal item={dsDetail} onClose={() => setDsDetail(null)} />
      )}

      {/* ── Shop Lightbox ── */}
      {shopLightbox && (
        <ShopLightbox src={shopLightbox.src} alt={shopLightbox.alt} onClose={() => setShopLightbox(null)} />
      )}
    </div>
  );
}
