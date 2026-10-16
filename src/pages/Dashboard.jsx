import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext.jsx'
import { ContentGate } from '../components/States.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { IconFlame, IconCheck, IconStar, IconNote } from '../components/Icons.jsx'

function Ring({ percent, label }) {
  const r = 38
  const c = 2 * Math.PI * r
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 96 96" className="h-24 w-24 -rotate-90">
        <circle cx="48" cy="48" r={r} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="9" fill="none" />
        <circle
          cx="48"
          cy="48"
          r={r}
          className="stroke-brand-500 transition-all duration-500"
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-slate-900 dark:text-white">{percent}%</span>
        <span className="text-xs text-slate-500">{label}</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const content = useContent()
  const { subjects, allCards, stats, getLesson } = content
  const { done, favorites, notes, quiz, cards, streak, resetAll, exportData, importData } = useProgress()
  const fileRef = useRef(null)

  const doneCount = Object.keys(done).length
  const knownCards = Object.values(cards).filter((v) => v === 'known').length
  const quizEntries = Object.entries(quiz)

  const avgQuiz = useMemo(() => {
    if (!quizEntries.length) return null
    const sum = quizEntries.reduce((s, [, v]) => s + v.score / v.total, 0)
    return Math.round((sum / quizEntries.length) * 100)
  }, [quizEntries])

  // Tat ca hook da goi xong -> an toan de chan som khi chua co du lieu
  if (content.loading || content.error) return <ContentGate content={content}>{null}</ContentGate>

  // Chi thong ke nhung mon that su co bai hoc
  const perSubject = subjects
    .map((s) => {
      const lessons = content.lessonsOf(s.id)
      const total = lessons.length
      const finished = lessons.filter((l) => done[l.id]).length
      return { ...s, total, finished, percent: total ? Math.round((finished / total) * 100) : 0 }
    })
    .filter((s) => s.total > 0)

  const favList = Object.keys(favorites).map(getLesson).filter(Boolean)
  const noteList = Object.entries(notes)
    .map(([id, text]) => ({ lesson: getLesson(id), text }))
    .filter((n) => n.lesson)
  const weakQuiz = quizEntries
    .map(([id, v]) => ({ lesson: getLesson(id), ...v }))
    .filter((r) => r.lesson && r.score / r.total < 0.8)
    .sort((a, b) => a.score / a.total - b.score / b.total)

  function handleExport() {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pathvn-progress-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importData(JSON.parse(reader.result))
        alert('Đã nhập dữ liệu tiến độ thành công.')
      } catch {
        alert('File không hợp lệ.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tiến độ học tập</h1>
        <p className="mt-1.5 text-slate-600 dark:text-slate-400">
          Toàn bộ số liệu dưới đây được lưu trong trình duyệt của bạn.
        </p>
      </header>

      {/* Tổng quan */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center gap-4 p-5">
          <Ring percent={Math.round((doneCount / stats.lessons) * 100)} label="chuyên đề" />
          <div>
            <p className="text-sm text-slate-500">Đã học xong</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {doneCount}/{stats.lessons}
            </p>
          </div>
        </div>

        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400">
            <IconFlame className="h-5 w-5" />
          </span>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{streak.count}</p>
          <p className="text-sm text-slate-500">ngày học liên tiếp</p>
          <p className="mt-1 text-xs text-slate-400">
            Tổng {streak.days?.length ?? 0} ngày có hoạt động
          </p>
        </div>

        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <IconCheck className="h-5 w-5" />
          </span>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {knownCards}
            <span className="text-base font-normal text-slate-400">/{allCards.length}</span>
          </p>
          <p className="text-sm text-slate-500">flashcard đã nhớ</p>
        </div>

        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
            ❓
          </span>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
            {avgQuiz === null ? '—' : `${avgQuiz}%`}
          </p>
          <p className="text-sm text-slate-500">điểm quiz trung bình</p>
          <p className="mt-1 text-xs text-slate-400">Đã làm {quizEntries.length} bài</p>
        </div>
      </section>

      {/* Theo môn */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Tiến độ theo môn</h2>
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {perSubject.map((s) => (
            <div key={s.id} className="flex items-center gap-4 p-4">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-lg`}
              >
                {s.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    to={`/mon-hoc/${s.id}`}
                    className="truncate font-semibold text-slate-900 hover:underline dark:text-white"
                  >
                    {s.name}
                  </Link>
                  <span className="shrink-0 text-sm text-slate-500">
                    {s.finished}/{s.total}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${s.accent} transition-all duration-500`}
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cần ôn lại */}
      {weakQuiz.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Nên ôn lại</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {weakQuiz.map((r) => (
              <Link
                key={r.lesson.id}
                to={`/bai-hoc/${r.lesson.id}`}
                className="card focus-ring flex items-center gap-3 p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
              >
                <span className="text-lg">{r.lesson.subjectIcon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-slate-900 dark:text-white">
                    {r.lesson.title}
                  </span>
                  <span className="text-xs text-slate-500">{r.lesson.subjectName}</span>
                </span>
                <span className="shrink-0 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                  {r.score}/{r.total}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Đánh dấu & ghi chú */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <IconStar className="h-4 w-4 text-amber-500" /> Bài đã đánh dấu ({favList.length})
          </h3>
          {favList.length === 0 ? (
            <p className="text-sm text-slate-500">Chưa có bài nào. Nhấn ★ ở bất kì bài học để lưu lại.</p>
          ) : (
            <ul className="space-y-2">
              {favList.map((l) => (
                <li key={l.id}>
                  <Link
                    to={`/bai-hoc/${l.id}`}
                    className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-400"
                  >
                    <span>{l.subjectIcon}</span>
                    <span className="truncate">{l.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
            <IconNote className="h-4 w-4 text-brand-600" /> Ghi chú ({noteList.length})
          </h3>
          {noteList.length === 0 ? (
            <p className="text-sm text-slate-500">
              Chưa có ghi chú. Mở một bài học và viết vào khung “Ghi chú của bạn”.
            </p>
          ) : (
            <ul className="space-y-3">
              {noteList.map(({ lesson, text }) => (
                <li key={lesson.id}>
                  <Link
                    to={`/bai-hoc/${lesson.id}`}
                    className="text-sm font-semibold text-slate-900 hover:underline dark:text-white"
                  >
                    {lesson.title}
                  </Link>
                  <p className="mt-0.5 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Dữ liệu */}
      <section className="card p-5">
        <h3 className="font-bold text-slate-900 dark:text-white">Dữ liệu của bạn</h3>
        <p className="mt-1 text-sm text-slate-500">
          Xuất ra file JSON để sao lưu hoặc chuyển sang máy khác.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="focus-ring rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ⬇ Xuất dữ liệu
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="focus-ring rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            ⬆ Nhập dữ liệu
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImport} />
          <button
            type="button"
            onClick={() => {
              if (confirm('Xoá toàn bộ tiến độ, ghi chú, điểm quiz và flashcard? Không thể hoàn tác.')) {
                resetAll()
              }
            }}
            className="focus-ring rounded-xl border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            Xoá toàn bộ tiến độ
          </button>
        </div>
      </section>
    </div>
  )
}
