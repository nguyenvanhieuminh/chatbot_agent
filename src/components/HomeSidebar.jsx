import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowRight, IconChevronDown } from './Icons.jsx'

/**
 * Cot ben trai cua trang chu: banner o tren, duoi la danh sach lop 1 -> 12.
 * Bam vao mot lop se mo ra cac mon hoc cua lop do (moi luc chi mo mot lop).
 *
 * Danh sach lop dung cung kieu vach doc voi muc luc trong trang bai hoc, de hai
 * cot ben trai cua hai trang nhin ra cung mot he thong.
 */
export default function HomeSidebar({ content }) {
  const { grades, gradeStats, stats, subjectsOfGrade } = content
  const [openGrade, setOpenGrade] = useState(null)

  return (
    <aside className="no-print hidden lg:block">
      <div className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-7 overflow-y-auto pb-4">
        {/* Banner */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-xl shadow-sm">
              🛤️
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">PathVN</p>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nền tảng học tập</p>
            </div>
          </div>

          <p className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-3">
            Lộ trình học từ lớp 1 đến lớp 12
          </p>

          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
            <span className="flex items-center gap-1">
              📚 {stats.subjects} môn
            </span>
            <span className="flex items-center gap-1">
              📝 {stats.lessons} bài
            </span>
            <span className="flex items-center gap-1">
              🎴 {stats.cards} thẻ
            </span>
          </div>

          <Link
            to="/lop"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Xem tất cả
            <IconArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Danh sach lop */}
        <nav aria-label="Chọn lớp">
          <p className="label mb-2.5">Khối lớp</p>
          <ul className="border-l border-slate-200 dark:border-slate-800">
            {grades.map((grade) => {
              const stat = gradeStats.find((g) => g.grade === grade)
              const isOpen = openGrade === grade
              const subjects = isOpen ? subjectsOfGrade(grade) : []

              return (
                <li key={grade}>
                  <button
                    type="button"
                    onClick={() => setOpenGrade(isOpen ? null : grade)}
                    aria-expanded={isOpen}
                    aria-controls={`sidebar-grade-${grade}`}
                    className={`focus-ring -ml-px flex w-full items-center gap-2 border-l-2 py-1.5 pl-3 text-left text-sm transition-colors ${
                      isOpen
                        ? 'border-brand-600 font-medium text-brand-700 dark:border-brand-400 dark:text-brand-300'
                        : 'border-transparent text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <span className="flex-1">Lớp {grade}</span>
                    <span className="text-xs text-slate-400">{stat?.lessonCount ?? 0}</span>
                    <IconChevronDown
                      className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <ul id={`sidebar-grade-${grade}`} className="animate-fade-up mb-1.5 space-y-0.5 pl-3">
                      {subjects.length === 0 ? (
                        <li className="py-1 pl-3 text-sm text-slate-400">Chưa có môn nào.</li>
                      ) : (
                        subjects.map((s) => (
                          <li key={s.id}>
                            <Link
                              to={`/lop/${grade}/${s.id}`}
                              className="focus-ring flex items-center gap-2 rounded-md py-1 pl-3 pr-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                            >
                              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
                              <span className="flex-1 truncate">{s.name}</span>
                              <span className="text-xs text-slate-400">{s.lessonCount}</span>
                            </Link>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
