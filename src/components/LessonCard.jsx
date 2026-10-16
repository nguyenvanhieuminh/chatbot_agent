import { Link } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext.jsx'
import { IconCheck, IconStar } from './Icons.jsx'

export default function LessonCard({ lesson, showSubject = false, showGrade = true }) {
  const { isDone, isFavorite, toggleFavorite, quiz } = useProgress()
  const done = isDone(lesson.id)
  const fav = isFavorite(lesson.id)
  const best = quiz[lesson.id]

  return (
    <div className="card group relative flex h-full flex-col p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700">
      <button
        type="button"
        onClick={() => toggleFavorite(lesson.id)}
        aria-label={fav ? 'Bỏ đánh dấu' : 'Đánh dấu bài này'}
        className={`focus-ring absolute right-3 top-3 rounded-lg p-1.5 transition-colors ${
          fav
            ? 'text-amber-500'
            : 'text-slate-300 hover:text-amber-400 dark:text-slate-600 dark:hover:text-amber-400'
        }`}
      >
        <IconStar filled={fav} className="h-4 w-4" />
      </button>

      {/* Thong tin phu: mot dong chu nhat mau, phan cach bang dau · */}
      <div className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 pr-8 text-xs text-slate-500">
        {showSubject && (
          <>
            <span className={`h-1.5 w-1.5 rounded-full ${lesson.dot ?? 'bg-slate-400'}`} />
            <span>{lesson.subjectName}</span>
          </>
        )}
        {showSubject && showGrade && <span className="text-slate-300 dark:text-slate-600">·</span>}
        {showGrade && <span>Lớp {lesson.grade}</span>}
        {done && (
          <>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
              <IconCheck className="h-3.5 w-3.5" /> Đã học
            </span>
          </>
        )}
        {best && (
          <>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="font-medium text-brand-700 dark:text-brand-400">
              {best.score}/{best.total}
            </span>
          </>
        )}
      </div>

      <Link
        to={`/bai-hoc/${lesson.id}`}
        className="focus-ring rounded text-base font-semibold text-slate-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400"
      >
        {lesson.title}
      </Link>

      <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        {lesson.summary}
      </p>
    </div>
  )
}
