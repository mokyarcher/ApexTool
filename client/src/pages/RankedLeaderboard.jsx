import { ExternalLink, Gamepad2, Keyboard, Radio, Search, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
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
  const [query, setQuery] = useState('');
  const players = data?.players || [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.name.toLowerCase().includes(q) || p.uid.includes(q));
  }, [players, query]);

  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <div className="card p-5 border-red-500/20 bg-gradient-to-r from-red-950/20 to-zinc-950/60">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-red-300 text-sm mb-2">
              <Trophy size={16} /> 猎杀实时榜
            </div>
            <h1 className="font-display text-3xl text-white">{data.title}</h1>
            <p className="text-zinc-400 text-sm mt-1">
              数据来源: <a className="text-red-300 hover:text-red-200" href={data.sourceUrl} target="_blank" rel="noreferrer">{data.source}</a> · 当前收录 {data.count} 名玩家
            </p>
          </div>
          <div className="text-sm text-zinc-400">
            <div>最后更新时间</div>
            <div className="text-white font-semibold mt-1">{formatTime(data.importedAt)}</div>
          </div>
        </div>
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
        <div className="hidden md:grid grid-cols-[72px_1fr_180px_100px] gap-4 px-5 py-3 text-xs text-zinc-500 border-b border-white/10">
          <div>排名</div>
          <div>玩家</div>
          <div className="text-right">Rank 分</div>
          <div>输入</div>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {filtered.map((player) => {
            const InputIcon = player.input === '手柄' ? Gamepad2 : Keyboard;
            return (
              <div key={player.uid} className="grid grid-cols-[56px_1fr] md:grid-cols-[72px_1fr_180px_100px] gap-3 md:gap-4 items-center px-5 py-4 hover:bg-white/[0.03] transition">
                <div className={`font-display text-2xl ${rankColor(player.rank)}`}>#{player.rank}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-white truncate">{player.name}</span>
                    {player.country && <span className="text-[10px] px-1.5 py-0.5 bg-white/10 text-zinc-300">{player.country}</span>}
                    {player.links.twitter && (
                      <a href={player.links.twitter} target="_blank" rel="noreferrer" className="text-sky-300 hover:text-sky-200 shrink-0"><ExternalLink size={13} /></a>
                    )}
                    {player.links.twitch && (
                      <a href={player.links.twitch} target="_blank" rel="noreferrer" className="text-purple-300 hover:text-purple-200 shrink-0"><Radio size={13} /></a>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">UID {player.uid}{player.level ? ` · 等级 ${player.level}` : ''}</div>
                </div>
                <div className="md:text-right">
                  <div className="inline-flex flex-col items-end px-3 py-2 bg-red-500/10 border border-red-500/20 min-w-[132px]">
                    <div className="text-[10px] text-red-300/80 tracking-wider uppercase">Rank Score</div>
                    <div className="text-white text-2xl font-display leading-none mt-1">{player.rp.toLocaleString()}</div>
                    {player.change ? <div className="text-xs text-emerald-400 mt-1">+{player.change.toLocaleString()}</div> : null}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400 text-sm">
                  <InputIcon size={15} /> {player.input}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
