import { useState } from 'react';
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
            src={legend.image}
            alt={legend.name}
            className="w-full h-full object-cover"
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

function WeaponRow({ weapon }) {
  const [expanded, setExpanded] = useState(false);
  const ammoStyle = AMMO_STYLE[weapon.ammoType] || 'bg-zinc-500/20 text-zinc-300';

  return (
    <div className="border border-white/[0.06] bg-black/40 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors text-left"
      >
        <div className="w-14 h-14 bg-zinc-800 flex-shrink-0 overflow-hidden">
          <img
            src={weapon.image}
            alt={weapon.name}
            className="w-full h-full object-contain p-1"
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{weapon.name}</span>
            <span className="text-xs text-zinc-500">{weapon.nameEN}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 ${ammoStyle}`}>{weapon.ammoType}</span>
            <span className="text-xs text-zinc-400">
              身体 <span className="text-white">{weapon.bodyDamage}</span>
              {' · '}
              爆头 <span className="text-red-400">{weapon.headDamage}</span>
              {' · '}
              DPS <span className="text-amber-400">{weapon.dps}</span>
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3">
          <p className="text-sm text-zinc-400 mb-3">{weapon.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-zinc-800/50 p-3">
              <div className="text-xs text-zinc-500 mb-1">伤害</div>
              <div className="text-white">
                身体 {weapon.bodyDamage} · 头 {weapon.headDamage} · 腿 {weapon.legDamage}
              </div>
            </div>
            <div className="bg-zinc-800/50 p-3">
              <div className="text-xs text-zinc-500 mb-1">射速</div>
              <div className="text-white">{weapon.rpm} RPM</div>
            </div>
            <div className="bg-zinc-800/50 p-3">
              <div className="text-xs text-zinc-500 mb-1">弹匣容量</div>
              <div className="text-white text-xs">
                {weapon.magSize.base != null ? (
                  <>
                    <span className="text-zinc-400">基础</span> {weapon.magSize.base}
                    {weapon.magSize.white && <> · <span className="text-zinc-300">白</span> {weapon.magSize.white}</>}
                    {weapon.magSize.blue && <> · <span className="text-blue-400">蓝</span> {weapon.magSize.blue}</>}
                    {weapon.magSize.purple && <> · <span className="text-purple-400">紫</span> {weapon.magSize.purple}</>}
                  </>
                ) : '无弹匣'}
              </div>
            </div>
            <div className="bg-zinc-800/50 p-3">
              <div className="text-xs text-zinc-500 mb-1">换弹时间</div>
              <div className="text-white text-xs">
                {weapon.reloadTime.tactical != null
                  ? <>{weapon.reloadTime.tactical}s / {weapon.reloadTime.full}s</>
                  : '无需换弹'}
              </div>
            </div>
          </div>
        </div>
      )}
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
      <div className="relative border border-white/[0.06] bg-black/40 overflow-hidden mb-6">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/[0.03] to-transparent pointer-events-none" />
        <div className="relative px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <BookOpen size={22} className="text-red-400" />
            <h1 className="font-display text-2xl text-white tracking-wide">百科图鉴</h1>
          </div>
          <p className="text-sm text-zinc-500">传奇角色技能详解 · 武器数据对比</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
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
        <>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
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

          {legendsLoading && <Loader />}
          {legendsError && <ErrorBox error={legendsError} onRetry={reloadLegends} />}
          {!legendsLoading && !legendsError && (
            <div className="space-y-2">
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
          <div className="flex items-center gap-2 mb-4 flex-wrap">
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

          {weaponsLoading && <Loader />}
          {weaponsError && <ErrorBox error={weaponsError} onRetry={reloadWeapons} />}
          {!weaponsLoading && !weaponsError && (
            <div className="space-y-2">
              {filteredWeapons.map(w => <WeaponRow key={w.id} weapon={w} />)}
              {filteredWeapons.length === 0 && (
                <div className="text-center text-zinc-500 py-12">没有匹配的武器</div>
              )}
            </div>
          )}
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
