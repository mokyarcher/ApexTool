import { useState, useRef, useCallback } from 'react';
import { BookOpen, Swords, Shield, Zap, Clock, ChevronDown, ChevronUp, Crosshair, Target, Gauge, GitCompareArrows, X } from 'lucide-react';
import { api } from '../api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Loader, ErrorBox } from '../components/Loader.jsx';

const ROLE_STYLE = {
  '突击手':  { cls: 'bg-red-500/20 text-red-300 border-red-500/40',    icon: Swords },
  '空袭手':  { cls: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: Zap },
  '侦察兵':  { cls: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', icon: Target },
  '支援':    { cls: 'bg-green-500/20 text-green-300 border-green-500/40', icon: Shield },
  '控场手':  { cls: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: Crosshair },
};

const AMMO_STYLE = {
  '轻型弹药': 'bg-orange-500/20 text-orange-300',
  '重型弹药': 'bg-green-500/20 text-green-300',
  '能量弹药': 'bg-emerald-500/20 text-emerald-300',
  '狙击弹药': 'bg-blue-500/20 text-blue-300',
  '霰弹弹药': 'bg-red-500/20 text-red-300',
  '箭矢':     'bg-purple-500/20 text-purple-300',
};

function AbilityCard({ ability, type }) {
  const typeLabel = type === 'passive' ? '被动' : type === 'tactical' ? '战术' : '终极';
  const typeColor = type === 'passive' ? 'text-gray-400' : type === 'tactical' ? 'text-cyan-400' : 'text-amber-400';
  const typeBg = type === 'passive' ? 'bg-gray-500/10 border-gray-500/20' : type === 'tactical' ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-amber-500/10 border-amber-500/20';

  return (
    <div className={`border p-4 ${typeBg}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 ${type === 'passive' ? 'bg-gray-500/20' : type === 'tactical' ? 'bg-cyan-500/20' : 'bg-amber-500/20'}`}>
          {typeLabel}
        </span>
        <span className={`font-bold ${typeColor}`}>{ability.name}</span>
        <span className="text-xs text-zinc-500">{ability.nameEN}</span>
      </div>
      <p className="text-sm text-zinc-300 mb-2">{ability.description}</p>
      <p className="text-xs text-zinc-500 leading-relaxed">{ability.details}</p>
      <div className="flex gap-4 mt-3 text-xs text-zinc-400">
        {ability.cooldown != null && (
          <span className="flex items-center gap-1">
            <Clock size={12} /> CD: {ability.cooldown}s
          </span>
        )}
        {ability.duration != null && (
          <span className="flex items-center gap-1">
            <Gauge size={12} /> 持续: {ability.duration}s
          </span>
        )}
        {ability.damage != null && (
          <span className="flex items-center gap-1">
            <Crosshair size={12} /> 伤害: {ability.damage}
          </span>
        )}
        {ability.charges != null && (
          <span>储备: {ability.charges}</span>
        )}
        {ability.healPerSecond != null && (
          <span>回复: {ability.healPerSecond}/s</span>
        )}
      </div>
    </div>
  );
}

function LegendCard({ legend }) {
  const [expanded, setExpanded] = useState(false);
  const role = ROLE_STYLE[legend.role] || ROLE_STYLE['突击手'];
  const RoleIcon = role.icon;

  return (
    <div className="border border-white/[0.06] bg-black/40 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors text-left"
      >
        <div className="w-14 h-14 bg-zinc-800 flex-shrink-0 overflow-hidden">
          <img
            src={legend.image.replace('.jpg', '.png')}
            alt={legend.name}
            className="w-full h-full object-cover object-top"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-lg">{legend.name}</span>
            <span className="text-xs text-zinc-500">{legend.nameEN}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 border ${role.cls} flex items-center gap-1`}>
              <RoleIcon size={11} /> {legend.role}
            </span>
            <span className="text-xs text-zinc-500 truncate">{legend.description}</span>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/[0.06] pt-3">
          <AbilityCard ability={legend.passive} type="passive" />
          <AbilityCard ability={legend.tactical} type="tactical" />
          <AbilityCard ability={legend.ultimate} type="ultimate" />
        </div>
      )}
    </div>
  );
}

function WeaponCompare({ weapons }) {
  const [pickA, setPickA] = useState(null);
  const [pickB, setPickB] = useState(null);
  const [search, setSearch] = useState('');
  const [picking, setPicking] = useState(null); // 'A' | 'B' | null

  const filtered = weapons.filter(w =>
    !search || w.name.includes(search) || w.nameEN.toLowerCase().includes(search.toLowerCase())
  );

  const weaponA = weapons.find(w => w.id === pickA);
  const weaponB = weapons.find(w => w.id === pickB);

  const stats = [
    { key: 'bodyDamage', label: '身体伤害', higher: true },
    { key: 'headDamage', label: '爆头伤害', higher: true },
    { key: 'legDamage', label: '腿部伤害', higher: true },
    { key: 'rpm', label: '射速 (RPM)', higher: true },
    { key: 'dps', label: 'DPS', higher: true },
  ];

  const magStats = [
    { key: 'base', label: '基础弹匣' },
    { key: 'purple', label: '紫色弹匣' },
  ];

  const reloadStats = [
    { key: 'tactical', label: '战术换弹' },
    { key: 'full', label: '完整换弹' },
  ];

  function valColor(a, b, higherBetter) {
    if (a == null || b == null || a === b) return 'text-white';
    const aWins = higherBetter ? a > b : a < b;
    return aWins ? 'text-emerald-400' : 'text-zinc-500';
  }

  function PickerSlot({ side, weapon, onClear }) {
    return (
      <div
        onClick={() => { if (!weapon) setPicking(side); }}
        className={`flex-1 border p-4 min-h-[100px] flex flex-col items-center justify-center cursor-pointer transition-all ${
          picking === side
            ? 'border-red-500/50 bg-red-500/5'
            : weapon
              ? 'border-white/[0.08] bg-white/[0.02]'
              : 'border-dashed border-white/[0.1] hover:border-white/20 hover:bg-white/[0.02]'
        }`}
      >
        {weapon ? (
          <div className="text-center relative w-full">
            <button
              onClick={e => { e.stopPropagation(); onClear(); }}
              className="absolute top-0 right-0 text-zinc-600 hover:text-red-400 transition"
            >
              <X size={14} />
            </button>
            <div className="font-bold text-white">{weapon.name}</div>
            <div className="text-xs text-zinc-500">{weapon.nameEN}</div>
            <div className={`text-xs mt-1 px-2 py-0.5 inline-block ${AMMO_STYLE[weapon.ammoType] || 'bg-zinc-500/20 text-zinc-300'}`}>
              {weapon.ammoType}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-zinc-500 text-sm">点击选择武器 {side}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Picker */}
      <div className="flex gap-3 items-stretch">
        <PickerSlot side="A" weapon={weaponA} onClear={() => setPickA(null)} />
        <div className="flex items-center">
          <GitCompareArrows size={20} className="text-zinc-600" />
        </div>
        <PickerSlot side="B" weapon={weaponB} onClear={() => setPickB(null)} />
      </div>

      {/* Weapon selector dropdown */}
      {picking && (
        <div className="border border-white/[0.08] bg-zinc-900/95 backdrop-blur-sm p-3 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">选择武器 {picking}</span>
            <button onClick={() => setPicking(null)} className="text-zinc-500 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <input
            type="text"
            placeholder="搜索武器..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-800/50 border border-white/[0.06] px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500/40"
            autoFocus
          />
          <div className="max-h-60 overflow-y-auto space-y-0.5">
            {filtered.map(w => {
              const disabled = (picking === 'A' && w.id === pickB) || (picking === 'B' && w.id === pickA);
              return (
                <button
                  key={w.id}
                  disabled={disabled}
                  onClick={() => {
                    if (picking === 'A') setPickA(w.id);
                    else setPickB(w.id);
                    setPicking(null);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 transition ${
                    disabled
                      ? 'text-zinc-600 cursor-not-allowed'
                      : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                  }`}
                >
                  <span className="font-medium">{w.name}</span>
                  <span className="text-xs text-zinc-600">{w.nameEN}</span>
                  <span className={`text-xs ml-auto px-1.5 py-0.5 ${AMMO_STYLE[w.ammoType] || ''}`}>{w.ammoType}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison table */}
      {weaponA && weaponB && (
        <div className="border border-white/[0.06] bg-black/40 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-zinc-500 font-normal px-4 py-2.5 w-1/3">数据项</th>
                <th className="text-center text-zinc-300 font-medium px-4 py-2.5 w-1/3">{weaponA.name}</th>
                <th className="text-center text-zinc-300 font-medium px-4 py-2.5 w-1/3">{weaponB.name}</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(({ key, label, higher }) => (
                <tr key={key} className="border-b border-white/[0.04]">
                  <td className="text-zinc-400 px-4 py-2">{label}</td>
                  <td className={`text-center px-4 py-2 font-mono ${valColor(weaponA[key], weaponB[key], higher)}`}>
                    {weaponA[key] ?? '-'}
                  </td>
                  <td className={`text-center px-4 py-2 font-mono ${valColor(weaponB[key], weaponA[key], higher)}`}>
                    {weaponB[key] ?? '-'}
                  </td>
                </tr>
              ))}
              {magStats.map(({ key, label }) => (
                <tr key={`mag-${key}`} className="border-b border-white/[0.04]">
                  <td className="text-zinc-400 px-4 py-2">{label}</td>
                  <td className={`text-center px-4 py-2 font-mono ${valColor(weaponA.magSize?.[key], weaponB.magSize?.[key], true)}`}>
                    {weaponA.magSize?.[key] ?? '-'}
                  </td>
                  <td className={`text-center px-4 py-2 font-mono ${valColor(weaponB.magSize?.[key], weaponA.magSize?.[key], true)}`}>
                    {weaponB.magSize?.[key] ?? '-'}
                  </td>
                </tr>
              ))}
              {reloadStats.map(({ key, label }) => (
                <tr key={`reload-${key}`} className="border-b border-white/[0.04]">
                  <td className="text-zinc-400 px-4 py-2">{label}</td>
                  <td className={`text-center px-4 py-2 font-mono ${valColor(weaponA.reloadTime?.[key], weaponB.reloadTime?.[key], false)}`}>
                    {weaponA.reloadTime?.[key] != null ? `${weaponA.reloadTime[key]}s` : '-'}
                  </td>
                  <td className={`text-center px-4 py-2 font-mono ${valColor(weaponB.reloadTime?.[key], weaponA.reloadTime?.[key], false)}`}>
                    {weaponB.reloadTime?.[key] != null ? `${weaponB.reloadTime[key]}s` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Description */}
          <div className="grid grid-cols-2 gap-3 p-4 border-t border-white/[0.06]">
            <div className="text-xs text-zinc-500 leading-relaxed">{weaponA.description}</div>
            <div className="text-xs text-zinc-500 leading-relaxed">{weaponB.description}</div>
          </div>
        </div>
      )}

      {(!weaponA || !weaponB) && !picking && (
        <div className="text-center text-zinc-600 py-12 text-sm">选择两把武器开始对比</div>
      )}
    </div>
  );
}

/* ── Floating Weapon Detail Popover ── */
function WeaponPopover({ weapon, anchor }) {
  const popRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, side: 'right' });

  // Calculate position whenever weapon/anchor changes
  const updatePos = useCallback(() => {
    if (!anchor || !popRef.current) return;
    const popH = popRef.current.offsetHeight;
    const popW = popRef.current.offsetWidth;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 12;

    // Prefer right side; if not enough space, show on left
    let left, side;
    if (anchor.right + gap + popW + 8 < vw) {
      left = anchor.right + gap;
      side = 'right';
    } else {
      left = anchor.left - popW - gap;
      side = 'left';
    }

    // Vertically center on the card, clamp to viewport
    let top = anchor.top + anchor.height / 2 - popH / 2;
    top = Math.max(8, Math.min(top, vh - popH - 8));

    setPos({ top, left, side });
  }, [anchor]);

  // Recalc on mount and when anchor changes
  useRef(null); // force fresh ref
  if (popRef.current) updatePos();

  if (!weapon || !anchor) return null;

  const ammoStyle = AMMO_STYLE[weapon.ammoType] || 'bg-zinc-500/20 text-zinc-300';
  const tierColors = { S: 'text-red-400 bg-red-500/15 border-red-500/40', A: 'text-amber-400 bg-amber-500/15 border-amber-500/40', B: 'text-blue-400 bg-blue-500/15 border-blue-500/40', C: 'text-zinc-400 bg-zinc-500/15 border-zinc-500/40' };
  const tierStyle = tierColors[weapon.tips?.tier] || tierColors.B;

  return (
    <div
      ref={el => { popRef.current = el; if (el) updatePos(); }}
      className="fixed z-50 w-[320px] border border-white/[0.08] bg-zinc-950/95 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden animate-fade-in pointer-events-none"
      style={{ top: pos.top, left: pos.left, maxHeight: 'calc(100vh - 16px)' }}
    >
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

      {/* Header */}
      <div className="p-4 pb-3 bg-gradient-to-b from-zinc-900/60 to-transparent">
        <div className="flex items-start gap-3">
          <div className="w-20 h-14 bg-zinc-900/80 flex-shrink-0 flex items-center justify-center border border-white/[0.05]">
            <img src={weapon.image} alt={weapon.name} className="w-full h-full object-contain p-1" onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-base leading-tight">{weapon.name}</div>
            <div className="text-[11px] text-zinc-500">{weapon.nameEN}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 ${ammoStyle}`}>{weapon.ammoType}</span>
              {weapon.tips?.tier && <span className={`text-[10px] px-1.5 py-0.5 font-bold border ${tierStyle}`}>Tier {weapon.tips.tier}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Core stats */}
      <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-t border-b border-white/[0.06]">
        {[
          { label: '身体', value: weapon.bodyDamage, color: 'text-white' },
          { label: '爆头', value: weapon.headDamage, color: 'text-red-400' },
          { label: '腿部', value: weapon.legDamage, color: 'text-zinc-400' },
          { label: '射速', value: weapon.rpm, color: 'text-amber-400' },
          { label: 'DPS', value: weapon.dps, color: 'text-emerald-400' },
          { label: '换弹', value: weapon.reloadTime?.tactical != null ? `${weapon.reloadTime.tactical}s` : '-', color: 'text-blue-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-950 px-3 py-2 text-center">
            <div className="text-[10px] text-zinc-500">{label}</div>
            <div className={`font-mono font-bold text-sm ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Mag size */}
      <div className="px-4 py-2.5 border-b border-white/[0.06]">
        <div className="text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">弹匣容量</div>
        {weapon.magSize?.base != null ? (
          <div className="flex items-center gap-2">
            {[
              { label: '基础', value: weapon.magSize.base, color: 'bg-zinc-500' },
              { label: '白', value: weapon.magSize.white, color: 'bg-zinc-300' },
              { label: '蓝', value: weapon.magSize.blue, color: 'bg-blue-400' },
              { label: '紫', value: weapon.magSize.purple, color: 'bg-purple-400' },
            ].filter(m => m.value != null).map(m => (
              <div key={m.label} className="flex-1 text-center">
                <div className="h-1.5 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className={`h-full rounded-full ${m.color}`} style={{ width: `${Math.min(100, (m.value / 50) * 100)}%` }} />
                </div>
                <div className="text-[10px] text-zinc-500">{m.label}</div>
                <div className="text-xs font-mono text-zinc-200">{m.value}</div>
              </div>
            ))}
          </div>
        ) : <div className="text-xs text-zinc-500">无弹匣</div>}
      </div>

      {/* Tips */}
      {weapon.tips && (
        <div className="px-4 py-2.5 border-b border-white/[0.06]">
          <div className="text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">战术建议</div>
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            {[
              { label: '阶段', value: weapon.tips.phase },
              { label: '场景', value: weapon.tips.scene },
              { label: '后坐力', value: weapon.tips.recoil },
            ].map(t => (
              <div key={t.label} className="bg-zinc-900/60 border border-white/[0.04] px-2 py-1">
                <div className="text-[9px] text-zinc-600">{t.label}</div>
                <div className="text-[11px] text-zinc-200 font-medium">{t.value}</div>
              </div>
            ))}
          </div>
          <div className="text-[11px] text-zinc-300 leading-relaxed bg-zinc-900/40 border border-white/[0.04] px-2.5 py-1.5">
            <span className="text-red-400 font-bold mr-1">TIP</span> {weapon.tips.tip}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="px-4 py-2.5">
        <div className="text-[10px] text-zinc-500 mb-1 uppercase tracking-wider">武器简介</div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">{weapon.description}</p>
        {weapon.note && <p className="text-[10px] text-amber-400/80 mt-1.5 border-l-2 border-amber-500/40 pl-2">{weapon.note}</p>}
      </div>
    </div>
  );
}

function WeaponCard({ weapon, isActive, onHover, onLeave }) {
  const cardRef = useRef(null);
  const ammoStyle = AMMO_STYLE[weapon.ammoType] || 'bg-zinc-500/20 text-zinc-300';

  const handleEnter = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    onHover(weapon, { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height });
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={onLeave}
      className={`group relative border bg-black/40 overflow-hidden cursor-default transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/10 ${
        isActive ? 'border-red-500/50 bg-white/[0.04] shadow-lg shadow-red-500/10' : 'border-white/[0.06] hover:border-red-500/40 hover:bg-white/[0.03]'
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent to-transparent transition-all duration-300 ${isActive ? 'via-red-500/60' : 'via-red-500/0 group-hover:via-red-500/40'}`} />
      <div className="h-24 bg-zinc-900/60 flex items-center justify-center p-2.5">
        <img src={weapon.image} alt={weapon.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" onError={e => { e.target.style.display = 'none'; }} />
      </div>
      <div className="p-2.5 pt-2">
        <div className="font-bold text-white text-xs leading-tight truncate">{weapon.name}</div>
        <div className="text-[10px] text-zinc-500 mb-1.5 truncate">{weapon.nameEN}</div>
        <div className="flex items-center justify-between">
          <span className={`text-[9px] px-1.5 py-0.5 ${ammoStyle}`}>{weapon.ammoType}</span>
          <span className="text-[10px] text-zinc-400 font-mono">
            <span className="text-red-400">{weapon.headDamage}</span>
            <span className="text-zinc-600"> / </span>
            <span className="text-amber-400">{weapon.dps}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Encyclopedia() {
  const [tab, setTab] = useState('legends');
  const { data: legendsData, loading: legendsLoading, error: legendsError, reload: reloadLegends } = useFetch(api.legends);
  const { data: weaponsData, loading: weaponsLoading, error: weaponsError, reload: reloadWeapons } = useFetch(api.weapons);

  const [roleFilter, setRoleFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [hoverWeapon, setHoverWeapon] = useState(null);
  const [hoverAnchor, setHoverAnchor] = useState(null);
  const hoverTimer = useRef(null);

  const handleWeaponHover = useCallback((weapon, anchor) => {
    clearTimeout(hoverTimer.current);
    setHoverWeapon(weapon);
    setHoverAnchor(anchor);
  }, []);

  const handleWeaponLeave = useCallback(() => {
    hoverTimer.current = setTimeout(() => {
      setHoverWeapon(null);
      setHoverAnchor(null);
    }, 80);
  }, []);

  const filteredLegends = legendsData?.legends?.filter(l => {
    if (roleFilter !== 'all' && l.role !== roleFilter) return false;
    if (search && !l.name.includes(search) && !l.nameEN.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  const filteredWeapons = weaponsData?.weapons?.filter(w => {
    if (categoryFilter !== 'all' && w.category !== categoryFilter) return false;
    if (search && !w.name.includes(search) && !w.nameEN.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  const roles = ['all', '突击手', '空袭手', '侦察兵', '支援', '控场手'];
  const categories = weaponsData?.categories || [];

  return (
    <div>
      <div className="sticky top-14 z-30 bg-zinc-950/95 backdrop-blur-sm -mx-4 px-4 pb-2 border-b border-white/[0.04]">
        <div className="relative border border-white/[0.06] bg-black/40 overflow-hidden mb-3">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-red-500/[0.03] to-transparent pointer-events-none" />
          <div className="relative px-6 py-4">
            <div className="flex items-center gap-3 mb-1">
              <BookOpen size={22} className="text-red-400" />
              <h1 className="font-display text-2xl text-white tracking-wide">百科图鉴</h1>
            </div>
            <p className="text-sm text-zinc-500">传奇角色技能详解 · 武器数据对比</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => { setTab('legends'); setSearch(''); }}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              tab === 'legends'
                ? 'bg-red-500/15 text-red-400 border border-red-500/35'
                : 'text-zinc-400 hover:text-white border border-transparent hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-1.5"><Swords size={14} /> 传奇角色</span>
          </button>
          <button
            onClick={() => { setTab('weapons'); setSearch(''); }}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              tab === 'weapons'
                ? 'bg-red-500/15 text-red-400 border border-red-500/35'
                : 'text-zinc-400 hover:text-white border border-transparent hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-1.5"><Crosshair size={14} /> 武器数据</span>
          </button>
          <button
            onClick={() => { setTab('compare'); setSearch(''); }}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              tab === 'compare'
                ? 'bg-red-500/15 text-red-400 border border-red-500/35'
                : 'text-zinc-400 hover:text-white border border-transparent hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-1.5"><GitCompareArrows size={14} /> 武器对比</span>
          </button>

          <div className="ml-auto">
            <input
              type="text"
              placeholder="搜索..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-zinc-800/50 border border-white/[0.06] px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500/40 w-40"
            />
          </div>
        </div>

        {tab === 'legends' && (
          <div className="flex items-center gap-2 flex-wrap">
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 text-xs transition-all ${
                  roleFilter === r
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                {r === 'all' ? '全部' : r}
              </button>
            ))}
            <span className="text-xs text-zinc-600 ml-2">{filteredLegends.length} 个角色</span>
          </div>
        )}

        {tab === 'weapons' && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 text-xs transition-all ${
                categoryFilter === 'all'
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
              }`}
            >
              全部
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setCategoryFilter(c.id)}
                className={`px-3 py-1 text-xs transition-all ${
                  categoryFilter === c.id
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                {c.name}
              </button>
            ))}
            <span className="text-xs text-zinc-600 ml-2">{filteredWeapons.length} 把武器</span>
          </div>
        )}
      </div>

      {tab === 'legends' && (
        <>
          {legendsLoading && <Loader />}
          {legendsError && <ErrorBox error={legendsError} onRetry={reloadLegends} />}
          {!legendsLoading && !legendsError && (
            <div className="space-y-2 mt-3">
              {filteredLegends.map(l => <LegendCard key={l.id} legend={l} />)}
              {filteredLegends.length === 0 && (
                <div className="text-center text-zinc-500 py-12">没有匹配的角色</div>
              )}
            </div>
          )}
        </>
      )}

      {tab === 'weapons' && (
        <>
          {weaponsLoading && <Loader />}
          {weaponsError && <ErrorBox error={weaponsError} onRetry={reloadWeapons} />}
          {!weaponsLoading && !weaponsError && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-3">
              {filteredWeapons.map(w => (
                <WeaponCard key={w.id} weapon={w} isActive={hoverWeapon?.id === w.id} onHover={handleWeaponHover} onLeave={handleWeaponLeave} />
              ))}
              {filteredWeapons.length === 0 && (
                <div className="col-span-full text-center text-zinc-500 py-12">没有匹配的武器</div>
              )}
            </div>
          )}
          <WeaponPopover weapon={hoverWeapon} anchor={hoverAnchor} />
        </>
      )}

      {tab === 'compare' && (
        <>
          {weaponsLoading && <Loader />}
          {weaponsError && <ErrorBox error={weaponsError} onRetry={reloadWeapons} />}
          {!weaponsLoading && !weaponsError && weaponsData?.weapons && (
            <WeaponCompare weapons={weaponsData.weapons} />
          )}
        </>
      )}
    </div>
  );
}
