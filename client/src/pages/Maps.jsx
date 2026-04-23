import { useEffect, useState } from 'react';
import { Map, Clock, ArrowRight } from 'lucide-react';
import { api } from '../api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Loader, ErrorBox } from '../components/Loader.jsx';
import { zhMap, zhEvent, mapSlug } from '../i18n/maps.js';

// 地图缩略图,按 /public/maps/<slug>.jpg 查找。加载失败自动隐藏整块。
function MapThumb({ slug, aspect = 'aspect-[16/9]' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [slug]);
  if (!slug || failed) return null;
  return (
    <div className={`${aspect} bg-zinc-900 overflow-hidden rounded-t-lg border-b border-apex-border`}>
      <img
        src={`/maps/${slug}.jpg`}
        alt=""
        loading="lazy"
        className="w-full h-full object-cover"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function fmt(sec) {
  if (sec == null) return '--';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h > 0 ? h + '时 ' : ''}${m}分 ${s}秒`;
}

function ModeCard({ title, mode }) {
  const [remaining, setRemaining] = useState(mode?.current?.remainingSecs ?? 0);

  useEffect(() => {
    setRemaining(mode?.current?.remainingSecs ?? 0);
    const id = setInterval(() => setRemaining((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [mode]);

  if (!mode) return null;

  const cur = mode.current || {};
  const next = mode.next || {};
  const curName = cur.map ? zhMap(cur.map) : cur.eventName ? zhEvent(cur.eventName) : '—';
  const nextName = next.map ? zhMap(next.map) : next.eventName ? zhEvent(next.eventName) : '—';
  const hasData = cur.map || cur.eventName || next.map || next.eventName;

  if (!hasData) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
          <Map size={16} /> {title}
        </div>
        <div className="text-sm text-zinc-500">当前无活动轮换</div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
        <Map size={16} /> {title}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
        <div className="rounded-lg border border-apex-red/50 bg-gradient-to-br from-apex-red/20 to-transparent overflow-hidden flex flex-col">
          <MapThumb slug={mapSlug(cur.map)} />
          <div className="p-4 flex-1">
            <div className="text-xs text-zinc-300">当前</div>
            <div className="font-display text-3xl text-white mt-1">{curName}</div>
            {cur.eventName && cur.map && <div className="text-xs text-amber-300 mt-1">{zhEvent(cur.eventName)}</div>}
            <div className="flex items-center gap-1 text-sm text-zinc-300 mt-3">
              <Clock size={14} /> 剩余 {fmt(remaining)}
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center text-zinc-500">
          <ArrowRight />
        </div>
        <div className="rounded-lg border border-apex-border overflow-hidden flex flex-col">
          <MapThumb slug={mapSlug(next.map)} />
          <div className="p-4 flex-1">
            <div className="text-xs text-zinc-400">下一张</div>
            <div className="font-display text-2xl text-white mt-1">{nextName}</div>
            {next.eventName && next.map && <div className="text-xs text-amber-300 mt-1">{zhEvent(next.eventName)}</div>}
            <div className="text-sm text-zinc-400 mt-3">时长 {next.DurationInMinutes ?? '--'} 分</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Maps() {
  const { data, loading, error, reload } = useFetch(api.maps, []);
  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-white">地图轮换</h1>
        <button className="btn" onClick={reload}>刷新</button>
      </div>
      {data._mock && (
        <div className="card p-3 text-sm text-amber-300 border-amber-500/40">
          当前使用模拟数据。请在 <code>server/.env</code> 配置 <code>APEX_API_KEY</code> 以获取真实轮换。
        </div>
      )}
      <ModeCard title="大逃杀 (Pubs)" mode={data.battle_royale} />
      <ModeCard title="排位" mode={data.ranked} />
      <ModeCard title="混合模式 / LTM" mode={data.ltm} />
    </div>
  );
}
