import { useState } from 'react';
import { ChevronDown, Crosshair, Eye, Sparkles } from 'lucide-react';
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

/* ── Weapon data with skins ── */
const WEAPONS = [
  // 突击步枪
  { id: 'r301', name: 'R-301', category: 'ar', image: '/weapons/r301.png', skins: [] },
  { id: 'flatline', name: 'VK-47 Flatline', category: 'ar', image: '/weapons/flatline.png', skins: [] },
  { id: 'havoc', name: 'HAVOC', category: 'ar', image: '/weapons/havoc.png', skins: [] },
  { id: 'hemlok', name: 'Hemlok', category: 'ar', image: '/weapons/hemlok.png', skins: [] },
  { id: 'nemesis', name: 'Nemesis', category: 'ar', image: '/weapons/nemesis.png', skins: [] },
  // 冲锋枪
  { id: 'r99', name: 'R-99', category: 'smg', image: '/weapons/r99.png', skins: [] },
  { id: 'alternator', name: 'Alternator', category: 'smg', image: '/weapons/alternator.png', skins: [] },
  { id: 'car', name: 'C.A.R.', category: 'smg', image: '/weapons/car.png', skins: [] },
  { id: 'prowler', name: 'Prowler', category: 'smg', image: '/weapons/prowler.png', skins: [] },
  { id: 'volt', name: 'Volt', category: 'smg', image: '/weapons/volt.png', skins: [] },
  // 轻机枪
  { id: 'devotion', name: 'Devotion', category: 'lmg', image: '/weapons/devotion.png', skins: [] },
  { id: 'spitfire', name: 'Spitfire', category: 'lmg', image: '/weapons/spitfire.png', skins: [] },
  { id: 'rampage', name: 'Rampage', category: 'lmg', image: '/weapons/rampage.png', skins: [] },
  { id: 'lstar', name: 'L-STAR', category: 'lmg', image: '/weapons/lstar.png', skins: [] },
  // 射手步枪
  { id: 'g7', name: 'G7 Scout', category: 'marksman', image: '/weapons/g7.png', skins: [] },
  { id: '3030', name: '30-30', category: 'marksman', image: '/weapons/3030.png', skins: [] },
  { id: 'bocek', name: 'Bocek', category: 'marksman', image: '/weapons/bocek.png', skins: [] },
  { id: 'triple-take', name: 'Triple Take', category: 'marksman', image: '/weapons/triple-take.png', skins: [] },
  // 狙击枪
  { id: 'sentinel', name: 'Sentinel', category: 'sniper', image: '/weapons/sentinel.png', skins: [] },
  { id: 'longbow', name: 'Longbow', category: 'sniper', image: '/weapons/longbow.png', skins: [] },
  { id: 'charge-rifle', name: 'Charge Rifle', category: 'sniper', image: '/weapons/charge-rifle.png', skins: [] },
  { id: 'kraber', name: 'Kraber', category: 'sniper', image: '/weapons/kraber.png', skins: [] },
  // 霰弹枪
  { id: 'peacekeeper', name: 'Peacekeeper', category: 'shotgun', image: '/weapons/peacekeeper.png', skins: [] },
  { id: 'eva8', name: 'EVA-8', category: 'shotgun', image: '/weapons/eva8.png', skins: [] },
  { id: 'mastiff', name: 'Mastiff', category: 'shotgun', image: '/weapons/mastiff.png', skins: [] },
  { id: 'mozambique', name: 'Mozambique', category: 'shotgun', image: '/weapons/mozambique.png', skins: [] },
  // 手枪
  { id: 'wingman', name: 'Wingman', category: 'pistol', image: '/weapons/wingman.png', skins: [] },
  { id: 'p2020', name: 'P2020', category: 'pistol', image: '/weapons/p2020.png', skins: [] },
  { id: 're45', name: 'RE-45', category: 'pistol', image: '/weapons/re45.png', skins: [] },
];

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

/* ── Weapon Detail Panel ── */
function WeaponDetail({ weapon, onClose, onViewModel }) {
  if (!weapon) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-4xl mx-4 max-h-[85vh] overflow-y-auto bg-zinc-950 border border-white/10" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-black/60 border border-white/20 text-white hover:bg-red-500/40 transition">✕</button>

        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-red-950/30 to-zinc-950/60 border-b border-white/5">
          <div className="flex items-center gap-6">
            <img src={weapon.image} alt={weapon.name} className="h-20 object-contain drop-shadow-lg" />
            <div>
              <div className="text-[10px] tracking-[0.3em] text-red-400/80 font-bold uppercase">{CATEGORIES.find(c => c.id === weapon.category)?.label}</div>
              <h2 className="font-display text-3xl text-white mt-1">{weapon.name}</h2>
            </div>
          </div>
        </div>

        {/* Skins grid */}
        <div className="p-6">
          {weapon.skins.length > 0 ? (
            <>
              <div className="text-sm text-zinc-400 mb-4">精品皮肤 · {weapon.skins.length} 款</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {weapon.skins.map((skin) => (
                  <div
                    key={skin.id}
                    className="group/skin relative card !rounded-none overflow-hidden border-white/5 hover:border-red-500/30 cursor-pointer transition-all"
                    onClick={() => skin.model && onViewModel(skin)}
                  >
                    {skin.image && (
                      <div className="aspect-[16/10] bg-gradient-to-b from-zinc-800/60 to-zinc-900/80 flex items-center justify-center p-4">
                        <img src={skin.image} alt={skin.name} className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div className="p-2.5">
                      <div className="text-white text-xs font-bold">{skin.name}</div>
                      <div className="flex items-center justify-between mt-1">
                        {skin.rarity && <span className="text-red-400/80 text-[10px]">{skin.rarity}</span>}
                        {skin.model ? (
                          <span className="flex items-center gap-1 text-emerald-400 text-[10px]"><Eye size={10} />3D</span>
                        ) : (
                          <span className="text-zinc-600 text-[10px]">仅图片</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <Crosshair size={40} className="mx-auto text-zinc-700 mb-3" />
              <div className="text-zinc-500 text-sm">该武器精品皮肤正在收录中</div>
              <div className="text-zinc-600 text-xs mt-1">敬请期待</div>
            </div>
          )}
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
