import { Coins, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '../api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Loader, ErrorBox } from '../components/Loader.jsx';

export default function CoinsPage() {
  const { data, loading, error, reload } = useFetch(api.coins, []);
  if (loading) return <Loader />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl text-white">Apex 金币购买比例</h1>
        <p className="text-zinc-400 text-sm mt-1">对比每档金币包的性价比(单位:金币/元 · 金币/美元)。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.packs.map((p) => {
          const best = p.coins === data.bestValue;
          return (
            <div
              key={p.coins}
              className={`card p-5 relative ${best ? 'border-apex-orange/70 shadow-lg shadow-apex-orange/10' : ''}`}
            >
              {best && (
                <span className="absolute -top-2 right-3 chip rarity-legendary">
                  <TrendingUp size={12} /> 最佳性价比
                </span>
              )}
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <Coins size={16} /> 金币包
              </div>
              <div className="font-display text-5xl text-amber-400 mt-2 leading-none">{p.coins.toLocaleString()}</div>
              {p.bonus > 0 && (
                <div className="text-sm text-apex-orange mt-1 flex items-center gap-1">
                  <Sparkles size={14} /> 额外赠送 {p.bonus}(共 {p.totalCoins.toLocaleString()})
                </div>
              )}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-white text-2xl">¥{p.priceCNY}</span>
                <span className="text-zinc-400 text-sm">${p.priceUSD}</span>
              </div>
              <div className="mt-3 text-sm text-zinc-300 space-y-1">
                <div>每元 {p.coinsPerCNY} 币</div>
                <div>每美元 {p.coinsPerUSD} 币</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-zinc-500">
        * 人民币价格为参考(iOS/安卓渠道或区域不同价格可能有差异)。
      </div>
      <button className="btn" onClick={reload}>刷新</button>
    </div>
  );
}
