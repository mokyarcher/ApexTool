import { Hammer } from 'lucide-react';
import { api } from '../api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Loader, ErrorBox } from '../components/Loader.jsx';

export default function Crafting() {
  const { data, loading, error, reload } = useFetch(api.crafting, []);
  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  // API 原始数据是数组,兜底格式也兼容
  const bundles = Array.isArray(data) ? data.filter((x) => x.bundle) : data?.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">制造轮换</h1>
          <p className="text-zinc-400 text-sm mt-1">每日 / 每周制造台物品。</p>
        </div>
        <button className="btn" onClick={reload}>刷新</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bundles.map((b, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Hammer size={16} /> {b.bundle}
            </div>
            <ul className="mt-3 divide-y divide-apex-border">
              {(b.items || []).map((it, j) => (
                <li key={j} className="py-2 flex items-center justify-between">
                  <span className="text-white">{it.name || it.itemType?.asset || it.item}</span>
                  <span className="chip rarity-epic">{it.cost} {it.currency || 'metals'}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
