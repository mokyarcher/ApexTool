import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext.jsx';
import { api } from '../api.js';
import { ArrowLeft, User, LogOut, Save, Gamepad2, Calendar, Shield, RefreshCw, Swords, Trophy, Target, Skull, Clock, AlertTriangle, Search, Unlink, BarChart3 } from 'lucide-react';

const STATS_CACHE_KEY = 'apex_profile_stats';

function getCachedStats(userId) {
  try {
    const raw = localStorage.getItem(`${STATS_CACHE_KEY}:${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function setCachedStats(userId, data) {
  localStorage.setItem(`${STATS_CACHE_KEY}:${userId}`, JSON.stringify({ data, fetchedAt: Date.now() }));
}

function timeAgo(ts) {
  if (!ts) return '从未';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  return `${Math.floor(diff / 86400)} 天前`;
}

/* ── Rank helpers ── */
const RANK_COLORS = {
  Rookie: 'text-zinc-400', Bronze: 'text-amber-700', Silver: 'text-zinc-300',
  Gold: 'text-yellow-400', Platinum: 'text-cyan-300', Diamond: 'text-blue-400',
  Master: 'text-purple-400', Predator: 'text-red-400',
};
const RANK_BORDER = {
  Rookie: 'border-l-zinc-500', Bronze: 'border-l-amber-700', Silver: 'border-l-zinc-300',
  Gold: 'border-l-yellow-500', Platinum: 'border-l-cyan-400', Diamond: 'border-l-blue-400',
  Master: 'border-l-purple-500', Predator: 'border-l-red-500',
};
const RANK_GLOW = {
  Rookie: '', Bronze: '', Silver: '',
  Gold: 'shadow-yellow-500/10', Platinum: 'shadow-cyan-400/10', Diamond: 'shadow-blue-400/15',
  Master: 'shadow-purple-500/15', Predator: 'shadow-red-500/20',
};
const RANK_CN = {
  Rookie: '新手', Bronze: '青铜', Silver: '白银', Gold: '黄金',
  Platinum: '铂金', Diamond: '钻石', Master: '大师', Predator: '猎杀者',
};

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [eaName, setEaName] = useState(user?.eaName || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  // Stats state
  const [stats, setStats] = useState(null);
  const [fetchedAt, setFetchedAt] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const handleUnbind = async () => {
    try {
      await updateProfile({ eaName: '', boundUid: '', boundPlatform: '' });
      setEaName('');
      setStats(null);
      setFetchedAt(null);
      localStorage.removeItem(`${STATS_CACHE_KEY}:${user.id}`);
      localStorage.removeItem('apex_saved_uid');
    } catch {}
  };

  // Load cached stats on mount
  useEffect(() => {
    if (!user?.eaName) return;
    const cached = getCachedStats(user.id);
    if (cached) {
      setStats(cached.data);
      setFetchedAt(cached.fetchedAt);
    }
  }, [user?.id, user?.eaName]);

  const fetchStats = useCallback(async () => {
    if (!user?.eaName) return;
    setStatsLoading(true);
    setStatsError(null);
    try {
      // Priority: 1) server-side boundUid  2) localStorage  3) name lookup
      let uid, plat = 'PC';

      if (user.boundUid) {
        uid = user.boundUid;
        plat = user.boundPlatform || 'PC';
      }

      if (!uid) {
        try {
          const savedPlayer = JSON.parse(localStorage.getItem('apex_saved_uid'));
          if (savedPlayer?.uid) { uid = savedPlayer.uid; plat = savedPlayer.platform || 'PC'; }
        } catch {}
      }

      // Fallback: lookup by name
      if (!uid) {
        const lookup = await api.playerLookup({ name: user.eaName, platform: 'PC' });
        if (!lookup.results?.length) throw new Error('未找到该 Steam 账号');
        uid = lookup.results[0].uid;
        plat = lookup.results[0].platform || 'PC';
      }

      const result = await api.player({ uid, platform: plat });
      if (result.error || result.Error) throw new Error(result.error || result.Error);
      setStats(result);
      setFetchedAt(Date.now());
      setCachedStats(user.id, result);
    } catch (e) {
      setStatsError(e.message || '获取战绩失败');
    } finally {
      setStatsLoading(false);
    }
  }, [user?.eaName, user?.id, user?.boundUid]);

  // Auto-fetch only if no cache or cache older than 15 min
  useEffect(() => {
    if (!user?.eaName || statsLoading) return;
    const cached = getCachedStats(user.id);
    if (!cached) { fetchStats(); return; }
    const age = Date.now() - (cached.fetchedAt || 0);
    if (age > 15 * 60 * 1000) fetchStats();
  }, [user?.eaName]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">请先登录</p>
        <button
          onClick={() => navigate('/auth')}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition"
        >
          去登录
        </button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      await updateProfile({ nickname: nickname.trim(), eaName: eaName.trim() });
      setMsg('保存成功');
      setTimeout(() => setMsg(null), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '未知';

  // Extract key stats
  const g = stats?.global;
  const total = stats?.total;
  const rankName = g?.rank?.rankName;
  const rankDiv = g?.rank?.rankDiv;
  const rankScore = g?.rank?.rankScore;
  const arenaName = g?.arena?.rankName;
  const arenaDiv = g?.arena?.rankDiv;
  const arenaScore = g?.arena?.rankScore;
  const selectedLegend = stats?.legends?.selected;

  // Calculate totals by summing all legends' tracker data
  const computed = (() => {
    let kills = 0, damage = 0, wins = 0, hasKills = false, hasDamage = false, hasWins = false;
    const allLegends = stats?.legends?.all || {};
    for (const leg of Object.values(allLegends)) {
      for (const t of (leg.data || [])) {
        const n = (t.name || '').toLowerCase();
        if (n.includes('kill') && !n.includes('season')) { kills += (t.value || 0); hasKills = true; }
        if (n.includes('damage') && !n.includes('season')) { damage += (t.value || 0); hasDamage = true; }
        if (n.includes('win') && !n.includes('season')) { wins += (t.value || 0); hasWins = true; }
      }
    }
    return { kills: hasKills ? kills : null, damage: hasDamage ? damage : null, wins: hasWins ? wins : null };
  })();

  const statCards = [];
  if (computed.kills != null) statCards.push({ label: '总击杀', value: computed.kills, icon: Skull });
  if (computed.wins != null) statCards.push({ label: '总胜场', value: computed.wins, icon: Trophy });
  if (computed.damage != null) statCards.push({ label: '总伤害', value: computed.damage, icon: Target });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition"
      >
        <ArrowLeft size={16} /> 返回
      </button>

      {/* Profile header */}
      <section className="relative border border-white/5 bg-zinc-950/60 shadow-2xl shadow-black/30 backdrop-blur-sm overflow-hidden">
        <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_2px_30px_rgba(0,0,0,0.4)]" />

        <div className="relative z-10 p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 shrink-0 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 grid place-items-center overflow-hidden">
              {g?.avatar ? (
                <img src={g.avatar} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling?.classList.remove('hidden'); }} />
              ) : null}
              <img src="/apex-logo.png" alt="Apex" className={`w-12 h-12 object-contain ${g?.avatar ? 'hidden' : ''}`} />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-display font-bold text-white truncate">{user.nickname}</h1>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><Shield size={12} /> 账号: <b className="text-zinc-300">{user.username}</b></span>
                <span className="flex items-center gap-1"><Calendar size={12} /> 注册: <b className="text-zinc-300">{createdDate}</b></span>
                {user.eaName && (
                  <span className="flex items-center gap-1">
                    <Gamepad2 size={12} /> Steam: <b className="text-red-400">{user.eaName}</b>
                    <button
                      onClick={() => { if (window.confirm('确定要解除 Steam 账号绑定吗？解绑后个人中心将不再显示战绩数据。')) handleUnbind(); }}
                      className="ml-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-zinc-500 hover:text-red-400 border border-white/5 hover:border-red-500/25 bg-zinc-800/50 hover:bg-red-500/10 transition"
                    >
                      <Unlink size={10} /> 解绑
                    </button>
                  </span>
                )}
              </div>
              {/* Level info from stats */}
              {g && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`chip relative group cursor-help ${
                    ({
                      0: 'bg-emerald-900/50 border-emerald-500/40 text-emerald-300',
                      1: 'bg-blue-900/50 border-blue-500/40 text-blue-300',
                      2: 'bg-purple-900/50 border-purple-500/40 text-purple-300',
                      3: 'bg-amber-900/50 border-amber-500/40 text-amber-300',
                    }[g.levelPrestige] || 'bg-red-900/50 border-red-500/40 text-red-300')
                  }`}>
                    Lv.{g.level || '?'}
                    {g.levelPrestige > 0 && (
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-30">
                        <div className="bg-zinc-900 border border-white/10 shadow-xl px-3 py-2 text-[11px] text-zinc-300 whitespace-nowrap">
                          累计等级 Lv.{g.levelPrestige * 500 + (g.level || 0)}
                        </div>
                      </div>
                    )}
                  </span>
                  {g.levelPrestige > 0 && (
                    <span className={`chip relative group cursor-help ${({
                      1: 'bg-blue-900/50 border-blue-500/40 text-blue-300',
                      2: 'bg-purple-900/50 border-purple-500/40 text-purple-300',
                      3: 'bg-amber-900/50 border-amber-500/40 text-amber-300',
                    }[g.levelPrestige] || 'bg-red-900/50 border-red-500/40 text-red-300')}`}>
                      阶段 {g.levelPrestige + 1}
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-30">
                        <div className="bg-zinc-900 border border-white/10 shadow-xl px-3 py-2 text-[11px] text-zinc-300 whitespace-nowrap space-y-0.5">
                          {Array.from({ length: g.levelPrestige + 1 }, (_, i) => (
                            <div key={i} className={i === g.levelPrestige ? 'text-amber-300 font-bold' : 'text-zinc-500'}>
                              Lv.{i * 500 + 1} - Lv.{(i + 1) * 500}　阶段 {i + 1} {i === g.levelPrestige ? ' ◀ 当前' : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    </span>
                  )}
                  <span className={`chip ${({
                    PC: 'bg-blue-900/50 border-blue-500/40 text-blue-300',
                    PS4: 'bg-indigo-900/50 border-indigo-500/40 text-indigo-300',
                    X1: 'bg-emerald-900/50 border-emerald-500/40 text-emerald-300',
                    SWITCH: 'bg-red-900/50 border-red-500/40 text-red-300',
                  }[g.platform] || 'bg-zinc-800 border-zinc-600/40 text-zinc-300')}`}>
                    {{ PC: 'PC', PS4: 'PS', X1: 'Xbox', SWITCH: 'NS' }[g.platform] || g.platform || 'PC'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Game Stats */}
      {user.eaName && (
        <section className="relative border border-white/5 bg-zinc-950/60 shadow-2xl shadow-black/30 backdrop-blur-sm overflow-hidden">
          <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(239,68,68,0.06),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(59,130,246,0.04),transparent_50%)]" />
          <div className="relative z-10 p-6 space-y-5">
            {/* Header with refresh */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Gamepad2 size={15} className="text-cyan-400" /> 游戏战绩
              </h2>
              <div className="flex items-center gap-3">
                {fetchedAt && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-600">
                    <Clock size={11} /> {timeAgo(fetchedAt)}更新
                  </span>
                )}
                <button
                  onClick={fetchStats}
                  disabled={statsLoading}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-zinc-800/80 border border-white/10 text-zinc-400 hover:text-white hover:border-cyan-500/30 transition disabled:opacity-50"
                >
                  <RefreshCw size={12} className={statsLoading ? 'animate-spin' : ''} />
                  {statsLoading ? '刷新中...' : '刷新'}
                </button>
              </div>
            </div>

            {statsError && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{statsError}</div>
            )}

            {statsLoading && !stats && (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {stats && g && (
              <div className="space-y-4">
                {/* Rank cards */}
                <div className="grid grid-cols-2 gap-3">
                  {rankName && (
                    <div className={`relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/60 border border-white/[0.08] border-l-2 ${RANK_BORDER[rankName] || 'border-l-zinc-500'} p-4 hover:border-white/15 transition-all shadow-lg ${RANK_GLOW[rankName] || ''} overflow-hidden`}>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent" />
                      <div className="relative">
                        <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">大逃杀排位</div>
                        <div className="flex items-center gap-3">
                          {g.rank?.rankImg && <img src={g.rank.rankImg} alt="" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" />}
                          <div>
                            <div className={`text-base font-bold ${RANK_COLORS[rankName] || 'text-white'}`}>
                              {RANK_CN[rankName] || rankName} #{rankDiv}
                            </div>
                            <div className="text-[11px] text-zinc-400">{rankScore?.toLocaleString()} 排位分</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {arenaName && (
                    <div className={`relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/60 border border-white/[0.08] border-l-2 ${RANK_BORDER[arenaName] || 'border-l-zinc-500'} p-4 hover:border-white/15 transition-all shadow-lg ${RANK_GLOW[arenaName] || ''} overflow-hidden`}>
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent" />
                      <div className="relative">
                        <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">竞技场排位</div>
                        <div className="flex items-center gap-3">
                          {g.arena?.rankImg && <img src={g.arena.rankImg} alt="" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]" />}
                          <div>
                            <div className={`text-base font-bold ${RANK_COLORS[arenaName] || 'text-white'}`}>
                              {RANK_CN[arenaName] || arenaName} #{arenaDiv}
                            </div>
                            <div className="text-[11px] text-zinc-400">{arenaScore?.toLocaleString()} 排位分</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Key stat cards */}
                {statCards.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {statCards.map(s => (
                      <div key={s.label} className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-950/60 border border-white/[0.08] border-l-2 border-l-red-500/60 p-4 hover:border-red-500/25 transition-all shadow-lg shadow-red-500/[0.03] group overflow-hidden">
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-red-500/[0.03] to-transparent" />
                        <div className="relative">
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mb-1.5 uppercase tracking-wider">
                            <s.icon size={12} className="text-red-400/70 group-hover:text-red-400 transition-colors" /> {s.label}
                          </div>
                          <div className="text-xl font-bold text-white">
                            {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected legend */}
                {selectedLegend && (
                  <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950/60 border border-white/[0.08] p-4">
                    <div className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">当前角色</div>
                    <div className="flex items-center gap-3">
                      {selectedLegend.ImgAssets?.icon && (
                        <img src={selectedLegend.ImgAssets.icon} alt="" className="w-10 h-10 drop-shadow-lg" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-white">{selectedLegend.LegendName}</div>
                        {selectedLegend.data?.length > 0 && (
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                            {selectedLegend.data.slice(0, 3).map((t, i) => (
                              <span key={i} className="text-[11px]">
                                <span className="text-zinc-500">{t.name}: </span>
                                <span className="text-white font-semibold">{typeof t.value === 'number' ? t.value.toLocaleString() : t.value}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Online status */}
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${g.realtime?.isOnline ? 'bg-green-500' : 'bg-zinc-600'}`} />
                    {g.realtime?.isOnline ? '在线' : '离线'}
                  </span>
                  {g.realtime?.currentStateName && (
                    <span>{g.realtime.currentStateName}</span>
                  )}
                  {selectedLegend?.LegendName && (
                    <span>当前角色: <b className="text-zinc-300">{selectedLegend.LegendName}</b></span>
                  )}
                </div>

                {/* View full stats + Not you? */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-stretch gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      const uid = g?.uid || '';
                      if (uid) navigate(`/stats?q=${uid}`);
                      else navigate(`/stats?q=${encodeURIComponent(user.eaName)}`);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition"
                  >
                    <BarChart3 size={13} /> 查看详细战绩
                  </button>
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-500/5 border border-amber-500/15 flex-1 min-w-0">
                    <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                    <span className="text-xs text-zinc-400">
                      这不是你？同名玩家较多时可能匹配错误。
                    </span>
                    <button
                      onClick={() => navigate(`/stats?q=${encodeURIComponent(user.eaName)}`)}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition"
                    >
                      <Search size={12} />
                      选择正确账号
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!stats && !statsLoading && !statsError && (
              <div className="text-center py-6 text-xs text-zinc-600">
                点击刷新按钮获取战绩数据
              </div>
            )}
          </div>
        </section>
      )}

      {/* Edit profile */}
      <section className="relative border border-white/5 bg-zinc-950/60 shadow-2xl shadow-black/30 backdrop-blur-sm overflow-hidden">
        <div className="pointer-events-none absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="relative z-10 p-6 space-y-5">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User size={15} className="text-amber-400" /> 编辑资料
          </h2>

          {/* Username (read-only) */}
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">登录账号</label>
            <input
              type="text"
              value={user.username}
              disabled
              className="w-full px-3 py-2.5 bg-zinc-900/40 border border-white/5 text-zinc-500 text-sm cursor-not-allowed"
            />
            <p className="text-[10px] text-zinc-600 mt-1">登录账号不支持修改</p>
          </div>

          {/* Nickname */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="显示昵称"
              className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition"
            />
          </div>

          {/* Steam Name */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Steam 昵称</label>
            <input
              type="text"
              value={eaName}
              onChange={e => setEaName(e.target.value)}
              placeholder="绑定 Steam 游戏昵称"
              className="w-full px-3 py-2.5 bg-zinc-900/80 border border-white/10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition"
            />
            <p className="text-[10px] text-zinc-600 mt-1">绑定后可在个人中心查看战绩，也可在战绩查询页一键查询</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>
          )}
          {msg && (
            <div className="px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs">{msg}</div>
          )}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold transition disabled:opacity-50 shadow-lg shadow-red-500/20"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            保存修改
          </button>
        </div>
      </section>

      {/* Logout */}
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-500 hover:text-red-400 border border-white/5 hover:border-red-500/20 bg-zinc-950/40 transition"
        >
          <LogOut size={15} /> 退出登录
        </button>
      </div>
    </div>
  );
}
