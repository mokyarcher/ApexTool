import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Flame, Sparkles, X, RotateCcw } from 'lucide-react';
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

/* ── Paginated horizontal scroll with page indicators ── */
function PagedRow({ children, itemsPerPage = 5 }) {
  const items = Array.isArray(children) ? children : [children];
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const [page, setPage] = useState(0);
  const pageItems = items.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div>
      {/* Page indicators + arrows */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mb-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${i === page ? 'w-6 bg-red-500' : 'w-4 bg-zinc-600'}`}
              />
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-30"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
      {/* Cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${itemsPerPage}, 1fr)` }}>
        {pageItems}
      </div>
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
        {/* Badge icons on right */}
        {item.badges && item.badges.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-col gap-1.5">
            {item.badges.map((b, i) => (
              <div key={i} className="w-10 h-10 rounded border border-red-600/50 bg-black/50 overflow-hidden">
                <img src={b} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 space-y-1">
        <div className="text-sm text-red-400 font-semibold leading-tight">{item.name}</div>
        <div className="text-xs text-zinc-400">{item.legend}</div>
        <div className="flex items-center gap-1 text-sm font-bold text-red-400 mt-1">
          <ShardIcon size={13} /> {item.price}
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
      <div className="p-3 space-y-1">
        <div className="text-sm text-red-400 font-semibold">{item.name}</div>
        <div className="text-xs text-zinc-500">{item.type}</div>
        <div className="text-xs text-zinc-400 mt-1">已拥有 {item.owned}/{item.total} 件物品</div>
      </div>
    </div>
  );
}

/* ── 3D Model Viewer Modal ── */
function ModelViewer3D({ item, onClose }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('download'); // 'download' | 'processing' | 'done'
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
    el.addEventListener('progress', onProgress);
    el.addEventListener('load', onLoad);
    return () => {
      clearTimeout(stallTimer.current);
      el.removeEventListener('progress', onProgress);
      el.removeEventListener('load', onLoad);
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
          <div className="text-sm text-zinc-400 mt-1">{item.legend} · 传家宝</div>
          <div className="flex items-center gap-1 text-red-400 font-bold mt-2"><ShardIcon size={16} /> {item.price}</div>
        </div>
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-3">
            {phase === 'download' ? (
              <>
                <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm text-zinc-400">下载模型 {progress}%</span>
              </>
            ) : (
              <>
                <div className="w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full animate-pulse" style={{ width: '100%' }} />
                </div>
                <span className="text-sm text-zinc-400 animate-pulse">处理模型中…</span>
              </>
            )}
          </div>
        )}
        {/* Drag hint */}
        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 text-zinc-500 text-sm transition-opacity duration-300 ${!isLoading ? 'opacity-100' : 'opacity-0'}`}>
          <RotateCcw size={14} /> 拖拽旋转 · 滚轮缩放
        </div>
        {/* model-viewer */}
        <model-viewer
          ref={mvRef}
          src={item.model}
          poster={item.image}
          alt={item.name}
          camera-controls
          auto-rotate
          shadow-intensity="1.5"
          exposure="1.2"
          tone-mapping="commerce"
          style={{ width: '100%', height: '100%', borderRadius: '16px', background: 'radial-gradient(ellipse at center, #1a0a0a 0%, #0a0a0a 100%)' }}
        />
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
              <PrestigeCard key={item.id} item={item} onClick={() => openLightbox(item.image, item.name)} />
            ))}
          </PagedRow>
        </section>
      )}

      {/* ── APEX 神器 ── */}
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

      {/* ── 通用近战 ── */}
      {universalMelee && (
        <section>
          <MythicSectionHeader title={universalMelee.name} shards={universalMelee.currency.shards} tokens={universalMelee.currency.tokens} />
          <PagedRow itemsPerPage={3}>
            {universalMelee.items.map((item) => (
              <SetCard key={item.id} item={item} onClick={() => openLightbox(item.image, item.name)} />
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
