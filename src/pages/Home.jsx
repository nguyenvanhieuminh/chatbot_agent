import { Link } from 'react-router-dom'
import { useContent } from '../context/ContentContext.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { ContentGate } from '../components/States.jsx'
import LessonCard from '../components/LessonCard.jsx'
import HomeSidebar from '../components/HomeSidebar.jsx'
import { IconSearch, IconCards, IconQuiz, IconArrowRight, IconFlame } from '../components/Icons.jsx'

const FEATURES = [
  {
    Icon: IconSearch,
    title: 'Tổng hợp lý thuyết',
    desc: 'Công thức, bảng so sánh, ví dụ mẫu và cảnh báo lỗi thường gặp — sắp theo đúng chương trình từng lớp.',
  },
  {
    Icon: IconCards,
    title: 'Flashcard ghi nhớ',
    desc: 'Lật thẻ hai mặt, đánh dấu “đã nhớ / cần ôn lại”, trộn thẻ để kiểm tra thật.',
  },
  {
    Icon: IconQuiz,
    title: 'Trắc nghiệm có giải thích',
    desc: 'Làm bài, xem đáp án kèm lời giải và lưu lại điểm tốt nhất từng bài.',
  },
]

export default function Home({ onOpenSearch }) {
  const content = useContent()
  const { done, streak } = useProgress()

  return (
    <ContentGate content={content}>
      <HomeInner content={content} done={done} streak={streak} onOpenSearch={onOpenSearch} />
    </ContentGate>
  )
}

function HomeInner({ content, done, streak, onOpenSearch }) {
  const { stats, tiers, gradeStats, allLessons } = content
  const doneCount = Object.keys(done).filter((id) => content.getLesson(id)).length
  const suggested = allLessons.filter((l) => !done[l.id]).slice(0, 3)

  return (
    <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
      <HomeSidebar content={content} />

      <div className="space-y-14">
        {/* Hero */}
        <section className="animate-fade-up py-8">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-brand-500"></span>
              Nền tảng học tập phổ thông
            </div>

            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Học phổ thông & chuyên môn,{' '}
              <span className="text-brand-600 dark:text-brand-400">
                từ lớp 1 đến đại học
              </span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Lý thuyết cô đọng, flashcard ghi nhớ, trắc nghiệm có giải thích chi tiết,
              theo dõi tiến độ học tập. Từ Toán Văn lớp 1 đến React, Python, Design.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/lop"
                className="focus-ring inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 hover:shadow-md"
              >
                Bắt đầu học
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                onClick={onOpenSearch}
                className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <IconSearch className="h-4 w-4" />
                Tìm kiếm
              </button>
            </div>
          </div>
        </section>

        {/* Chọn theo lớp */}
        <section>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Học theo lớp
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Chọn lớp để thấy đúng các môn và chuyên đề của chương trình lớp đó.
              </p>
            </div>
            <Link
              to="/lop"
              className="focus-ring shrink-0 text-sm font-semibold text-brand-700 hover:underline dark:text-brand-300"
            >
              Xem tất cả →
            </Link>
          </div>

          <div className="space-y-7">
            {tiers.map((tier) => (
              <div key={tier.id}>
                <p className="label mb-3">{tier.name}</p>
                <div className="flex flex-wrap gap-2">
                  {tier.grades.map((g) => {
                    const stat = gradeStats.find((x) => x.grade === g)
                    return (
                      <Link
                        key={g}
                        to={`/lop/${g}`}
                        className="focus-ring flex items-baseline gap-2 rounded-lg border border-slate-200 px-3 py-2 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-slate-800 dark:hover:border-brand-500 dark:hover:bg-brand-500/10"
                      >
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          Lớp {g}
                        </span>
                        <span className="text-xs text-slate-500">{stat?.lessonCount ?? 0} bài</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tính năng */}
        <section className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </section>

        {/* Gợi ý bắt đầu */}
        {suggested.length > 0 && (
          <section>
            <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {doneCount > 0 ? 'Học tiếp những chuyên đề này' : 'Bắt đầu với những chuyên đề này'}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {suggested.map((l) => (
                <LessonCard key={l.id} lesson={l} showSubject />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
