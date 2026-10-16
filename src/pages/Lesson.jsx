import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useContent } from '../context/ContentContext.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ContentGate } from '../components/States.jsx'
import TheoryBlocks, { headingId } from '../components/TheoryBlocks.jsx'
import FlashcardDeck from '../components/FlashcardDeck.jsx'
import Quiz from '../components/Quiz.jsx'
import NoteEditor from '../components/NoteEditor.jsx'
import NotFound from './NotFound.jsx'
import { IconCheck, IconStar, IconArrowLeft, IconArrowRight } from '../components/Icons.jsx'

const TABS = [
  { key: 'theory', label: 'Lý thuyết' },
  { key: 'cards', label: 'Flashcard' },
  { key: 'quiz', label: 'Trắc nghiệm' },
]

/**
 * Theo doi muc nao dang o trong tam nhin de to dam muc do trong muc luc.
 * Dung IntersectionObserver thay vi nghe su kien scroll cho nhe.
 */
function useActiveHeading(ids) {
  const [active, setActive] = useState('')

  useEffect(() => {
    if (!ids.length) return
    const seen = new Map()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting)
        // Muc dang doc = muc dau tien con nhin thay theo dung thu tu trong bai
        const current = ids.find((id) => seen.get(id))
        if (current) setActive(current)
      },
      // Chi tinh vung giua man hinh, tranh nhay lien tuc o ria
      { rootMargin: '-80px 0px -60% 0px' },
    )
    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [ids])

  return active
}

export default function Lesson() {
  const content = useContent()
  return (
    <ContentGate content={content}>
      <LessonInner content={content} />
    </ContentGate>
  )
}

function LessonInner({ content }) {
  const { lessonId } = useParams()
  const [tab, setTab] = useState('theory')
  const { isDone, toggleDone, isFavorite, toggleFavorite } = useProgress()
  const { isAuthenticated } = useAuth()

  const lesson = content.getLesson(lessonId)

  // Doi bai -> ve dau trang, quay lai tab ly thuyet
  useEffect(() => {
    setTab('theory')
    window.scrollTo({ top: 0 })
  }, [lessonId])

  const cards = useMemo(
    () => (lesson?.flashcards ?? []).map((c, i) => ({ ...c, id: `${lesson.id}#${i}` })),
    [lesson],
  )

  // Muc luc: giu lai chi so trong mang blocks de id trung voi id ma TheoryBlocks dat
  const headings = useMemo(
    () =>
      (lesson?.blocks ?? [])
        .map((b, index) => ({ ...b, index }))
        .filter((b) => b.type === 'heading'),
    [lesson],
  )
  const headingIds = useMemo(() => headings.map((h) => headingId(h.text, h.index)), [headings])
  // Chi theo doi khi dang o tab ly thuyet; memo de effect khong chay lai moi render
  const observedIds = useMemo(() => (tab === 'theory' ? headingIds : []), [tab, headingIds])
  const activeId = useActiveHeading(observedIds)

  if (!lesson) return <NotFound />

  const subject = content.getSubject(lesson.subjectId)
  const { prev, next } = content.getNeighbors(lesson.id)
  const done = isDone(lesson.id)
  const fav = isFavorite(lesson.id)
  return (
    <div>
      {/* Duong dan */}
      <nav className="no-print flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link to={`/lop/${lesson.grade}`} className="hover:text-slate-900 dark:hover:text-white">
          Lớp {lesson.grade}
        </Link>
        <span className="text-slate-300 dark:text-slate-600">/</span>
        <Link
          to={`/lop/${lesson.grade}/${lesson.subjectId}`}
          className="hover:text-slate-900 dark:hover:text-white"
        >
          {subject?.name ?? lesson.subjectId}
        </Link>
      </nav>

      {/* Tieu de bai — khong boc card, de chu tu dung mot minh */}
      <header className="mt-5 border-b border-slate-200 pb-6 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className={`h-2 w-2 rounded-full ${subject?.dot ?? 'bg-slate-400'}`} />
          <span>{lesson.subjectName}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>Lớp {lesson.grade}</span>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <span>{lesson.minutes} phút đọc</span>
          {isAuthenticated && (
            <Link
              to={`/admin/bai-hoc/${encodeURIComponent(lesson.id)}`}
              className="focus-ring ml-auto rounded-md px-2 py-1 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
            >
              Sửa bài này
            </Link>
          )}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {lesson.title}
        </h1>
        {lesson.summary && (
          <p className="mt-3 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {lesson.summary}
          </p>
        )}

        <div className="no-print mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleDone(lesson.id)}
            className={`focus-ring flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
              done
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <IconCheck className="h-4 w-4" />
            {done ? 'Đã học xong' : 'Đánh dấu đã học'}
          </button>

          <button
            type="button"
            onClick={() => toggleFavorite(lesson.id)}
            className={`focus-ring flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors ${
              fav
                ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <IconStar filled={fav} className="h-4 w-4" />
            {fav ? 'Đã đánh dấu' : 'Đánh dấu'}
          </button>
        </div>
      </header>

      {/* Muc luc ben trai, noi dung o giua — bo cuc kieu tai lieu */}
      <div className="mt-8 gap-10 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="no-print hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] space-y-6 overflow-y-auto pb-4">
            {tab === 'theory' && headings.length > 0 && (
              <nav aria-label="Nội dung bài">
                <p className="label mb-2.5">Nội dung bài</p>
                <ul className="space-y-0.5 border-l border-slate-200 dark:border-slate-800">
                  {headings.map((h) => {
                    const id = headingId(h.text, h.index)
                    const isActive = activeId === id
                    return (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          className={`focus-ring -ml-px block border-l-2 py-1 pl-3 text-sm transition-colors ${
                            isActive
                              ? 'border-brand-600 font-medium text-brand-700 dark:border-brand-400 dark:text-brand-300'
                              : 'border-transparent text-slate-500 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {h.text.replace(/\$/g, '')}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            )}

            {lesson.keywords?.length > 0 && (
              <div>
                <p className="label mb-2.5">Từ khoá</p>
                <div className="flex flex-wrap gap-1.5">
                  {lesson.keywords.map((k) => (
                    <span
                      key={k}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          {/* Tab gach chan — nhe hon nut to kin mau */}
          <div className="no-print mb-8 flex gap-6 border-b border-slate-200 dark:border-slate-800">
            {TABS.map((t) => {
              const count =
                t.key === 'cards' ? cards.length : t.key === 'quiz' ? (lesson.quiz?.length ?? 0) : null
              const isActive = tab === t.key
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`focus-ring -mb-px border-b-2 px-0.5 pb-2.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300'
                      : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                  {count !== null && (
                    <span className="ml-1.5 font-normal text-slate-400">{count}</span>
                  )}
                </button>
              )
            })}
          </div>

          <main className="measure">
            {tab === 'theory' && <TheoryBlocks blocks={lesson.blocks} />}
            {tab === 'cards' && <FlashcardDeck cards={cards} />}
            {tab === 'quiz' && <Quiz lessonId={lesson.id} questions={lesson.quiz} />}

            {tab === 'theory' && (
              <div className="mt-10">
                <NoteEditor lessonId={lesson.id} />
              </div>
            )}

            {/* Bai truoc / bai sau */}
            <nav className="no-print mt-10 grid gap-3 border-t border-slate-200 pt-6 sm:grid-cols-2 dark:border-slate-800">
              {prev ? (
                <Link
                  to={`/bai-hoc/${prev.id}`}
                  className="focus-ring group flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <IconArrowLeft className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400" />
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-500">Bài trước</span>
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {prev.title}
                    </span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link
                  to={`/bai-hoc/${next.id}`}
                  className="focus-ring group flex items-center gap-3 rounded-lg p-3 text-right transition-colors hover:bg-slate-50 sm:justify-end dark:hover:bg-slate-900"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-slate-500">Bài sau</span>
                    <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {next.title}
                    </span>
                  </span>
                  <IconArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-brand-600 dark:group-hover:text-brand-400" />
                </Link>
              )}
            </nav>
          </main>
        </div>
      </div>
    </div>
  )
}
