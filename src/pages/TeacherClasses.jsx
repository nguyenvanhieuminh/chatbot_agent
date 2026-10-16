import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { useApi } from '../lib/useApi.js'
import { useContent } from '../context/ContentContext.jsx'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import { GRADES } from '../../shared/curriculum.js'
import ClassCode from '../components/ClassCode.jsx'

export default function TeacherClasses() {
  const { data, loading, error, reload } = useApi(() => api.teacherClasses())
  const content = useContent()
  const [creating, setCreating] = useState(false)

  if (loading) return <Loading label="Đang tải lớp của bạn…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const classes = data?.classes ?? []
  const active = classes.filter((c) => !c.archived)
  const archived = classes.filter((c) => c.archived)

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Khu giáo viên</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Lớp tôi dạy
          </h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            Tạo lớp, đưa mã cho học sinh, rồi giao bài kiểm tra.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="focus-ring shrink-0 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {creating ? 'Đóng' : '+ Tạo lớp mới'}
        </button>
      </header>

      {creating && (
        <CreateClassForm
          subjects={content.subjects ?? []}
          onDone={() => {
            setCreating(false)
            reload()
          }}
        />
      )}

      {!classes.length && !creating ? (
        <EmptyState
          icon="🏫"
          title="Bạn chưa có lớp nào"
          desc="Tạo lớp đầu tiên, hệ thống sẽ sinh mã để học sinh tham gia."
          action={
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="focus-ring rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Tạo lớp đầu tiên
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((c) => (
            <ClassCard key={c.id} cls={c} />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-500">Lớp đã lưu trữ</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((c) => (
              <ClassCard key={c.id} cls={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ClassCard({ cls }) {
  return (
    <div className={`card flex h-full flex-col p-4 ${cls.archived ? 'opacity-60' : ''}`}>
      <Link
        to={`/giao-vien/lop/${cls.id}`}
        className="focus-ring rounded text-base font-semibold text-slate-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-400"
      >
        {cls.name}
      </Link>
      <p className="mt-1 text-xs text-slate-500">
        {cls.grade ? `Lớp ${cls.grade}` : 'Không gắn khối lớp'}
        {cls.subjectId ? ` · ${cls.subjectId}` : ''}
      </p>

      <div className="mt-3">
        <ClassCode code={cls.code} />
      </div>

      <div className="mt-auto flex gap-4 pt-4 text-xs text-slate-500">
        <span>{cls.memberCount ?? 0} học sinh</span>
        <span>{cls.assignmentCount ?? 0} đề bài</span>
      </div>
    </div>
  )
}

function CreateClassForm({ subjects, onDone }) {
  const [form, setForm] = useState({ name: '', grade: '', subjectId: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.teacherCreateClass({
        name: form.name,
        grade: form.grade || undefined,
        subjectId: form.subjectId || undefined,
      })
      onDone()
    } catch (err) {
      setError(err?.message || 'Không tạo được lớp.')
    } finally {
      setBusy(false)
    }
  }

  const input =
    'focus-ring w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="sm:col-span-3">
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tên lớp
          </span>
          <input
            value={form.name}
            onChange={set('name')}
            required
            autoFocus
            maxLength={80}
            placeholder="Toán 10A1"
            className={input}
          />
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Khối lớp
          </span>
          <select value={form.grade} onChange={set('grade')} className={input}>
            <option value="">Không gắn</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Lớp {g}
              </option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Môn học
          </span>
          <select value={form.subjectId} onChange={set('subjectId')} className={input}>
            <option value="">Không gắn</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-xs text-slate-500">
        Gắn khối lớp và môn giúp dashboard tính đúng tiến độ lý thuyết của lớp.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="focus-ring rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? 'Đang tạo…' : 'Tạo lớp'}
      </button>
    </form>
  )
}
