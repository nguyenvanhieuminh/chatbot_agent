import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useApi } from '../lib/useApi.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import { formatDateTime, formatDue, isOverdue } from '../lib/datetime.js'

export default function StudentAssignments() {
  const { data, loading, error, reload } = useApi(() => api.studentAssignments())

  if (loading) return <Loading label="Đang tải bài kiểm tra…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const all = data?.assignments ?? []
  const todo = all.filter((a) => !a.submission)
  const done = all.filter((a) => a.submission)

  return (
    <div className="space-y-8">
      <header>
        <p className="label">Bài kiểm tra</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Bài giáo viên giao
        </h1>
      </header>

      {!all.length ? (
        <EmptyState
          icon="📋"
          title="Chưa có bài nào được giao"
          desc="Khi giáo viên giao đề, bài sẽ hiện ở đây."
          action={
            <Link
              to="/lop-hoc"
              className="focus-ring rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Về lớp của tôi
            </Link>
          }
        />
      ) : (
        <>
          {todo.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">
                Chưa làm ({todo.length})
              </h2>
              <div className="space-y-3">
                {todo.map((a) => {
                  const overdue = a.dueAt && isOverdue(a.dueAt)
                  return (
                    <div key={a.id} className="card flex flex-wrap items-center gap-4 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{a.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {a.className} · {a.questionCount} câu
                          {a.dueAt && (
                            <span className={overdue ? ' text-rose-600 dark:text-rose-400' : ' text-amber-600 dark:text-amber-400'}>
                              {' · '}
                              {formatDue(a.dueAt)}
                            </span>
                          )}
                        </p>
                      </div>
                      {overdue ? (
                        <span className="text-sm text-slate-400">Đã quá hạn, không nộp được</span>
                      ) : (
                        <Link
                          to={`/bai-kiem-tra/${a.id}`}
                          className="focus-ring rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                        >
                          Làm bài
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {done.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">
                Đã nộp ({done.length})
              </h2>
              <div className="space-y-3">
                {done.map((a) => {
                  const s = a.submission
                  const percent = s.total ? Math.round((s.score / s.total) * 100) : null
                  return (
                    <Link
                      key={a.id}
                      to={`/bai-kiem-tra/${a.id}`}
                      className="card focus-ring flex flex-wrap items-center gap-4 p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">{a.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {a.className} · nộp {formatDateTime(s.submittedAt)}
                        </p>
                      </div>
                      <span className={`text-sm ${tone(percent)}`}>
                        {s.score}/{s.total}
                        {percent !== null && <span className="ml-1.5 text-xs">({percent}%)</span>}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

function tone(percent) {
  if (percent === null) return 'text-slate-500'
  if (percent >= 80) return 'font-semibold text-emerald-600 dark:text-emerald-400'
  if (percent >= 50) return 'font-semibold text-amber-600 dark:text-amber-400'
  return 'font-semibold text-rose-600 dark:text-rose-400'
}
