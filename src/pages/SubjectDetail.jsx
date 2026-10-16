import { Link, useParams } from 'react-router-dom'
import { useContent } from '../context/ContentContext.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { ContentGate, EmptyState } from '../components/States.jsx'
import LessonCard from '../components/LessonCard.jsx'
import NotFound from './NotFound.jsx'

export default function SubjectDetail() {
  const { subjectId } = useParams()
  const content = useContent()
  const { done } = useProgress()

  return (
    <ContentGate content={content}>
      {(() => {
        const subject = content.getSubject(subjectId)
        if (!subject) return <NotFound />

        const lessons = content.lessonsOf(subject.id)
        const finished = lessons.filter((l) => done[l.id]).length
        const cards = lessons.reduce((s, l) => s + (l.flashcards?.length ?? 0), 0)
        const questions = lessons.reduce((s, l) => s + (l.quiz?.length ?? 0), 0)

        // Nhom bai theo khoi lop de nhin ra lo trinh
        const byGrade = [...new Set(lessons.map((l) => l.grade))].sort((a, b) => a - b)

        return (
          <div className="space-y-8">
            <nav className="text-sm text-slate-500">
              <Link to="/mon-hoc" className="hover:underline">
                Chuyên đề
              </Link>
              <span className="mx-2">/</span>
              <span className="text-slate-700 dark:text-slate-300">{subject.name}</span>
            </nav>

            <header
              className={`animate-fade-up relative overflow-hidden rounded-xl bg-gradient-to-br ${subject.accent} px-6 py-9 text-white sm:px-9`}
            >
              <span className="text-5xl drop-shadow-sm">{subject.icon}</span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{subject.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
                {subject.description}
              </p>

              <div className="mt-6 flex flex-wrap gap-6 text-sm">
                {[
                  ['Chuyên đề', lessons.length],
                  ['Đã hoàn thành', `${finished}/${lessons.length}`],
                  ['Flashcard', cards],
                  ['Câu hỏi', questions],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xl font-bold">{value}</p>
                    <p className="text-xs text-white/80">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                  Có trong lớp: {(subject.grades ?? []).join(', ') || '—'}
                </span>
                <Link
                  to={`/flashcard?mon=${subject.id}`}
                  className="focus-ring rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/30"
                >
                  🗂 Học flashcard môn này
                </Link>
                <Link
                  to={`/trac-nghiem?mon=${subject.id}`}
                  className="focus-ring rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/30"
                >
                  ❓ Làm trắc nghiệm
                </Link>
              </div>
            </header>

            {lessons.length === 0 ? (
              <EmptyState
                icon="📝"
                title={`Môn ${subject.name} chưa có chuyên đề nào`}
                desc="Nội dung sẽ được bổ sung qua trang quản trị."
              />
            ) : (
              byGrade.map((g) => (
                <section key={g}>
                  <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
                    Lớp {g}
                    <Link
                      to={`/lop/${g}/${subject.id}`}
                      className="text-sm font-normal text-brand-700 hover:underline dark:text-brand-300"
                    >
                      xem trong chương trình lớp {g} →
                    </Link>
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {lessons
                      .filter((l) => l.grade === g)
                      .map((l) => (
                        <LessonCard key={l.id} lesson={l} />
                      ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )
      })()}
    </ContentGate>
  )
}
