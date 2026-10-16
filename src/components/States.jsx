import { IconRefresh } from './Icons.jsx'

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Loading({ label = 'Đang tải nội dung…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
      <Spinner className="h-7 w-7 text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry, hint }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <p className="text-4xl">🔌</p>
      <h2 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">Không tải được dữ liệu</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
      {hint && (
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-100 px-3 py-2 text-left text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {hint}
        </pre>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <IconRefresh className="h-4 w-4" />
          Thử lại
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon = '📭', title, desc, action }) {
  return (
    <div className="card p-10 text-center">
      <p className="text-4xl">{icon}</p>
      <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">{title}</p>
      {desc && <p className="mt-1 text-sm text-slate-500">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Boc mot trang can du lieu tu API: tu dong hien loading / loi. */
export function ContentGate({ content, children }) {
  if (content.loading) return <Loading />
  if (content.error) {
    return (
      <ErrorState
        message={content.error}
        onRetry={content.reload}
        hint={'Chạy máy chủ API bằng:\n  npm run dev        (chạy cả API + web)\n  npm run dev:api    (chỉ API)'}
      />
    )
  }
  return children
}
