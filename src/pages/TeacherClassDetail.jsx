import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { useApi } from '../lib/useApi.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import ClassCode from '../components/ClassCode.jsx'
import { formatDateTime, formatDue } from '../lib/datetime.js'

const TABS = [
  { key: 'dashboard', label: 'Tổng quan' },
  { key: 'assignments', label: 'Đề bài' },
  { key: 'members', label: 'Học sinh' },
]

export default function TeacherClassDetail() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')

  const { data, loading, error, reload } = useApi(() => api.teacherDashboard(classId), [classId])
  const detail = useApi(() => api.teacherClass(classId), [classId])

  if (loading) return <Loading label="Đang tải lớp…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const cls = data.class
  const reloadAll = () => {
    reload()
    detail.reload()
  }

  async function removeClass() {
    if (!confirm(`Xoá lớp "${cls.name}"? Toàn bộ đề bài và bài nộp của lớp sẽ mất và không khôi phục được.`))
      return
    try {
      await api.teacherDeleteClass(cls.id)
      navigate('/giao-vien', { replace: true })
    } catch (err) {
      alert(err?.message || 'Không xoá được lớp.')
    }
  }

  return (
    <div className="space-y-7">
      <header>
        <Link to="/giao-vien" className="focus-ring text-sm text-slate-500 hover:underline">
          ← Lớp tôi dạy
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {cls.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {cls.grade ? `Lớp ${cls.grade}` : 'Không gắn khối lớp'}
              {cls.subjectId ? ` · ${cls.subjectId}` : ''} · tạo {formatDateTime(cls.createdAt)}
            </p>
          </div>
          <JoinCodePanel cls={cls} onRotated={reloadAll} />
        </div>
      </header>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`focus-ring -mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
            {t.key === 'members' && ` (${data.summary.memberCount})`}
            {t.key === 'assignments' && ` (${data.summary.assignmentCount})`}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <DashboardTab data={data} />}
      {tab === 'assignments' && <AssignmentsTab classId={cls.id} data={data} onChange={reloadAll} />}
      {tab === 'members' && (
        <MembersTab classId={cls.id} detail={detail} students={data.students} onChange={reloadAll} />
      )}

      <footer className="border-t border-slate-200 pt-5 dark:border-slate-800">
        <button
          type="button"
          onClick={removeClass}
          className="focus-ring rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
        >
          Xoá lớp này
        </button>
      </footer>
    </div>
  )
}

function JoinCodePanel({ cls, onRotated }) {
  const [busy, setBusy] = useState(false)

  async function rotate() {
    if (!confirm('Đổi mã lớp? Học sinh đã ở trong lớp vẫn ở lại, nhưng mã cũ sẽ không dùng được nữa.'))
      return
    setBusy(true)
    try {
      await api.teacherRotateCode(cls.id)
      onRotated()
    } catch (err) {
      alert(err?.message || 'Không đổi được mã.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
      <p className="label mb-2">Mã tham gia</p>
      <ClassCode code={cls.code} size="lg" />
      <button
        type="button"
        onClick={rotate}
        disabled={busy}
        className="focus-ring mt-2 text-xs text-slate-500 hover:underline disabled:opacity-60"
      >
        Đổi mã khác
      </button>
    </div>
  )
}

/* ---------------------------- Tab tong quan ---------------------------- */

function DashboardTab({ data }) {
  const { summary, students } = data

  if (!students.length) {
    return (
      <EmptyState
        icon="👋"
        title="Chưa có học sinh nào tham gia"
        desc="Đưa mã tham gia ở trên cho học sinh để các em vào lớp."
      />
    )
  }

  return (
    <div className="space-y-6">
      <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
        <Stat label="Học sinh" value={summary.memberCount} />
        <Stat label="Đề đã giao" value={summary.publishedCount} />
        <Stat
          label="Điểm TB lớp"
          value={summary.classAvgPercent === null ? '—' : `${summary.classAvgPercent}%`}
        />
        <Stat label="Bài lý thuyết" value={summary.lessonsTotal} />
      </dl>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
              <th className="py-2.5 pr-4 font-medium">Học sinh</th>
              <th className="py-2.5 pr-4 font-medium">Đã nộp</th>
              <th className="py-2.5 pr-4 font-medium">Điểm TB</th>
              <th className="py-2.5 font-medium">Lý thuyết đã học</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/60">
                <td className="py-2.5 pr-4">
                  <span className="font-medium text-slate-900 dark:text-white">{s.displayName}</span>
                  <span className="ml-2 text-xs text-slate-400">@{s.username}</span>
                </td>
                <td className="py-2.5 pr-4 text-slate-600 dark:text-slate-400">
                  {s.submitted}/{s.assignmentsTotal}
                </td>
                <td className="py-2.5 pr-4">
                  {s.avgPercent === null ? (
                    <span className="text-slate-400">—</span>
                  ) : (
                    <span className={scoreTone(s.avgPercent)}>{s.avgPercent}%</span>
                  )}
                </td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: s.lessonsTotal
                            ? `${Math.round((s.lessonsDone / s.lessonsTotal) * 100)}%`
                            : '0%',
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {s.lessonsDone}/{s.lessonsTotal}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        Tiến độ lý thuyết chỉ tính các bài thuộc khối lớp và môn của lớp này, và chỉ ghi nhận khi
        học sinh đã đăng nhập.
      </p>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <dd className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</dd>
      <dt className="mt-0.5 text-sm text-slate-500">{label}</dt>
    </div>
  )
}

function scoreTone(percent) {
  if (percent >= 80) return 'font-semibold text-emerald-600 dark:text-emerald-400'
  if (percent >= 50) return 'font-semibold text-amber-600 dark:text-amber-400'
  return 'font-semibold text-rose-600 dark:text-rose-400'
}

/* ----------------------------- Tab de bai ----------------------------- */

function AssignmentsTab({ classId, data, onChange }) {
  async function remove(a) {
    if (!confirm(`Xoá đề "${a.title}"? Bài nộp của học sinh cho đề này cũng mất.`)) return
    try {
      await api.teacherDeleteAssignment(a.id)
      onChange()
    } catch (err) {
      alert(err?.message || 'Không xoá được đề.')
    }
  }

  return (
    <div className="space-y-4">
      <Link
        to={`/giao-vien/lop/${classId}/de/moi`}
        className="focus-ring inline-flex rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        + Tạo đề mới
      </Link>

      {!data.assignments.length ? (
        <EmptyState icon="📝" title="Chưa có đề bài nào" desc="Tạo đề mới hoặc lấy đề từ bài học có sẵn." />
      ) : (
        <div className="space-y-3">
          {data.assignments.map((a) => (
            <div key={a.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/giao-vien/de/${a.id}`}
                    className="focus-ring rounded font-semibold text-slate-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-400"
                  >
                    {a.title}
                  </Link>
                  {a.published ? (
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      Đã giao
                    </span>
                  ) : (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      Nháp
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {a.questionCount} câu · {a.submissionCount} bài nộp
                  {a.avgPercent !== null && ` · TB ${a.avgPercent}%`}
                  {a.dueAt && ` · ${formatDue(a.dueAt)}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/giao-vien/de/${a.id}/bai-nop`}
                  className="focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Xem bài nộp
                </Link>
                <button
                  type="button"
                  onClick={() => remove(a)}
                  className="focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-slate-700 dark:text-red-300 dark:hover:bg-red-950/40"
                >
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------------------------- Tab hoc sinh ---------------------------- */

function MembersTab({ classId, detail, students, onChange }) {
  if (detail.loading) return <Loading label="Đang tải danh sách…" />
  if (detail.error) return <ErrorState message={detail.error} onRetry={detail.reload} />

  const members = detail.data?.members ?? []
  if (!members.length) {
    return <EmptyState icon="👋" title="Chưa có học sinh nào" desc="Đưa mã tham gia cho học sinh." />
  }

  async function remove(m) {
    if (!confirm(`Cho ${m.displayName} ra khỏi lớp?`)) return
    try {
      await api.teacherRemoveMember(classId, m.id)
      onChange()
    } catch (err) {
      alert(err?.message || 'Không xoá được học sinh.')
    }
  }

  return (
    <div className="space-y-3">
      {members.map((m) => {
        const stat = students.find((s) => s.id === m.id)
        return (
          <div key={m.id} className="card flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900 dark:text-white">{m.displayName}</p>
              <p className="mt-0.5 text-xs text-slate-500">
                @{m.username}
                {m.grade ? ` · lớp ${m.grade}` : ''} · vào lớp {formatDateTime(m.joinedAt)}
              </p>
            </div>
            {stat && (
              <span className="text-sm text-slate-600 dark:text-slate-400">
                nộp {stat.submitted}/{stat.assignmentsTotal}
                {stat.avgPercent !== null && ` · TB ${stat.avgPercent}%`}
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(m)}
              className="focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-slate-700 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              Cho ra khỏi lớp
            </button>
          </div>
        )
      })}
    </div>
  )
}
