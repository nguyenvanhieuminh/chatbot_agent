import { Link } from 'react-router-dom'

/** Khung chung cho trang dang nhap / dang ky. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="focus-ring inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-3xl"
            aria-label="Về trang chủ"
          >
            📚
          </Link>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-slate-600 dark:text-slate-400">{subtitle}</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  )
}

/* ------------------- Cac manh dung lai trong ca 2 trang ------------------- */

export function Field({ label, id, hint, children }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export const inputClass =
  'focus-ring w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 transition-colors disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

export function ErrorBox({ children }) {
  if (!children) return null
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-3.5 dark:border-red-900 dark:bg-red-950/40"
    >
      <p className="text-sm text-red-800 dark:text-red-200">{children}</p>
    </div>
  )
}

export function SubmitButton({ loading, loadingText, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="focus-ring w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? loadingText : children}
    </button>
  )
}
