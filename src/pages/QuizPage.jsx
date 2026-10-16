import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useContent } from '../context/ContentContext.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { ContentGate, EmptyState } from '../components/States.jsx'
import Quiz from '../components/Quiz.jsx'
import { IconQuiz } from '../components/Icons.jsx'

export default function QuizPage() {
  const content = useContent()
  return (
    <ContentGate content={content}>
      <QuizPageInner content={content} />
    </ContentGate>
  )
}

function QuizPageInner({ content }) {
  const [params, setParams] = useSearchParams()
  const subjectId = params.get('mon') ?? 'all'
  const grade = params.get('lop') ?? 'all'
  const lessonId = params.get('bai')
  const { quiz } = useProgress()

  const lessons = useMemo(
    () =>
      content.allLessons.filter(
        (l) =>
          l.quiz?.length &&
          (subjectId === 'all' || l.subjectId === subjectId) &&
          (grade === 'all' || l.grade === Number(grade)),
      ),
    [content.allLessons, subjectId, grade],
  )

  const usedSubjects = useMemo(() => {
    const ids = new Set(content.allLessons.filter((l) => l.quiz?.length).map((l) => l.subjectId))
    return content.subjects.filter((s) => ids.has(s.id))
  }, [content.allLessons, content.subjects])

  const active = lessonId ? content.getLesson(lessonId) : null

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    if (key === 'mon' || key === 'lop') next.delete('bai')
    setParams(next, { replace: true })
  }

  const chip = (act) =>
    `focus-ring rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
      act
        ? 'border-brand-600 bg-brand-600 text-white'
        : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
    }`

  if (active) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => setParam('bai', null)}
          className="focus-ring text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          ← Chọn bài khác
        </button>
        <header>
          <p className="text-sm text-slate-500">
            {active.subjectIcon} {active.subjectName} · Lớp {active.grade}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            {active.title}
          </h1>
          <Link
            to={`/bai-hoc/${active.id}`}
            className="mt-2 inline-block text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            Đọc lại lý thuyết bài này →
          </Link>
        </header>
        <Quiz lessonId={active.id} questions={active.quiz} title="Đề luyện tập" />
      </div>
    )
  }

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Trắc nghiệm</h1>
        <p className="mt-1.5 text-slate-600 dark:text-slate-400">
          Chọn một chuyên đề để luyện tập. Mỗi câu đều có lời giải thích sau khi nộp bài.
        </p>
      </header>

      <div className="card space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Lớp</span>
          <button type="button" className={chip(grade === 'all')} onClick={() => setParam('lop', 'all')}>
            Tất cả
          </button>
          {content.grades.map((g) => (
            <button
              key={g}
              type="button"
              className={chip(String(grade) === String(g))}
              onClick={() => setParam('lop', String(g))}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <button type="button" className={chip(subjectId === 'all')} onClick={() => setParam('mon', 'all')}>
            Tất cả môn
          </button>
          {usedSubjects.map((s) => (
            <button
              key={s.id}
              type="button"
              className={chip(subjectId === s.id)}
              onClick={() => setParam('mon', s.id)}
            >
              {s.icon} {s.short}
            </button>
          ))}
        </div>
      </div>

      {lessons.length === 0 ? (
        <EmptyState
          icon="❓"
          title="Chưa có đề nào khớp bộ lọc"
          desc="Thử chọn lớp khác hoặc bỏ lọc môn."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l) => {
            const best = quiz[l.id]
            const pct = best ? Math.round((best.score / best.total) * 100) : null
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setParam('bai', l.id)}
                className="card focus-ring group p-4 text-left transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${l.tint}`}>
                    {l.subjectIcon} {l.subjectName}
                  </span>
                  <span className="text-xs text-slate-400">Lớp {l.grade}</span>
                </div>
                <h3 className="mt-2 font-semibold text-slate-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
                  {l.title}
                </h3>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <IconQuiz className="h-4 w-4" />
                    {l.quiz.length} câu
                  </span>
                  {pct !== null && (
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                        pct >= 80
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                          : pct >= 50
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
                      }`}
                    >
                      {best.score}/{best.total}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
