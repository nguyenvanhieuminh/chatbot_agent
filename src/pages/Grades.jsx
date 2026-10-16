import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { ContentGate } from '../components/States.jsx'

const TIER_STYLE = {
  'tieu-hoc': {
    band: 'from-amber-400 to-orange-500',
    soft: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
  },
  thcs: {
    band: 'from-sky-500 to-cyan-500',
    soft: 'bg-sky-50 dark:bg-sky-500/10',
    text: 'text-sky-700 dark:text-sky-300',
  },
  thpt: {
    band: 'from-brand-500 to-indigo-600',
    soft: 'bg-brand-50 dark:bg-brand-500/10',
    text: 'text-brand-700 dark:text-brand-300',
  },
}

export default function Grades() {
  const content = useContent()
  const { done } = useProgress()

  return (
    <ContentGate content={content}>
      <div className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Chọn khối lớp
          </h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            Lý thuyết được sắp theo đúng chương trình từ lớp 1 đến lớp 12. Chọn lớp của bạn để xem
            các môn và chuyên đề tương ứng.
          </p>
        </header>

        {content.tiers.map((tier) => {
          const style = TIER_STYLE[tier.id] ?? TIER_STYLE.thpt
          const tierLessons = content.allLessons.filter((l) => tier.grades.includes(l.grade))
          const tierDone = tierLessons.filter((l) => done[l.id]).length

          return (
            <section key={tier.id}>
              <div className="mb-4 border-b border-slate-200 pb-3 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{tier.name}</h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Lớp {tier.grades[0]}–{tier.grades[tier.grades.length - 1]} ·{' '}
                  {tierLessons.length} chuyên đề
                  {tierDone > 0 && ` · đã học ${tierDone}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {tier.grades.map((grade) => {
                  const stat = content.gradeStats.find((g) => g.grade === grade)
                  const lessons = content.allLessons.filter((l) => l.grade === grade)
                  const finished = lessons.filter((l) => done[l.id]).length
                  const percent = lessons.length ? Math.round((finished / lessons.length) * 100) : 0

                  return (
                    <Link
                      key={grade}
                      to={`/lop/${grade}`}
                      className="card focus-ring group flex flex-col p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                    >
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-medium text-slate-400">Lớp</span>
                        <span
                          className={`text-3xl font-bold leading-none ${style.text} transition-transform group-hover:scale-105`}
                        >
                          {grade}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${style.band} transition-all`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        {finished > 0 && (
                          <p className="mt-1 text-xs text-slate-500">
                            {finished}/{lessons.length} đã học
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </ContentGate>
  )
}
