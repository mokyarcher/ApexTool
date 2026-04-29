import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Swords, Shield, Wrench } from 'lucide-react';
import { api } from '../api';
import { useFetch } from '../hooks/useFetch';
import { Loader, ErrorBox } from '../components/Loader';

const roleBadge = {
  legendChanges: { label: '传奇改动', icon: Shield, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  weaponChanges: { label: '武器改动', icon: Swords, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  otherChanges:  { label: '其他改动', icon: Wrench, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
};

function PatchCard({ patch }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-white/[0.06] rounded-xl bg-white/[0.02] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition"
      >
        <div className="text-left">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">{patch.title}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
              {patch.season}
            </span>
          </div>
          <div className="text-xs text-zinc-500 mt-1">{patch.date}</div>
          <div className="text-sm text-zinc-400 mt-2">{patch.summary}</div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-zinc-500 shrink-0 ml-4" /> : <ChevronDown size={18} className="text-zinc-500 shrink-0 ml-4" />}
      </button>

      {/* Body */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/[0.06]">
          {/* Legend changes */}
          {patch.legendChanges?.length > 0 && (
            <Section type="legendChanges">
              {patch.legendChanges.map((lc, i) => (
                <ChangeBlock key={i} title={`${lc.legend} (${lc.legendEN})`} items={lc.changes} />
              ))}
            </Section>
          )}

          {/* Weapon changes */}
          {patch.weaponChanges?.length > 0 && (
            <Section type="weaponChanges">
              {patch.weaponChanges.map((wc, i) => (
                <ChangeBlock key={i} title={`${wc.weapon} (${wc.weaponEN})`} items={wc.changes} />
              ))}
            </Section>
          )}

          {/* Other changes */}
          {patch.otherChanges?.length > 0 && (
            <Section type="otherChanges">
              <ul className="space-y-1.5 ml-1">
                {patch.otherChanges.map((c, i) => (
                  <li key={i} className="text-sm text-zinc-300 flex gap-2">
                    <span className="text-zinc-600 mt-0.5">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Source link */}
          {patch.sourceUrl && (
            <a
              href={patch.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition mt-2"
            >
              <ExternalLink size={12} />
              查看 EA 官方原文
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ type, children }) {
  const badge = roleBadge[type];
  const Icon = badge.icon;
  return (
    <div className="pt-4">
      <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded border mb-3 ${badge.color}`}>
        <Icon size={13} />
        {badge.label}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ChangeBlock({ title, items }) {
  return (
    <div className="pl-3 border-l-2 border-white/[0.06]">
      <div className="text-sm font-semibold text-zinc-200 mb-1.5">{title}</div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-zinc-400 flex gap-2">
            <span className="text-zinc-600 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PatchNotes() {
  const { data, loading, error, reload } = useFetch(api.patchNotes);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">更新公告</h1>
        <p className="text-sm text-zinc-500 mt-1">数据来源：EA 官方补丁说明，定期同步更新</p>
      </div>

      {loading && <Loader />}
      {error && <ErrorBox error={error} onRetry={reload} />}

      {!loading && !error && data?.patches?.length > 0 && (
        <div className="space-y-4">
          {data.patches.map(patch => (
            <PatchCard key={patch.id} patch={patch} />
          ))}
        </div>
      )}

      {!loading && !error && (!data?.patches || data.patches.length === 0) && (
        <div className="text-center text-zinc-500 py-16">暂无补丁数据</div>
      )}
    </div>
  );
}
