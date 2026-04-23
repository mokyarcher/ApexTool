export function Loader({ label = '加载中...' }) {
  return (
    <div className="flex items-center justify-center py-16 text-zinc-400">
      <div className="w-5 h-5 border-2 border-apex-red border-t-transparent rounded-full animate-spin mr-3" />
      {label}
    </div>
  );
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="card p-6 text-center">
      <div className="text-red-400 mb-3">加载失败:{String(error)}</div>
      {onRetry && (
        <button className="btn" onClick={onRetry}>
          重试
        </button>
      )}
    </div>
  );
}
