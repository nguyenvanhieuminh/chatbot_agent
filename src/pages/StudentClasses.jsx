import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useApi } from '../lib/useApi.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import { formatDue, isOverdue } from '../lib/datetime.js'

export default function StudentClasses() {
  const classes = useApi(() => api.studentClasses())
  const assignments = useApi(() => api.studentAssignments())

  if (classes.loading) return <Loading label="Đang tải lớp của bạn…" />
  if (classes.error) return <ErrorState message={classes.error} onRetry={classes.reload} />

  const list = classes.data?.classes ?? []
  const todo = (assignments.data?.assignments ?? []).filter((a) => !a.submission)

  const reloadAll = () => {
    classes.reload()
    assignments.reload()
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="label">Lớp học của tôi</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Lớp và bài kiểm tra
        </h1>
      </header>

      <JoinClassForm onJoined={reloadAll} />

      {todo.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">
            Bài chưa làm ({todo.length})
          </h2>
          <div className="space-y-3">
            {todo.map((a) => (
              <AssignmentRow key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Lớp đã tham gia</h2>
        {!list.length ? (
          <EmptyState
            icon="🎒"
            title="Bạn chưa ở lớp nào"
            desc="Nhập mã lớp giáo viên cho ở phía trên để tham gia."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <div key={c.id} className="card p-4">
                <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  GV {c.teacherName}
                  {c.grade ? ` · lớp ${c.grade}` : ''}
                </p>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  Đã nộp {c.submittedCount}/{c.assignmentCount} bài
                </p>
                <LeaveButton cls={c} onLeft={reloadAll} />
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-sm text-slate-500">
        Xem lại toàn bộ bài kiểm tra (kể cả đã nộp) ở{' '}
        <Link to="/bai-kiem-tra" className="focus-ring font-semibold text-brand-700 hover:underline dark:text-brand-300">
          trang bài kiểm tra
        </Link>
        .
      </p>
    </div>
  )
}

function AssignmentRow({ a }) {
  const overdue = a.dueAt && isOverdue(a.dueAt)
  return (
    <div className="card flex flex-wrap items-center gap-4 p-4">
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
        <span className="text-sm text-slate-400">Đã quá hạn</span>
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
}

function LeaveButton({ cls, onLeft }) {
  const [busy, setBusy] = useState(false)
  async function leave() {
    if (!confirm(`Rời lớp "${cls.name}"? Bài đã nộp vẫn được giữ.`)) return
    setBusy(true)
    try {
      await api.studentLeaveClass(cls.id)
      onLeft()
    } catch (err) {
      alert(err?.message || 'Không rời được lớp.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <button
      type="button"
      onClick={leave}
      disabled={busy}
      className="focus-ring mt-3 text-xs text-slate-500 hover:underline disabled:opacity-60"
    >
      Rời lớp
    </button>
  )
}

function JoinClassForm({ onJoined }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setBusy(true)
    try {
      const res = await api.studentJoinClass(code)
      setOk(`Đã vào lớp "${res.class.name}".`)
      setCode('')
      onJoined()
    } catch (err) {
      setError(err?.message || 'Không vào được lớp.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="card p-5">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Nhập mã lớp
        </span>
        <div className="flex flex-wrap gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="VD: FG6MFY"
            maxLength={12}
            className="focus-ring w-40 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono tracking-[0.2em] uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="submit"
            disabled={busy || !code.trim()}
            className="focus-ring rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy ? 'Đang vào…' : 'Tham gia'}
          </button>
        </div>
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      {ok && <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">{ok}</p>}
    </form>
  )
}
