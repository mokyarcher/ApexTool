import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Crosshair, Eye, Sparkles } from 'lucide-react';
import '@google/model-viewer/dist/model-viewer.min.js';

/* ── Weapon categories ── */
const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'ar', label: '突击步枪' },
  { id: 'smg', label: '冲锋枪' },
  { id: 'lmg', label: '轻机枪' },
  { id: 'marksman', label: '射手步枪' },
  { id: 'sniper', label: '狙击枪' },
  { id: 'shotgun', label: '霰弹枪' },
  { id: 'pistol', label: '手枪' },
];

/* ── Mock skins generator (placeholder for preview) ── */
const MOCK_RARITY = ['传说', '史诗', '传说', '史诗', '传说', '稀有', '传说', '史诗', '传说', '史诗', '传说', '稀有', '传说', '史诗', '传说'];
const MOCK_NAMES = ['暗影猎手', '极光风暴', '赤焰之怒', '冰晶裂变', '深渊领主', '战术迷彩', '血色黄昏', '量子裂隙', '幽灵协议', '烈焰凤凰', '午夜行动', '钢铁风暴', '猩红猎人', '星际航线', '霓虹狂潮'];
function mockSkins(weaponId, weaponImage, count = 15) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${weaponId}-skin-${i + 1}`,
    name: MOCK_NAMES[i % MOCK_NAMES.length],
    rarity: MOCK_RARITY[i % MOCK_RARITY.length],
    image: weaponImage,
    model: null,
  }));
}

/* ── Weapon data with skins ── */
const WEAPONS = [
  // 突击步枪
  { id: 'r301', name: 'R-301', category: 'ar', image: '/weapons/r301.png' },
  { id: 'flatline', name: 'VK-47 Flatline', category: 'ar', image: '/weapons/flatline.png' },
  { id: 'havoc', name: 'HAVOC', category: 'ar', image: '/weapons/havoc.png' },
  { id: 'hemlok', name: 'Hemlok', category: 'ar', image: '/weapons/hemlok.png' },
  { id: 'nemesis', name: 'Nemesis', category: 'ar', image: '/weapons/nemesis.png' },
  // 冲锋枪
  { id: 'r99', name: 'R-99', category: 'smg', image: '/weapons/r99.png' },
  { id: 'alternator', name: 'Alternator', category: 'smg', image: '/weapons/alternator.png' },
  { id: 'car', name: 'C.A.R.', category: 'smg', image: '/weapons/car.png' },
  { id: 'prowler', name: 'Prowler', category: 'smg', image: '/weapons/prowler.png' },
  { id: 'volt', name: 'Volt', category: 'smg', image: '/weapons/volt.png' },
  // 轻机枪
  { id: 'devotion', name: 'Devotion', category: 'lmg', image: '/weapons/devotion.png' },
  { id: 'spitfire', name: 'Spitfire', category: 'lmg', image: '/weapons/spitfire.png' },
  { id: 'rampage', name: 'Rampage', category: 'lmg', image: '/weapons/rampage.png' },
  { id: 'lstar', name: 'L-STAR', category: 'lmg', image: '/weapons/lstar.png' },
  // 射手步枪
  { id: 'g7', name: 'G7 Scout', category: 'marksman', image: '/weapons/g7.png' },
  { id: '3030', name: '30-30', category: 'marksman', image: '/weapons/3030.png' },
  { id: 'bocek', name: 'Bocek', category: 'marksman', image: '/weapons/bocek.png' },
  { id: 'triple-take', name: 'Triple Take', category: 'marksman', image: '/weapons/triple-take.png' },
  // 狙击枪
  { id: 'sentinel', name: 'Sentinel', category: 'sniper', image: '/weapons/sentinel.png' },
  { id: 'longbow', name: 'Longbow', category: 'sniper', image: '/weapons/longbow.png' },
  { id: 'charge-rifle', name: 'Charge Rifle', category: 'sniper', image: '/weapons/charge-rifle.png' },
  { id: 'kraber', name: 'Kraber', category: 'sniper', image: '/weapons/kraber.png' },
  // 霰弹枪
  { id: 'peacekeeper', name: 'Peacekeeper', category: 'shotgun', image: '/weapons/peacekeeper.png' },
  { id: 'eva8', name: 'EVA-8', category: 'shotgun', image: '/weapons/eva8.png' },
  { id: 'mastiff', name: 'Mastiff', category: 'shotgun', image: '/weapons/mastiff.png' },
  { id: 'mozambique', name: 'Mozambique', category: 'shotgun', image: '/weapons/mozambique.png' },
  // 手枪
  { id: 'wingman', name: 'Wingman', category: 'pistol', image: '/weapons/wingman.png' },
  { id: 'p2020', name: 'P2020', category: 'pistol', image: '/weapons/p2020.png' },
  { id: 're45', name: 'RE-45', category: 'pistol', image: '/weapons/re45.png' },
].map(w => ({ ...w, skins: mockSkins(w.id, w.image) }));

const SKINS_PER_PAGE = 4;

/* ── 3D Model Viewer Modal ── */
function ModelViewer({ skin, onClose }) {
  if (!skin) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-3xl aspect-square mx-4" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black/60 border border-white/20 text-white hover:bg-red-500/40 transition">✕</button>
        <model-viewer
          src={skin.model}
          alt={skin.name}
          auto-rotate
          camera-controls
          shadow-intensity="1"
          style={{ width: '100%', height: '100%', background: 'radial-gradient(circle, #1a1a2e 0%, #0a0a0a 100%)' }}
        />
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-white font-display text-xl">{skin.name}</div>
          {skin.rarity && <div className="text-red-400 text-xs mt-1">{skin.rarity}</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Weapon Card ── */
function WeaponCard({ weapon, onSelect }) {
  const skinCount = weapon.skins.length;
  return (
    <div
      className="group relative card !rounded-none overflow-hidden border-white/5 hover:border-red-500/40 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/15 transition-all duration-300 cursor-pointer"
      onClick={() => onSelect(weapon)}
    >
      <div className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100" />
      <div className="aspect-[16/9] relative overflow-hidden bg-gradient-to-b from-zinc-800/60 to-zinc-900/80 flex items-center justify-center p-6">
        <img
          src={weapon.image}
          alt={weapon.name}
          className="max-w-full max-h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_8px_20px_rgba(239,68,68,0.2)]"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      <div className="p-3 bg-zinc-950/60">
        <div className="text-white font-bold text-sm">{weapon.name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-zinc-500 text-xs">{CATEGORIES.find(c => c.id === weapon.category)?.label}</span>
          {skinCount > 0 ? (
            <span className="flex items-center gap-1 text-red-400 text-xs"><Sparkles size={10} />{skinCount} 精品皮肤</span>
          ) : (
            <span className="text-zinc-600 text-xs">即将收录</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Skin Card (横幅卡片) ── */
function SkinCard({ skin, onClick }) {
  return (
    <div
      className="group/skin relative flex-1 min-w-0 card !rounded-none overflow-hidden border-white/5 hover:border-2 hover:border-red-400 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="pointer-events-none absolute inset-0 z-10 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-700 group-hover/skin:translate-x-full group-hover/skin:opacity-100" />
      <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-b from-zinc-800/60 to-zinc-900/80 flex items-center justify-center p-5">
        <img
          src={skin.image}
          alt={skin.name}
          className="max-w-full max-h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition duration-500 group-hover/skin:scale-110 group-hover/skin:brightness-110"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      </div>
      <div className="p-2.5 bg-zinc-950/60">
        <div className="text-white text-xs font-bold truncate">{skin.name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-red-400/80 text-[10px]">{skin.rarity}</span>
          {skin.model ? (
            <span className="flex items-center gap-1 text-emerald-400 text-[10px]"><Eye size={10} />3D</span>
          ) : (
            <span className="text-zinc-600 text-[10px]">预览</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Weapon Detail Panel (横幅翻页) ── */
function WeaponDetail({ weapon, onClose, onViewModel }) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (!weapon) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goTo(Math.max(0, page - 1));
      if (e.key === 'ArrowRight') goTo(Math.min(Math.ceil(weapon.skins.length / SKINS_PER_PAGE) - 1, page + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (!weapon) return null;

  const skins = weapon.skins;
  const totalPages = Math.ceil(skins.length / SKINS_PER_PAGE);
  const pageItems = skins.slice(page * SKINS_PER_PAGE, (page + 1) * SKINS_PER_PAGE);

  function goTo(p) {
    if (p === page) return;
    setDirection(p > page ? 1 : -1);
    setPage(p);
    setAnimKey((k) => k + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-6xl mx-4 bg-zinc-950 border border-white/10" onClick={(e) => e.stopPropagation()}>
        {/* Top accent line */}
        <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

        {/* Header */}
        <div className="relative p-5 bg-gradient-to-r from-red-950/30 to-zinc-950/60 border-b border-white/5">
          <button onClick={onClose} className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-white bg-black/40 border border-white/10 hover:border-white/30 transition">
            <span className="px-1.5 py-0.5 text-[10px] bg-white/10 border border-white/20">ESC</span> 返回
          </button>
          <div className="flex items-center gap-5">
            <img src={weapon.image} alt={weapon.name} className="h-16 object-contain drop-shadow-lg" />
            <div>
              <div className="text-[10px] tracking-[0.3em] text-red-400/80 font-bold uppercase">{CATEGORIES.find(c => c.id === weapon.category)?.label}</div>
              <h2 className="font-display text-2xl text-white mt-1">{weapon.name}</h2>
            </div>
            <div className="ml-auto flex items-center gap-3 text-sm">
              <span className="px-2.5 py-1 bg-white/5 border border-white/10 text-zinc-400 text-xs">{skins.length} 款皮肤</span>
            </div>
          </div>
        </div>

        {/* Skin row with pagination */}
        <div className="p-5">
          <div className="relative flex items-center gap-3">
            {/* Left arrow */}
            {totalPages > 1 && (
              <button
                onClick={() => goTo(Math.max(0, page - 1))}
                disabled={page === 0}
                className="w-11 h-44 shrink-0 flex items-center justify-center bg-black/35 border border-red-500/20 text-white/45 hover:text-white hover:bg-red-950/40 hover:border-red-500/55 hover:shadow-lg hover:shadow-red-500/10 transition-all disabled:opacity-20 disabled:hover:bg-black/35 disabled:hover:text-white/45 disabled:hover:border-red-500/20"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            {/* Cards */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div
                key={animKey}
                className="grid gap-4 p-3 animate-page-slide"
                style={{
                  gridTemplateColumns: `repeat(${SKINS_PER_PAGE}, 1fr)`,
                  '--slide-from': direction >= 0 ? '60px' : '-60px',
                }}
              >
                {pageItems.map((skin) => (
                  <SkinCard
                    key={skin.id}
                    skin={skin}
                    onClick={() => skin.model ? onViewModel(skin) : null}
                  />
                ))}
              </div>

              {/* Page indicators */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <div
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${i === page ? 'w-8 bg-red-500 shadow shadow-red-500/40' : 'w-4 bg-zinc-700 hover:bg-zinc-500'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right arrow */}
            {totalPages > 1 && (
              <button
                onClick={() => goTo(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
                className="w-11 h-44 shrink-0 flex items-center justify-center bg-black/35 border border-red-500/20 text-white/45 hover:text-white hover:bg-red-950/40 hover:border-red-500/55 hover:shadow-lg hover:shadow-red-500/10 transition-all disabled:opacity-20 disabled:hover:bg-black/35 disabled:hover:text-white/45 disabled:hover:border-red-500/20"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function WeaponSkins() {
  const [category, setCategory] = useState('all');
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [viewingSkin, setViewingSkin] = useState(null);

  const filtered = category === 'all' ? WEAPONS : WEAPONS.filter(w => w.category === category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-5 border-red-500/20 bg-gradient-to-r from-red-950/20 to-zinc-950/60">
        <div className="flex items-center gap-2 text-red-300 text-sm mb-2">
          <Crosshair size={16} /> 枪械图鉴
        </div>
        <h1 className="font-display text-3xl text-white">精品枪械皮肤</h1>
        <p className="text-zinc-400 text-sm mt-1">
          收录精品武器皮肤 · 支持 3D 模型预览 · 持续更新中
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-1.5 text-sm transition-all ${
              category === cat.id
                ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                : 'bg-zinc-900/60 border border-white/5 text-zinc-400 hover:text-white hover:border-white/20'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Weapon grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((weapon) => (
          <WeaponCard key={weapon.id} weapon={weapon} onSelect={setSelectedWeapon} />
        ))}
      </div>

      {/* Weapon detail modal */}
      {selectedWeapon && (
        <WeaponDetail
          weapon={selectedWeapon}
          onClose={() => setSelectedWeapon(null)}
          onViewModel={(skin) => { setSelectedWeapon(null); setViewingSkin(skin); }}
        />
      )}

      {/* 3D Model viewer modal */}
      {viewingSkin && (
        <ModelViewer skin={viewingSkin} onClose={() => setViewingSkin(null)} />
      )}
    </div>
  );
}
