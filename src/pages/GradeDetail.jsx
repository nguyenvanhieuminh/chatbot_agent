import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useContent } from '../context/ContentContext.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { ContentGate, EmptyState } from '../components/States.jsx'
import LessonCard from '../components/LessonCard.jsx'
import NotFound from './NotFound.jsx'
import { IconArrowLeft, IconArrowRight } from '../components/Icons.jsx'

export default function GradeDetail() {
  const { grade: gradeParam, subjectId } = useParams()
  const grade = Number(gradeParam)
  const content = useContent()
  const { done } = useProgress()
  const navigate = useNavigate()

  const subjects = useMemo(
    () => (content.loading ? [] : content.subjectsOfGrade(grade)),
    [content, grade],
  )

  if (!content.loading && !content.grades.includes(grade)) return <NotFound />

  const active = subjectId ? subjects.find((s) => s.id === subjectId) : null
  const tier = content.tiers.find((t) => t.grades.includes(grade))
  const prevGrade = grade > 1 ? grade - 1 : null
  const nextGrade = grade < 12 ? grade + 1 : null

  return (
    <ContentGate content={content}>
      <div className="space-y-8">
        <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/lop" className="hover:underline">
            Khối lớp
          </Link>
          <span>/</span>
          {active ? (
            <>
              <Link to={`/lop/${grade}`} className="hover:underline">
                Lớp {grade}
              </Link>
              <span>/</span>
              <span className="text-slate-700 dark:text-slate-300">{active.name}</span>
            </>
          ) : (
            <span className="text-slate-700 dark:text-slate-300">Lớp {grade}</span>
          )}
        </nav>

        {/* Header + chuyển lớp nhanh */}
        <header className="card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">
                {tier?.icon} {tier?.name}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Lớp {grade}
              </h1>
              <p className="mt-1.5 text-slate-600 dark:text-slate-400">
                {subjects.length} môn · {subjects.reduce((s, x) => s + x.lessonCount, 0)} chuyên đề
              </p>
            </div>

            <div className="flex items-center gap-2">
              {prevGrade && (
                <Link
                  to={`/lop/${prevGrade}`}
                  className="focus-ring flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <IconArrowLeft className="h-4 w-4" />
                  Lớp {prevGrade}
                </Link>
              )}
              {nextGrade && (
                <Link
                  to={`/lop/${nextGrade}`}
                  className="focus-ring flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Lớp {nextGrade}
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Dải chọn lớp 1..12 */}
          <div className="mt-5 flex flex-wrap gap-1.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            {content.grades.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => navigate(`/lop/${g}`)}
                className={`focus-ring h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                  g === grade
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </header>

        {/* Danh sách môn của lớp */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
            {active ? 'Các môn khác của lớp ' + grade : 'Môn học lớp ' + grade}
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => {
              const finished = s.lessons.filter((l) => done[l.id]).length
              const isActive = s.id === subjectId
              return (
                <Link
                  key={s.id}
                  to={isActive ? `/lop/${grade}` : `/lop/${grade}/${s.id}`}
                  className={`card focus-ring group flex items-center gap-3 p-4 transition-colors hover:border-slate-300 dark:hover:border-slate-700 ${
                    isActive ? 'ring-2 ring-brand-500' : ''
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${s.accent} text-xl`}
                  >
                    {s.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-slate-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
                      {s.name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {s.lessonCount === 0
                        ? 'Chưa có bài'
                        : `${s.lessonCount} chuyên đề${finished ? ` · đã học ${finished}` : ''}`}
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Mục lục theo chương của môn đang chọn */}
        {active && <SubjectToc subject={active} grade={grade} />}

        {/* Khi chưa chọn môn: gợi ý toàn bộ bài của lớp */}
        {!active && (
          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              Tất cả chuyên đề lớp {grade}
            </h2>
            {(() => {
              const lessons = content.allLessons.filter((l) => l.grade === grade)
              if (!lessons.length) {
                return (
                  <EmptyState
                    icon="📝"
                    title={`Lớp ${grade} chưa có chuyên đề nào`}
                    desc="Vào trang quản trị để thêm bài học cho khối lớp này."
                    action={
                      <Link
                        to="/admin/bai-hoc/moi"
                        className="focus-ring inline-block rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                      >
                        Thêm bài học
                      </Link>
                    }
                  />
                )
              }
              return (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {lessons.map((l) => (
                    <LessonCard key={l.id} lesson={l} showSubject />
                  ))}
                </div>
              )
            })()}
          </section>
        )}
      </div>
    </ContentGate>
  )
}

/**
 * Muc luc mot mon trong mot khoi lop: liet ke theo chuong nhu sach giao khoa.
 * Bai chua gan chuong duoc dua xuong cuoi de khong bi an mat.
 */
function SubjectToc({ subject, grade }) {
  const content = useContent()
  const { done } = useProgress()

  const chapters = useMemo(
    () => content.chaptersOf(subject.id, grade),
    [content, subject.id, grade],
  )
  const loose = useMemo(
    () => content.looseLessonsOf(subject.id, grade),
    [content, subject.id, grade],
  )

  const totalLessons = chapters.reduce((s, c) => s + c.lessons.length, 0) + loose.length

  if (totalLessons === 0) {
    return (
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <span>{subject.icon}</span>
          {subject.name} — lớp {grade}
        </h2>
        <EmptyState
          icon="📝"
          title={`Môn ${subject.name} lớp ${grade} chưa có bài học`}
          desc="Nội dung sẽ được bổ sung qua trang quản trị."
        />
      </section>
    )
  }

  const doneCount = [...chapters.flatMap((c) => c.lessons), ...loose].filter((l) => done[l.id]).length

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-white">
          <span>{subject.icon}</span>
          {subject.name} — lớp {grade}
        </h2>
        <p className="text-sm text-slate-500">
          {chapters.length} chương · {totalLessons} bài
          {doneCount > 0 && ` · đã học ${doneCount}`}
        </p>
      </div>

      <div className="space-y-4">
        {chapters.map((ch, i) => (
          <article key={ch.id} className="card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-white">{ch.title}</h3>
              {ch.description && (
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{ch.description}</p>
              )}
            </div>

            {ch.lessons.length === 0 ? (
              <p className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                Chương này chưa có bài học.
              </p>
            ) : (
              <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                {ch.lessons.map((l, j) => (
                  <li key={l.id}>
                    <Link
                      to={`/bai-hoc/${l.id}`}
                      className="focus-ring group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <span className="w-10 shrink-0 text-sm font-semibold tabular-nums text-slate-400">
                        {i + 1}.{j + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-400">
                          {l.title}
                        </span>
                        {l.summary && (
                          <span className="mt-0.5 line-clamp-1 block text-xs text-slate-500 dark:text-slate-400">
                            {l.summary}
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-2 text-xs text-slate-400">
                        {done[l.id] && <span title="Đã học">✓</span>}
                        <span>{l.minutes}′</span>
                        <IconArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </article>
        ))}

        {loose.length > 0 && (
          <article className="card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/40">
              <h3 className="font-bold text-slate-900 dark:text-white">Bài chưa phân chương</h3>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {loose.map((l) => (
                <LessonCard key={l.id} lesson={l} />
              ))}
            </div>
          </article>
        )}
      </div>
    </section>
  )
}
