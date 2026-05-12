import { ExternalLink, Gamepad2, Keyboard, Radio, Search, Shield, Trophy, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Loader, ErrorBox } from '../components/Loader.jsx';

function formatTime(value) {
  if (!value) return '未知';
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function rankColor(rank) {
  if (rank === 1) return 'text-yellow-300';
  if (rank === 2) return 'text-zinc-200';
  if (rank === 3) return 'text-orange-300';
  return 'text-zinc-400';
}

export default function RankedLeaderboard() {
  const { data, loading, error, reload } = useFetch(api.rankedLeaderboard, []);
  const [predator, setPredator] = useState(null);
  const [query, setQuery] = useState('');
  const players = data?.players || [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.name.toLowerCase().includes(q) || p.uid.includes(q));
  }, [players, query]);

  useEffect(() => {
    api.predator().then(setPredator).catch(() => {});
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  const pcPred = predator?.RP?.PC;
  const topRP = players[0]?.rp || 0;
  const lastRP = players[players.length - 1]?.rp || 0;
  const avgRP = players.length ? Math.round(players.reduce((s, p) => s + p.rp, 0) / players.length) : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Main table */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="card p-5 border-red-500/20 bg-gradient-to-r from-red-950/20 to-zinc-950/60">
          <div className="flex items-center gap-2 text-red-300 text-sm mb-2">
            <Trophy size={16} /> 猎杀排行榜
          </div>
          <h1 className="font-display text-3xl text-white">{data.title}</h1>
          <p className="text-zinc-400 text-sm mt-1">
            数据来源: <a className="text-red-300 hover:text-red-200" href={data.sourceUrl} target="_blank" rel="noreferrer">{data.source}</a> · 当前收录 {data.count} 名玩家
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative max-w-sm w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-zinc-950/70 border border-white/10 pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-red-500/60"
              placeholder="搜索玩家名或 UID"
            />
          </div>
          <button className="btn" onClick={reload}>刷新</button>
        </div>

        <div className="card overflow-hidden">
          <div className="hidden md:grid grid-cols-[56px_1fr_140px_80px] gap-3 px-4 py-2.5 text-xs text-zinc-500 border-b border-white/10">
            <div>#</div>
            <div>玩家</div>
            <div className="text-right">Rank 分</div>
            <div>输入</div>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((player) => {
              const InputIcon = player.input === '手柄' ? Gamepad2 : Keyboard;
              return (
                <div key={player.uid} className="grid grid-cols-[48px_1fr] md:grid-cols-[56px_1fr_140px_80px] gap-2 md:gap-3 items-center px-4 py-3 hover:bg-white/[0.03] transition">
                  <div className={`font-display text-xl ${rankColor(player.rank)}`}>#{player.rank}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-white truncate text-sm">{player.name}</span>
                      {player.country && <img src={`https://flagcdn.com/w20/${player.country.toLowerCase()}.png`} alt={player.country} className="h-3.5 shrink-0" title={player.country} />}
                      {player.links.twitter && (
                        <a href={player.links.twitter} target="_blank" rel="noreferrer" className="text-sky-300 hover:text-sky-200 shrink-0"><ExternalLink size={12} /></a>
                      )}
                      {player.links.twitch && (
                        <a href={player.links.twitch} target="_blank" rel="noreferrer" className="text-purple-300 hover:text-purple-200 shrink-0"><Radio size={12} /></a>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">UID {player.uid}{player.level ? ` · Lv.${player.level}` : ''}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-lg font-display leading-none">{player.rp.toLocaleString()}</div>
                    {player.change ? <div className="text-[11px] text-emerald-400 mt-0.5">+{player.change.toLocaleString()}</div> : null}
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400 text-xs">
                    <InputIcon size={14} /> {player.input}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-72 shrink-0 space-y-4">
        {/* Update time */}
        <div className="card p-4">
          <div className="text-xs text-zinc-500 mb-1">最后更新时间</div>
          <div className="text-white font-semibold text-sm">{formatTime(data.importedAt)}</div>
        </div>

        {/* Predator threshold */}
        {pcPred && (
          <div className="card p-4 border-red-500/20">
            <div className="flex items-center gap-2 text-red-300 text-sm mb-3">
              <Shield size={15} /> 猎杀门槛 (PC)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[11px] text-zinc-500">进入猎杀需要</div>
                <div className="text-white text-xl font-display mt-1">{pcPred.val?.toLocaleString()} <span className="text-xs text-zinc-400">RP</span></div>
              </div>
              <div>
                <div className="text-[11px] text-zinc-500">大师 & 猎杀总人数</div>
                <div className="text-white text-xl font-display mt-1">{pcPred.totalMastersAndPreds?.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard stats */}
        <div className="card p-4">
          <div className="flex items-center gap-2 text-zinc-300 text-sm mb-3">
            <Users size={15} /> 榜单统计
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-500">#1 最高分</span>
              <span className="text-white font-display text-lg">{topRP.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-500">#{players.length} 最低分</span>
              <span className="text-white font-display text-lg">{lastRP.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-500">平均 RP</span>
              <span className="text-white font-display text-lg">{avgRP.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-zinc-500">分差 (#1 vs #{players.length})</span>
              <span className="text-amber-300 font-display text-lg">{(topRP - lastRP).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Platform note */}
        <div className="card p-4">
          <div className="text-xs text-zinc-500">当前平台</div>
          <div className="text-white font-semibold text-sm mt-1">PC (Origin/Steam)</div>
          <div className="text-[11px] text-zinc-600 mt-2">PlayStation / Xbox / Switch 暂不支持</div>
        </div>
      </div>
    </div>
  );
}
