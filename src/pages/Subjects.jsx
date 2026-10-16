import { useMemo, useState } from 'react'
import { useContent } from '../context/ContentContext.jsx'
import { normalize } from '../lib/search.js'
import { useProgress } from '../context/ProgressContext.jsx'
import { ContentGate, EmptyState } from '../components/States.jsx'
import LessonCard from '../components/LessonCard.jsx'

export default function Subjects() {
  const content = useContent()
  const { done, favorites } = useProgress()
  const [subject, setSubject] = useState('all')
  const [grade, setGrade] = useState('all')
  const [filter, setFilter] = useState('all') // all | todo | done | fav
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const nq = normalize(q)
    return content.allLessons.filter((l) => {
      if (subject !== 'all' && l.subjectId !== subject) return false
      if (grade !== 'all' && l.grade !== Number(grade)) return false
      if (filter === 'done' && !done[l.id]) return false
      if (filter === 'todo' && done[l.id]) return false
      if (filter === 'fav' && !favorites[l.id]) return false
      if (nq.length >= 2) {
        const hay = normalize(`${l.title} ${l.summary} ${(l.keywords ?? []).join(' ')}`)
        if (!hay.includes(nq)) return false
      }
      return true
    })
  }, [content.allLessons, subject, grade, filter, q, done, favorites])

  // Chi hien mon that su co bai, cho danh sach loc gon gang
  const usedSubjects = useMemo(() => {
    const ids = new Set(content.allLessons.map((l) => l.subjectId))
    return content.subjects.filter((s) => ids.has(s.id))
  }, [content.allLessons, content.subjects])

  const chip = (active) =>
    `focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
      active
        ? 'border-brand-600 bg-brand-600 text-white'
        : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
    }`

  return (
    <ContentGate content={content}>
      <div className="space-y-7">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tất cả chuyên đề
          </h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            {content.allLessons.length} chuyên đề trên {usedSubjects.length} môn. Lọc theo môn, khối
            lớp hoặc tình trạng học.
          </p>
        </header>

        <div className="card space-y-4 p-4">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm trong danh sách chuyên đề…"
            className="focus-ring w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950/60"
          />

          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip(subject === 'all')} onClick={() => setSubject('all')}>
              Tất cả môn
            </button>
            {usedSubjects.map((s) => (
              <button
                key={s.id}
                type="button"
                className={chip(subject === s.id)}
                onClick={() => setSubject(s.id)}
              >
                {s.icon} {s.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Lớp
            </span>
            <button type="button" className={chip(grade === 'all')} onClick={() => setGrade('all')}>
              Tất cả
            </button>
            {content.grades.map((g) => (
              <button
                key={g}
                type="button"
                className={chip(String(grade) === String(g))}
                onClick={() => setGrade(g)}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Trạng thái
            </span>
            {[
              ['all', 'Tất cả'],
              ['todo', 'Chưa học'],
              ['done', 'Đã học'],
              ['fav', '★ Đánh dấu'],
            ].map(([key, label]) => (
              <button key={key} type="button" className={chip(filter === key)} onClick={() => setFilter(key)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500">Tìm thấy {list.length} chuyên đề.</p>

        {list.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="Không có chuyên đề nào khớp"
            desc="Thử bỏ bớt điều kiện lọc hoặc đổi từ khoá."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((l) => (
              <LessonCard key={l.id} lesson={l} showSubject={subject === 'all'} showGrade />
            ))}
          </div>
        )}
      </div>
    </ContentGate>
  )
}
