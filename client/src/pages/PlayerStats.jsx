import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, User, Wifi, WifiOff, Shield, Swords, ChevronDown, ChevronUp, ArrowLeft, BarChart3, Gamepad2, Skull, Trophy, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Customized, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { api } from '../api.js';
import { Loader, ErrorBox } from '../components/Loader.jsx';
import { useAuth } from '../components/AuthContext.jsx';

/* ── Rank badge colors ── */
const RANK_COLORS = {
  Rookie: 'text-zinc-400 border-zinc-500/40',
  Bronze: 'text-amber-700 border-amber-700/40',
  Silver: 'text-zinc-300 border-zinc-400/40',
  Gold: 'text-yellow-400 border-yellow-500/40',
  Platinum: 'text-cyan-300 border-cyan-400/40',
  Diamond: 'text-blue-400 border-blue-400/40',
  Master: 'text-purple-400 border-purple-400/40',
  'Apex Predator': 'text-red-400 border-red-500/40',
  Unranked: 'text-zinc-500 border-zinc-600/40',
};

/* ── Rank name CN ── */
const RANK_CN = {
  Rookie: '新手', Bronze: '青铜', Silver: '白银', Gold: '黄金',
  Platinum: '铂金', Diamond: '钻石', Master: '大师',
  'Apex Predator': '猎杀者', Unranked: '未定级',
};
const RANK_BORDER = {
  Rookie: 'border-l-zinc-500', Bronze: 'border-l-amber-700', Silver: 'border-l-zinc-300',
  Gold: 'border-l-yellow-500', Platinum: 'border-l-cyan-400', Diamond: 'border-l-blue-400',
  Master: 'border-l-purple-500', 'Apex Predator': 'border-l-red-500', Unranked: 'border-l-zinc-600',
};
const RANK_GLOW = {
  Rookie: '', Bronze: '', Silver: '',
  Gold: 'shadow-yellow-500/10', Platinum: 'shadow-cyan-400/10', Diamond: 'shadow-blue-400/15',
  Master: 'shadow-purple-500/15', 'Apex Predator': 'shadow-red-500/20', Unranked: '',
};

/* ── Stat name CN ── */
const STAT_CN = {
  'BR Kills': '击杀', 'BR Damage': '伤害', 'BR Wins': '胜场',
  'BR Season 1 Wins': 'S1 胜场', 'BR Season 9 kills': 'S9 击杀',
  'BR Season 10 kills': 'S10 击杀', 'BR Season 10 wins': 'S10 胜场',
  'BR Season 11 wins': 'S11 胜场', 'BR Season 12 wins': 'S12 胜场',
  'BR Winning kills': '决胜击杀', KD: 'K/D', 'KD Ratio': 'K/D',
  'BR Deaths': '死亡', 'BR Assists': '助攻',
  kills: '击杀', damage: '伤害', wins: '胜场',
  'Silenced targets': '沉默敌人', 'Teammates lifted': '举起队友',
  'Enemies silenced': '沉默敌人',
  'Into the void: Time': '虚空行走时间',
  'Gravity lift: Teammates lifted': '重力电梯: 举起队友',
  'Grapple: Travel distance': '抓钩移动距离',
  'Eye: Enemies scanned': '扫描敌人数',
  'Silence: Enemies silenced': '沉默: 沉默敌人',
  'Drone: Enemies scanned': '无人机扫描敌人',
  'Nox Gas: Enemies damaged': '毒气: 伤害敌人',
  'Decoy: Bamboozles': '诱饵: 迷惑敌人',
  'Dome: Damage blocked': '护盾: 格挡伤害',
  'Black Hole: Enemies pulled': '黑洞: 吸引敌人',
  'Knuckle Cluster: Enemies hit': '爆裂星: 命中敌人',
  'Missile Swarm: Enemies hit': '导弹群: 命中敌人',
  'Exhibit: Enemies detected': '展览: 探测敌人',
  'Piercing Spikes: Enemies damaged': '穿刺尖刺: 伤害敌人',
  'Smoke: Enemies hit': '烟雾: 命中敌人',
  'Beast of the Hunt: Kills': '狩猎野兽: 击杀',
  'Death Totem: Allies saved': '死亡图腾: 拯救队友',
  'Care Package: Healing given': '补给包: 治疗量',
};
/* ── Legend name CN ── */
const LEGEND_CN = {
  Wraith: '恶灵', Bloodhound: '寻血猎犬', Gibraltar: '直布罗陀',
  Lifeline: '生命线', Pathfinder: '探路者', Octane: '动力小子',
  Bangalore: '班加罗尔', Caustic: '侵蚀', Mirage: '幻象',
  Wattson: '沃特森', Crypto: '密客', Revenant: '亡灵',
  Loba: '罗芭', Rampart: '兰伯特', Horizon: '地平线',
  Fuse: '暴雷', Valkyrie: '瓦尔基里', Seer: '希尔',
  Ash: '艾许', 'Mad Maggie': '疯玛吉', Newcastle: '纽卡斯尔',
  Vantage: '万蒂奇', Catalyst: '催化剂', Ballistic: '弹道',
  Conduit: '导管', Broken_Moon: '碎月', Alter: '变幻',
  Sparrow: '琉雀',
};
function tLegend(name) { return LEGEND_CN[name] || name; }

const LOCAL_LEGEND_ICON = {
  Alter: '/legends/alter.png',
  Axle: '/legends/axle.png',
};
function legendIcon(name, imgAssets) {
  return LOCAL_LEGEND_ICON[name] || imgAssets?.icon;
}

function tStat(name) {
  if (!name) return name;
  if (STAT_CN[name]) return STAT_CN[name];
  // Try partial match: "BR Season X kills" → "SX 击杀"
  const seasonKill = name.match(/BR Season (\d+) kills?/i);
  if (seasonKill) return `S${seasonKill[1]} 击杀`;
  const seasonWin = name.match(/BR Season (\d+) wins?/i);
  if (seasonWin) return `S${seasonWin[1]} 胜场`;
  return name;
}

/* ── Platform icon ── */
const PLATFORM_STYLE = {
  PC: 'bg-blue-900/50 border-blue-500/40 text-blue-300',
  PS4: 'bg-indigo-900/50 border-indigo-500/40 text-indigo-300',
  X1: 'bg-emerald-900/50 border-emerald-500/40 text-emerald-300',
  SWITCH: 'bg-red-900/50 border-red-500/40 text-red-300',
};

function PlatformBadge({ platform }) {
  const label = { PC: 'PC', PS4: 'PS', X1: 'Xbox', SWITCH: 'NS' }[platform] || platform;
  const style = PLATFORM_STYLE[platform] || 'bg-zinc-800 border-zinc-600/40 text-zinc-300';
  return <span className={`chip ${style}`}>{label}</span>;
}

/* ── Online status dot ── */
function StatusDot({ realtime }) {
  if (!realtime) return null;
  const online = realtime.isOnline === 1;
  const inGame = realtime.isInGame === 1;
  const color = inGame ? 'bg-green-400 shadow-green-400/50' : online ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-zinc-600';
  const text = inGame ? '游戏中' : online ? '在线' : '离线';
  const Icon = online ? Wifi : WifiOff;
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`} />
      <Icon size={14} className={online ? 'text-green-400' : 'text-zinc-500'} />
      <span className={online ? 'text-green-300' : 'text-zinc-500'}>{text}</span>
      {realtime.currentState === 'inMatch' && (
        <span className="text-xs text-zinc-500">· {realtime.selectedLegend}</span>
      )}
    </div>
  );
}

/* ── Rank card ── */
function RankCard({ title, icon: Icon, rank }) {
  if (!rank) return null;
  const colorCls = RANK_COLORS[rank.rankName] || RANK_COLORS.Unranked;
  const borderCls = RANK_BORDER[rank.rankName] || 'border-l-zinc-600';
  const glowCls = RANK_GLOW[rank.rankName] || '';
  return (
    <div className={`relative flex items-center gap-3 p-4 bg-gradient-to-br from-zinc-900/80 to-zinc-950/60 border border-white/[0.08] border-l-2 ${borderCls} hover:border-white/15 transition-all shadow-lg ${glowCls} overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent" />
      <div className="relative w-12 h-12 shrink-0">
        {rank.rankImg ? (
          <img src={rank.rankImg} alt={rank.rankName} className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800"><Icon size={20} className="text-zinc-500" /></div>
        )}
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{title}</div>
        <div className={`text-base font-bold ${colorCls.split(' ')[0]}`}>
          {RANK_CN[rank.rankName] || rank.rankName} {rank.rankDiv !== undefined && rank.rankDiv > 0 ? `#${rank.rankDiv}` : ''}
        </div>
        <div className="text-[11px] text-zinc-400 mt-0.5">{rank.rankScore} 排位分</div>
      </div>
    </div>
  );
}

/* ── Legend stats row ── */
function LegendRow({ name, data, imgAssets, gameInfo }) {
  const [open, setOpen] = useState(false);
  const trackers = data || [];
  if (trackers.length === 0 && !gameInfo) return null;
  const icon = legendIcon(name, imgAssets);

  return (
    <div className="border border-white/5 bg-zinc-950/40 overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.03] transition"
        onClick={() => setOpen(!open)}
      >
        <div className="w-14 h-14 shrink-0 bg-zinc-800/60 overflow-hidden flex items-center justify-center">
          {icon ? (
            <img
              src={icon}
              alt={name}
              className="w-full h-full object-cover object-top"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.querySelector('.legend-fallback')?.classList.remove('hidden'); }}
            />
          ) : null}
          <img
            src="/apex-logo.png"
            alt=""
            className={`legend-fallback w-8 h-8 object-contain ${icon ? 'hidden' : ''}`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white">{tLegend(name)}</div>
          {trackers.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
              {trackers.slice(0, 3).map((t, i) => (
                <div key={i} className="text-xs">
                  <span className="text-zinc-500">{tStat(t.name)}: </span>
                  <span className="text-white font-semibold">{typeof t.value === 'number' ? t.value.toLocaleString() : t.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {(trackers.length > 3 || gameInfo) && (
          open ? <ChevronUp size={18} className="text-zinc-500 shrink-0" /> : <ChevronDown size={18} className="text-zinc-500 shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5">
          {/* All trackers */}
          {trackers.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
              {trackers.map((t, i) => (
                <div key={i} className="bg-zinc-900/50 p-2.5 border border-white/5">
                  <div className="text-[11px] text-zinc-500 truncate">{tStat(t.name)}</div>
                  <div className="text-lg font-bold text-white">{typeof t.value === 'number' ? t.value.toLocaleString() : t.value}</div>
                  {t.rank && (
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      前 {t.rank.topPercent}% · 第 {t.rank.rankPos?.toLocaleString()} 名
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Game info (skin, frame, etc.) */}
          {gameInfo && (
            <div className="text-xs text-zinc-400 flex flex-wrap gap-x-3 gap-y-1 pt-1">
              {gameInfo.skin && gameInfo.skin !== 'None' && <span>皮肤: <b className="text-zinc-200">{gameInfo.skin}</b></span>}
              {gameInfo.frame && gameInfo.frame !== 'None' && <span>边框: <b className="text-zinc-200">{gameInfo.frame}</b></span>}
              {gameInfo.pose && gameInfo.pose !== 'None' && <span>姿态: <b className="text-zinc-200">{gameInfo.pose}</b></span>}
              {gameInfo.intro && gameInfo.intro !== 'None' && <span>开场: <b className="text-zinc-200">{gameInfo.intro}</b></span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Chart colors ── */
const CHART_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e',
  '#a855f7', '#6366f1', '#10b981', '#f59e0b', '#64748b',
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-white/10 px-3 py-2 text-xs shadow-xl">
      <div className="text-zinc-300 font-bold mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-zinc-400">{p.name}:</span>
          <span className="text-white font-semibold">{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Player Charts ── */
function PlayerCharts({ legends: rawLegends, total }) {
  const [chartTab, setChartTab] = useState('kills');
  const [animate, setAnimate] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    let timer;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animate) {
          timer = setTimeout(() => setAnimate(true), 400);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(timer); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Extract legend kill/damage/win data
  const legendStats = useMemo(() => {
    const stats = [];
    for (const leg of rawLegends) {
      const trackers = leg.data || [];
      const entry = { name: tLegend(leg.name) };
      let hasData = false;
      for (const t of trackers) {
        const n = (t.name || '').toLowerCase();
        if (n.includes('kill') && !n.includes('season')) { entry.kills = t.value; hasData = true; }
        if (n.includes('damage') && !n.includes('season')) { entry.damage = t.value; hasData = true; }
        if (n.includes('win') && !n.includes('season')) { entry.wins = t.value; hasData = true; }
      }
      if (hasData) stats.push(entry);
    }
    return stats;
  }, [rawLegends]);

  // Extract season data from total
  const seasonData = useMemo(() => {
    if (!total) return [];
    const seasons = {};
    for (const [, stat] of Object.entries(total)) {
      const killMatch = (stat.name || '').match(/BR Season (\d+) kills?/i);
      const winMatch = (stat.name || '').match(/BR Season (\d+) wins?/i);
      if (killMatch) {
        const s = `S${killMatch[1]}`;
        if (!seasons[s]) seasons[s] = { name: s, sort: parseInt(killMatch[1]) };
        seasons[s].kills = stat.value;
      }
      if (winMatch) {
        const s = `S${winMatch[1]}`;
        if (!seasons[s]) seasons[s] = { name: s, sort: parseInt(winMatch[1]) };
        seasons[s].wins = stat.value;
      }
    }
    return Object.values(seasons).sort((a, b) => a.sort - b.sort);
  }, [total]);

  // Sort by selected metric
  const sortedLegends = useMemo(() => {
    return [...legendStats].sort((a, b) => (b[chartTab] || 0) - (a[chartTab] || 0));
  }, [legendStats, chartTab]);

  // Pie data for kills distribution
  const pieData = useMemo(() => {
    return sortedLegends
      .filter(l => (l[chartTab] || 0) > 0)
      .map((l, i) => ({ ...l, value: l[chartTab] || 0, fill: CHART_COLORS[i % CHART_COLORS.length] }));
  }, [sortedLegends, chartTab]);

  if (legendStats.length === 0 && seasonData.length === 0) return null;

  const tabs = [
    { key: 'kills', label: '击杀' },
    { key: 'damage', label: '伤害' },
    { key: 'wins', label: '胜场' },
  ];

  return (
    <section ref={chartRef} className="relative border border-white/5 bg-zinc-950/40 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
      <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_2px_30px_rgba(0,0,0,0.4)]" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-white font-bold flex items-center gap-2">
            <BarChart3 size={18} className="text-red-400" />
            数据统计
          </h3>
          {legendStats.length > 0 && (
            <div className="flex gap-1">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setChartTab(t.key)}
                  className={`px-3 py-1 text-xs font-medium transition ${
                    chartTab === t.key
                      ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                      : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Bar chart: legend comparison */}
          {sortedLegends.length > 0 && (
            <div>
              <div className="text-xs text-zinc-500 mb-2">角色{tabs.find(t => t.key === chartTab)?.label}对比</div>
              <div style={{ height: Math.max(200, sortedLegends.length * 36) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sortedLegends} layout="vertical" margin={{ left: 0, right: 60, top: 0, bottom: 0 }}>
                    <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#d4d4d8', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey={animate ? chartTab : undefined} radius={[0, 2, 2, 0]} maxBarSize={24} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out" label={{ position: 'right', fill: '#a1a1aa', fontSize: 11, formatter: v => typeof v === 'number' ? v.toLocaleString() : v }}>
                      {sortedLegends.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Pie + Season charts side by side */}
          <div className={`grid gap-6 ${seasonData.length > 0 && pieData.length > 0 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {/* Pie chart */}
            {pieData.length > 1 && (
              <div>
                <div className="text-xs text-zinc-500 mb-2">角色{tabs.find(t => t.key === chartTab)?.label}占比</div>
                <div style={{ height: Math.max(300, pieData.length * 22 + 80) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={animate ? pieData : []}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        strokeWidth={1}
                        stroke="#18181b"
                        startAngle={90}
                        endAngle={-270}
                        isAnimationActive={true}
                        animationDuration={1200}
                        animationEasing="ease-out"
                        label={false}
                        labelLine={false}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      {animate && <Customized component={({ formattedGraphicalItems }) => {
                        const total = pieData.reduce((s, d) => s + d.value, 0);
                        if (!total) return null;
                        const RADIAN = Math.PI / 180;
                        const cxVal = 0.5, cyVal = 0.5;
                        const or = 80, labelR = or + 18, elbowLen = 18;
                        const LINE_H = 16;
                        // Compute raw positions
                        let cumAngle = 90;
                        const items = pieData.map((d, i) => {
                          const sliceAngle = (d.value / total) * 360;
                          const mid = cumAngle - sliceAngle / 2;
                          cumAngle -= sliceAngle;
                          const rad = -mid * RADIAN;
                          const ox = labelR * Math.cos(rad);
                          const oy = labelR * Math.sin(rad);
                          const isRight = Math.cos(rad) >= 0;
                          const pct = ((d.value / total) * 100).toFixed(1);
                          return { ...d, mid, ox, oy, isRight, pct, idx: i,
                            edgeX: or * Math.cos(rad) + 4 * Math.cos(rad),
                            edgeY: or * Math.sin(rad) + 4 * Math.sin(rad),
                          };
                        });
                        // Split left/right, sort by y, then spread to avoid overlap
                        const spread = (group) => {
                          group.sort((a, b) => a.oy - b.oy);
                          for (let i = 1; i < group.length; i++) {
                            if (group[i].oy - group[i-1].oy < LINE_H) {
                              group[i].oy = group[i-1].oy + LINE_H;
                            }
                          }
                          for (let i = group.length - 2; i >= 0; i--) {
                            if (group[i+1].oy - group[i].oy < LINE_H) {
                              group[i].oy = group[i+1].oy - LINE_H;
                            }
                          }
                        };
                        const right = items.filter(i => i.isRight);
                        const left = items.filter(i => !i.isRight);
                        spread(right);
                        spread(left);
                        const allItems = [...right, ...left];
                        return (
                          <g className="pie-labels" style={{ transform: 'translate(50%, 50%)' }}>
                            {allItems.map((it, i) => {
                              const elbowX = it.isRight ? labelR + elbowLen : -(labelR + elbowLen);
                              const textX = it.isRight ? elbowX + 4 : elbowX - 4;
                              const delay = 1.2 + i * 0.12;
                              return (
                                <g key={it.idx} style={{ opacity: 0, animation: `pieLabelIn 0.4s ease-out ${delay}s forwards` }}>
                                  <polyline
                                    points={`${it.edgeX},${it.edgeY} ${it.ox},${it.oy} ${elbowX},${it.oy}`}
                                    fill="none" stroke="#52525b" strokeWidth={1}
                                  />
                                  <text x={textX} y={it.oy} fill={it.fill} textAnchor={it.isRight ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
                                    {it.name} {it.pct}%
                                  </text>
                                </g>
                              );
                            })}
                          </g>
                        );
                      }} />
                      }
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Season trend */}
            {seasonData.length > 1 && (
              <div>
                <div className="text-xs text-zinc-500 mb-2">赛季趋势</div>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={seasonData} margin={{ left: 0, right: 10, top: 5, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : v} />
                      <Tooltip content={<CustomTooltip />} />
                      {seasonData.some(d => d.kills != null) && (
                        <Line type="monotone" dataKey={animate ? 'kills' : undefined} name="击杀" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                      )}
                      {seasonData.some(d => d.wins != null) && (
                        <Line type="monotone" dataKey={animate ? 'wins' : undefined} name="胜场" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                      )}
                      <Legend formatter={(value) => <span className="text-xs text-zinc-400">{value}</span>} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── localStorage helpers ── */
const SAVED_KEY = 'apex_saved_uid';
function getSavedUID() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)); } catch { return null; }
}
function setSavedUID(val) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(val));
}
function removeSavedUID() {
  localStorage.removeItem(SAVED_KEY);
}

const HISTORY_KEY = 'apex_search_history';
const MAX_HISTORY = 10;
function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
}
function addHistory(name, uid, platform, level) {
  const key = `${name}:${uid}`;
  let list = getHistory().filter(h => `${h.name}:${h.uid}` !== key);
  list.unshift({ name, uid: String(uid), platform, level: level || null, time: Date.now() });
  if (list.length > MAX_HISTORY) list = list.slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return list;
}
function removeHistory(uid) {
  const list = getHistory().filter(h => h.uid !== uid);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return list;
}
function clearAllHistory() {
  localStorage.removeItem(HISTORY_KEY);
  return [];
}

/* ── Main page ── */
export default function PlayerStats() {
  const { user, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState('PC');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchedByName, setSearchedByName] = useState(false);
  const [skippedSelection, setSkippedSelection] = useState(false);
  const [saved, setSaved] = useState(getSavedUID);
  const [lookupResults, setLookupResults] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lastLookupResults, setLastLookupResults] = useState(null);
  const [history, setHistory] = useState(getHistory);
  const autoSearchDone = useRef(false);
  const [showBindGuide, setShowBindGuide] = useState(false);
  const guideTimerRef = useRef(null);

  const doSearch = useCallback(async (q, plat, originalName) => {
    q = (q || '').trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setData(null);
    setLookupResults(null);
    setLastLookupResults(null);
    const isUid = /^\d{5,}$/.test(q);
    setSearchedByName(!isUid);
    setSkippedSelection(false);
    if (isUid) {
      // UID search: direct query
      try {
        const result = await api.player({ uid: q, platform: plat });
        if (result.error || result.Error) throw new Error(result.error || result.Error);
        setData(result);
        if (result.global?.uid) {
          const displayName = originalName || result.global.name || q;
          setHistory(addHistory(displayName, result.global.uid, result.global.platform || plat, result.global.level));
        }
      } catch (e) {
        setError(e.message || '查询失败');
      } finally {
        setLoading(false);
      }
    } else {
      // Name search: always deep search to show all matching players
      setLoading(false);
      setLookupLoading(true);
      try {
        const lookup = await api.playerLookup({ name: q, platform: plat });
        if (lookup.results?.length === 1) {
          // Only one match → load directly
          setSkippedSelection(true);
          setLookupLoading(false);
          setLoading(true);
          const result = await api.player({ uid: lookup.results[0].uid, platform: lookup.results[0].platform || plat });
          if (result.error || result.Error) throw new Error(result.error || result.Error);
          setData(result);
          if (result.global?.uid) {
            const displayName = q || result.global.name;
            setHistory(addHistory(displayName, result.global.uid, result.global.platform || plat, result.global.level));
          }
        } else if (lookup.results?.length > 1) {
          // Multiple matches → show selection
          setLookupResults(lookup.results);
          setLastLookupResults(lookup.results);
        } else {
          setError(`未找到玩家「${q}」。请检查名字拼写或尝试用 UID 查询。`);
        }
      } catch (e) {
        setError(e.message || '查询失败');
      } finally {
        setLookupLoading(false);
        setLoading(false);
      }
    }
  }, []);

  const selectLookupResult = useCallback((uid, plat) => {
    setLookupResults(null);
    doSearch(uid, plat, query);
  }, [doSearch, query]);

  const backToResults = useCallback(() => {
    if (lastLookupResults) {
      setData(null);
      setError(null);
      setLookupResults(lastLookupResults);
    }
  }, [lastLookupResults]);

  const search = useCallback(() => doSearch(query, platform), [query, platform, doSearch]);
  const handleSubmit = (e) => { e.preventDefault(); search(); };

  // Auto-search from URL ?q= param (e.g. from Profile "选择正确账号")
  useEffect(() => {
    if (autoSearchDone.current) return;
    const q = searchParams.get('q');
    if (q) {
      autoSearchDone.current = true;
      setQuery(q);
      doSearch(q, 'PC');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show bind guide when: logged in, no Steam bound, data loaded, not already saved
  useEffect(() => {
    if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
    if (data && user && !user.eaName && (!saved || saved.uid !== String(data.global?.uid))) {
      guideTimerRef.current = setTimeout(() => setShowBindGuide(true), 1500);
    } else {
      setShowBindGuide(false);
    }
    return () => { if (guideTimerRef.current) clearTimeout(guideTimerRef.current); };
  }, [data, user, saved]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadSaved = useCallback(() => {
    if (!saved) return;
    setQuery(saved.name || saved.uid);
    setPlatform(saved.platform || 'PC');
    doSearch(saved.uid, saved.platform || 'PC', saved.name);
  }, [saved, doSearch]);

  const handleSave = async () => {
    const uid = data?.global?.uid;
    if (!uid) return;
    const playerName = data.global.name || query;
    const val = { uid: String(uid), name: playerName, platform: data.global.platform || platform };
    setSavedUID(val);
    setSaved(val);
    // Sync bound UID + Steam name to server (works across devices)
    if (user) {
      try {
        const updates = { boundUid: String(uid), boundPlatform: data.global.platform || platform };
        if (!user.eaName && playerName) updates.eaName = playerName;
        await updateProfile(updates);
      } catch {}
    }
  };

  const handleRemoveSaved = () => {
    removeSavedUID();
    setSaved(null);
  };

  // Parse legend list from data
  const legends = [];
  if (data?.legends?.all) {
    const selected = data.legends.selected;
    // Put selected legend first
    if (selected) {
      legends.push({
        name: selected.LegendName,
        data: selected.data,
        imgAssets: selected.ImgAssets,
        gameInfo: selected.gameInfo,
      });
    }
    for (const [name, info] of Object.entries(data.legends.all)) {
      if (name === 'Global') continue;
      if (selected && name === selected.LegendName) continue;
      if (!info.data && !info.gameInfo) continue;
      legends.push({
        name,
        data: info.data,
        imgAssets: info.ImgAssets,
        gameInfo: info.gameInfo,
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <section className="relative border border-white/5 bg-zinc-950/40 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
        <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_2px_30px_rgba(0,0,0,0.4)]" />
        <div className="relative z-10">
          <h1 className="font-display text-2xl text-white font-bold mb-4 flex items-center gap-2">
            <Search size={22} className="text-red-400" /> 战绩查询
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="输入玩家名 或 UID（纯数字）..."
                className="flex-1 bg-zinc-900/80 border border-white/10 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-red-500/50 transition"
              />
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="bg-zinc-900/80 border border-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500/50 transition cursor-pointer"
              >
                <option value="PC">PC</option>
                <option value="PS4">PlayStation</option>
                <option value="X1">Xbox</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-2.5 bg-red-600/80 hover:bg-red-600 text-white text-sm font-bold border border-red-500/50 transition-all disabled:opacity-40 disabled:hover:bg-red-600/80 flex items-center justify-center gap-2"
            >
              <Search size={16} />
              {loading ? '查询中...' : '查询'}
            </button>
          </form>

          {/* Quick buttons row */}
          {(user?.eaName || saved) && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
              {user?.eaName && (
                <button
                  onClick={() => { setQuery(user.eaName); setPlatform('PC'); doSearch(user.eaName, 'PC'); }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs bg-red-600/15 border border-red-500/25 text-red-400 hover:text-red-300 hover:bg-red-600/25 transition"
                >
                  <Gamepad2 size={13} />
                  <span>查询我的战绩</span>
                </button>
              )}
              {saved && (
                <>
                  <button
                    onClick={loadSaved}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs bg-zinc-800/80 border border-white/10 text-zinc-300 hover:text-white hover:border-red-500/30 transition"
                  >
                    <User size={13} />
                    <span>快速加载: <b>{saved.name}</b></span>
                  </button>
                  <button onClick={handleRemoveSaved} className="text-xs text-zinc-600 hover:text-zinc-400 transition">清除</button>
                </>
              )}
            </div>
          )}

          {/* Search history */}
          {history.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-zinc-600">📝 查询记录</span>
                <button onClick={() => setHistory(clearAllHistory())} className="text-[10px] text-zinc-600 hover:text-zinc-400 transition">清空</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {history.map((h) => (
                  <div key={`${h.name}:${h.uid}`} className="group relative flex items-center">
                    <button
                      onClick={() => { setQuery(h.name); setPlatform(h.platform || 'PC'); doSearch(h.uid, h.platform || 'PC', h.name); }}
                      className="px-2.5 py-1 text-xs bg-zinc-800/80 border border-white/5 text-zinc-400 hover:text-white hover:border-red-500/30 transition truncate max-w-[140px]"
                      title={`UID: ${h.uid} | Lv.${h.level || '?'} | ${h.platform || 'PC'}`}
                    >
                      {h.name}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setHistory(removeHistory(h.uid)); }}
                      className="ml-0.5 px-1 py-1 text-[10px] text-zinc-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {loading && <Loader label="正在查询玩家数据..." />}
      {lookupLoading && <Loader label="正在深度搜索玩家..." />}

      {/* Lookup results - multiple matches */}
      {lookupResults && (
        <section className="relative border border-white/5 bg-zinc-950/40 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-amber-300 mb-1">🔍 找到 {lookupResults.length} 个匹配的玩家</h3>
            <p className="text-xs text-zinc-500 mb-4">点击选择正确的玩家查看完整数据</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {lookupResults.map((r) => (
                <button
                  key={r.uid}
                  onClick={() => selectLookupResult(r.uid, r.platform)}
                  className="flex flex-col items-center gap-2 p-4 bg-zinc-900/60 border border-white/5 hover:border-red-500/40 hover:bg-zinc-900/80 transition-all text-center group"
                >
                  {r.rankImg ? (
                    <img src={r.rankImg} alt="" className="w-10 h-10 object-contain" />
                  ) : (
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                      <User size={18} className="text-zinc-500 group-hover:text-red-400 transition" />
                    </div>
                  )}
                  <div className="text-sm font-bold text-white truncate w-full">{r.name}</div>
                  <div className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-400">
                    {r.level && (
                      <span className="bg-zinc-800 px-1.5 py-0.5">
                        Lv.{r.level}{r.prestige && r.prestige !== '0' ? ` (阶段${Number(r.prestige) + 1})` : ''}
                      </span>
                    )}
                    <span className="bg-zinc-800 px-1.5 py-0.5">{r.platform}</span>
                  </div>
                  {r.legend && <div className="text-[11px] text-zinc-500">{r.legend}</div>}
                  {r.rp && <div className="text-[11px] text-amber-500/80 font-bold">{r.rp} 排位分</div>}
                  <div className="text-[10px] text-zinc-600 font-mono">{r.uid}</div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {error && (
        <div className="card p-6 text-center space-y-3">
          <div className="text-red-400">{error}</div>
          <button className="btn" onClick={search}>重试</button>
        </div>
      )}

      {data && (
        <>
          {/* Back to results button */}
          {lastLookupResults && (
            <button
              onClick={backToResults}
              className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white bg-zinc-900/80 border border-white/10 hover:border-red-500/30 transition"
            >
              <ArrowLeft size={16} /> 返回搜索结果（{lastLookupResults.length} 个匹配）
            </button>
          )}

          {/* Player overview */}
          <section className="relative border border-white/5 bg-zinc-950/40 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_2px_30px_rgba(0,0,0,0.4)]" />
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Left: Avatar + basic info */}
                <div className="flex flex-col items-center sm:items-start gap-3 sm:w-56 shrink-0">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-zinc-800 border-2 border-white/10 overflow-hidden flex items-center justify-center">
                    {data.global?.avatar ? (
                      <img
                        src={data.global.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.querySelector('.apex-fallback')?.classList.remove('hidden'); }}
                      />
                    ) : null}
                    <img
                      src="/apex-logo.png"
                      alt="Apex"
                      className={`apex-fallback w-12 h-12 object-contain ${data.global?.avatar ? 'hidden' : ''}`}
                    />
                  </div>
                  {/* Name + level */}
                  <div className="text-center sm:text-left">
                    <h2 className="font-display text-xl text-white font-bold">{data.global?.name || query || '未知'}</h2>
                    <div className="flex items-center gap-2 mt-1 flex-wrap justify-center sm:justify-start">
                      <span className={`chip relative group cursor-help ${
                        ({
                          0: 'bg-emerald-900/50 border-emerald-500/40 text-emerald-300',
                          1: 'bg-blue-900/50 border-blue-500/40 text-blue-300',
                          2: 'bg-purple-900/50 border-purple-500/40 text-purple-300',
                          3: 'bg-amber-900/50 border-amber-500/40 text-amber-300',
                        }[data.global?.levelPrestige] || 'bg-red-900/50 border-red-500/40 text-red-300')
                      }`}>
                        Lv.{data.global?.level || '?'}
                        {data.global?.levelPrestige > 0 && (
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-30">
                            <div className="bg-zinc-900 border border-white/10 shadow-xl px-3 py-2 text-[11px] text-zinc-300 whitespace-nowrap">
                              累计等级 Lv.{data.global.levelPrestige * 500 + (data.global.level || 0)}
                            </div>
                          </div>
                        )}
                      </span>
                      {data.global?.levelPrestige > 0 && (
                        <span className={`chip relative group cursor-help ${({
                          1: 'bg-blue-900/50 border-blue-500/40 text-blue-300',
                          2: 'bg-purple-900/50 border-purple-500/40 text-purple-300',
                          3: 'bg-amber-900/50 border-amber-500/40 text-amber-300',
                        }[data.global.levelPrestige] || 'bg-red-900/50 border-red-500/40 text-red-300')}`}>
                          阶段 {data.global.levelPrestige + 1}
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-30">
                            <div className="bg-zinc-900 border border-white/10 shadow-xl px-3 py-2 text-[11px] text-zinc-300 whitespace-nowrap space-y-0.5">
                              {Array.from({ length: data.global.levelPrestige + 1 }, (_, i) => (
                                <div key={i} className={i === data.global.levelPrestige ? 'text-amber-300 font-bold' : 'text-zinc-500'}>
                                  Lv.{i * 500 + 1} - Lv.{(i + 1) * 500}　阶段 {i + 1} {i === data.global.levelPrestige ? ' ◀ 当前' : ''}
                                </div>
                              ))}
                            </div>
                          </div>
                        </span>
                      )}
                      <PlatformBadge platform={data.global?.platform} />
                    </div>
                    {/* UID + bind */}
                    {data.global?.uid && (
                      <div className="relative flex items-center gap-2 mt-2 text-[11px] text-zinc-500 flex-wrap">
                        <span>UID: <span className="text-zinc-400 font-mono select-all">{data.global.uid}</span></span>
                        <span className="text-zinc-700">|</span>
                        {(!saved || saved.uid !== String(data.global.uid)) ? (
                          <span className="relative">
                            <button
                              onClick={() => { handleSave(); setShowBindGuide(false); }}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-red-400 bg-red-500/10 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500/40 transition ${showBindGuide ? 'guide-pulse' : ''}`}
                            >
                              <Shield size={10} /> 绑定为我的
                            </button>
                            {/* Animated guide tooltip */}
                            {showBindGuide && (
                              <div className="absolute left-0 top-full mt-2 z-40 guide-slide-in" style={{ minWidth: '220px' }}>
                                <div className="guide-arrow text-red-500 flex justify-start pl-4 -mb-1">
                                  <svg width="12" height="8" viewBox="0 0 12 8"><polygon points="6,0 12,8 0,8" fill="currentColor" /></svg>
                                </div>
                                <div className="bg-zinc-900 border border-red-500/30 shadow-xl shadow-red-500/10 px-3.5 py-2.5">
                                  <div className="flex items-start gap-2">
                                    <Gamepad2 size={14} className="text-red-400 mt-0.5 shrink-0" />
                                    <div>
                                      <p className="text-xs text-white font-bold mb-1">绑定你的游戏账号</p>
                                      <p className="text-[11px] text-zinc-400 leading-relaxed">点击「绑定为我的」将此账号设为你的 Steam 账号，即可在个人中心快速查看战绩</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setShowBindGuide(false); }}
                                    className="mt-2 text-[10px] text-zinc-600 hover:text-zinc-400 transition"
                                  >
                                    知道了，不再提示
                                  </button>
                                </div>
                              </div>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-green-400 bg-green-500/10 border border-green-500/25">
                            <Shield size={10} /> ✓ 已绑定
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Level progress */}
                  {data.global?.toNextLevelPercent != null && (
                    <div className="w-full">
                      <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                        <span>下一级</span>
                        <span>{data.global.toNextLevelPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
                          style={{ width: `${data.global.toNextLevelPercent}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {/* Online status */}
                  <StatusDot realtime={data.realtime} />
                  {/* Selected legend */}
                  {data.realtime?.selectedLegend && (
                    <div className="text-xs text-zinc-500">
                      当前角色: <span className="text-zinc-300">{tLegend(data.realtime.selectedLegend)}</span>
                    </div>
                  )}
                </div>

                {/* Right: Ranks + total stats */}
                <div className="flex-1 space-y-4">
                  {/* Ranks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <RankCard title="大逃杀排位" icon={Shield} rank={data.global?.rank} />
                    <RankCard title="竞技场排位" icon={Swords} rank={data.global?.arena} />
                  </div>
                  {/* Total stats - computed from all legends */}
                  {(() => {
                    let kills = 0, damage = 0, wins = 0;
                    let hasK = false, hasD = false, hasW = false;
                    for (const leg of legends) {
                      for (const t of (leg.data || [])) {
                        const n = (t.name || '').toLowerCase();
                        if (n.includes('kill') && !n.includes('season')) { kills += (t.value || 0); hasK = true; }
                        if (n.includes('damage') && !n.includes('season')) { damage += (t.value || 0); hasD = true; }
                        if (n.includes('win') && !n.includes('season')) { wins += (t.value || 0); hasW = true; }
                      }
                    }
                    const items = [];
                    if (hasK) items.push({ label: '总击杀', value: kills, icon: Skull });
                    if (hasD) items.push({ label: '总伤害', value: damage, icon: Target });
                    if (hasW) items.push({ label: '总胜场', value: wins, icon: Trophy });
                    return items.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {items.map(s => (
                          <div key={s.label} className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/60 border border-white/[0.08] border-l-2 border-l-red-500/60 p-4 hover:border-red-500/25 transition-all shadow-lg shadow-red-500/[0.03] group overflow-hidden">
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-red-500/[0.03] to-transparent" />
                            <div className="relative">
                              <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
                                <s.icon size={12} className="text-red-400/70" /> {s.label}
                              </div>
                              <div className="text-xl font-bold text-white">{s.value.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          </section>

          {/* Charts */}
          <PlayerCharts legends={legends} total={data.total} />

          {/* Legend stats */}
          {legends.length > 0 && (
            <section className="relative border border-white/5 bg-zinc-950/40 p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
              <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_2px_30px_rgba(0,0,0,0.4)]" />
              <div className="relative z-10">
                <h3 className="font-display text-lg text-white font-bold mb-4">传奇角色数据</h3>
                <div className="space-y-2">
                  {legends.map((leg) => (
                    <LegendRow key={leg.name} {...leg} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* API disclaimer */}
          <div className="text-center text-xs text-zinc-600 py-2">
            数据来自 mozambiquehe.re API · 仅显示游戏内已装备的追踪器数据 · 若页面异常请按 Ctrl+Shift+R 强制刷新
          </div>
        </>
      )}
    </div>
  );
}
