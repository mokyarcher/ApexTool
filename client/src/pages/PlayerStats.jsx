import { useState, useCallback } from 'react';
import { Search, User, Wifi, WifiOff, Shield, Swords, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { api } from '../api.js';
import { Loader, ErrorBox } from '../components/Loader.jsx';

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
  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-white/5">
      <div className="w-12 h-12 shrink-0">
        {rank.rankImg ? (
          <img src={rank.rankImg} alt={rank.rankName} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800"><Icon size={20} className="text-zinc-500" /></div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-zinc-500 uppercase tracking-wider">{title}</div>
        <div className={`text-sm font-bold ${colorCls.split(' ')[0]}`}>
          {RANK_CN[rank.rankName] || rank.rankName} {rank.rankDiv !== undefined && rank.rankDiv > 0 ? `#${rank.rankDiv}` : ''}
        </div>
        <div className="text-xs text-zinc-400 mt-0.5">{rank.rankScore} 排位分</div>
      </div>
    </div>
  );
}

/* ── Legend stats row ── */
function LegendRow({ name, data, imgAssets, gameInfo }) {
  const [open, setOpen] = useState(false);
  const trackers = data || [];
  if (trackers.length === 0 && !gameInfo) return null;

  return (
    <div className="border border-white/5 bg-zinc-950/40 overflow-hidden">
      <button
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/[0.03] transition"
        onClick={() => setOpen(!open)}
      >
        <div className="w-14 h-14 shrink-0 bg-zinc-800/60 overflow-hidden flex items-center justify-center">
          {imgAssets?.icon ? (
            <img
              src={imgAssets.icon}
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.querySelector('.legend-fallback')?.classList.remove('hidden'); }}
            />
          ) : null}
          <img
            src="/apex-logo.png"
            alt=""
            className={`legend-fallback w-8 h-8 object-contain ${imgAssets?.icon ? 'hidden' : ''}`}
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

  const doSearch = useCallback(async (q, plat) => {
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
        if (result.global?.uid && result.global?.name) {
          setHistory(addHistory(result.global.name, result.global.uid, result.global.platform || plat, result.global.level));
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
          if (result.global?.uid && result.global?.name) {
            setHistory(addHistory(result.global.name, result.global.uid, result.global.platform || plat, result.global.level));
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
    doSearch(uid, plat);
  }, [doSearch]);

  const backToResults = useCallback(() => {
    if (lastLookupResults) {
      setData(null);
      setError(null);
      setLookupResults(lastLookupResults);
    }
  }, [lastLookupResults]);

  const search = useCallback(() => doSearch(query, platform), [query, platform, doSearch]);
  const handleSubmit = (e) => { e.preventDefault(); search(); };

  const loadSaved = useCallback(() => {
    if (!saved) return;
    setQuery(saved.uid);
    setPlatform(saved.platform || 'PC');
    doSearch(saved.uid, saved.platform || 'PC');
  }, [saved, doSearch]);

  const handleSave = () => {
    const uid = data?.global?.uid;
    if (!uid) return;
    const val = { uid: String(uid), name: data.global.name, platform: data.global.platform || platform };
    setSavedUID(val);
    setSaved(val);
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

          {/* Saved UID quick load */}
          {saved && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
              <button
                onClick={loadSaved}
                className="flex items-center gap-2 px-3 py-1.5 text-xs bg-zinc-800/80 border border-white/10 text-zinc-300 hover:text-white hover:border-red-500/30 transition"
              >
                <User size={13} />
                <span>快速加载: <b>{saved.name}</b></span>
              </button>
              <button onClick={handleRemoveSaved} className="text-xs text-zinc-600 hover:text-zinc-400 transition">清除</button>
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
                      onClick={() => { setQuery(h.uid); setPlatform(h.platform || 'PC'); doSearch(h.uid, h.platform || 'PC'); }}
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
                    {/* UID display */}
                    {data.global?.uid && (
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-500">
                        <span>UID: <span className="text-zinc-400 font-mono select-all">{data.global.uid}</span></span>
                        {(!saved || saved.uid !== String(data.global.uid)) && (
                          <button onClick={handleSave} className="text-red-400/70 hover:text-red-300 transition">保存为我的</button>
                        )}
                        {saved?.uid === String(data.global.uid) && (
                          <span className="text-green-500/60">✓ 已保存</span>
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
                  {/* Total stats */}
                  {data.total && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(data.total).map(([key, stat]) => (
                        <div key={key} className="bg-zinc-900/50 p-3 border border-white/5">
                          <div className="text-[11px] text-zinc-500">{tStat(stat.name || key)}</div>
                          <div className="text-lg font-bold text-white">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

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
            数据来自 mozambiquehe.re API · 仅显示游戏内已装备的追踪器数据
          </div>
        </>
      )}
    </div>
  );
}
