import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useContent } from '../context/ContentContext.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { ContentGate, EmptyState } from '../components/States.jsx'
import FlashcardDeck from '../components/FlashcardDeck.jsx'

export default function FlashcardsPage() {
  const content = useContent()
  const [params, setParams] = useSearchParams()
  const subjectId = params.get('mon') ?? 'all'
  const grade = params.get('lop') ?? 'all'
  const mode = params.get('che-do') ?? 'all' // all | review | unknown
  const { cards: cardState } = useProgress()

  const deck = useMemo(() => {
    let list = content.allCards
    if (subjectId !== 'all') list = list.filter((c) => c.subjectId === subjectId)
    if (grade !== 'all') list = list.filter((c) => c.grade === Number(grade))
    if (mode === 'review') list = list.filter((c) => cardState[c.id] === 'review')
    if (mode === 'unknown') list = list.filter((c) => cardState[c.id] !== 'known')
    return list
  }, [content.allCards, subjectId, grade, mode, cardState])

  const usedSubjects = useMemo(() => {
    const ids = new Set(content.allCards.map((c) => c.subjectId))
    return content.subjects.filter((s) => ids.has(s.id))
  }, [content.allCards, content.subjects])

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Flashcard</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            Lật thẻ để tự kiểm tra. Nhấn <kbd className="rounded border px-1 text-xs">Space</kbd> để lật,{' '}
            <kbd className="rounded border px-1 text-xs">←</kbd>{' '}
            <kbd className="rounded border px-1 text-xs">→</kbd> để chuyển thẻ.
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

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            {[
              ['all', 'Toàn bộ thẻ'],
              ['unknown', 'Thẻ chưa nhớ'],
              ['review', 'Thẻ cần ôn lại'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={chip(mode === key)}
                onClick={() => setParam('che-do', key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {deck.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="Không còn thẻ nào ở đây"
            desc="Bạn đã nhớ hết thẻ trong bộ lọc này, hoặc chưa có thẻ nào khớp điều kiện."
          />
        ) : (
          <div className="card p-5 sm:p-6">
            <FlashcardDeck cards={deck} showSource />
          </div>
        )}
      </div>
    </ContentGate>
  )
}
