import { useEffect, useMemo, useState } from 'react'
import RichText from './RichText.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { IconArrowLeft, IconArrowRight, IconCheck, IconRefresh } from './Icons.jsx'

/** Tron mang (Fisher–Yates) - khong lam thay doi mang goc. */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FlashcardDeck({ cards = [], showSource = false }) {
  const { cards: cardState, setCardState } = useProgress()
  const [order, setOrder] = useState(() => cards.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)

  // Bo the thay doi (doi mon, doi bai) -> dat lai bo dem
  useEffect(() => {
    setOrder(cards.map((_, i) => i))
    setPos(0)
    setFlipped(false)
  }, [cards])

  const card = cards[order[pos]]

  const known = useMemo(
    () => cards.filter((c) => cardState[c.id] === 'known').length,
    [cards, cardState],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === ' ') {
        e.preventDefault()
        setFlipped((f) => !f)
      }
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!cards.length) {
    return <p className="text-sm text-slate-500">Chưa có flashcard cho phần này.</p>
  }

  function next() {
    setFlipped(false)
    setPos((p) => (p + 1) % cards.length)
  }
  function prev() {
    setFlipped(false)
    setPos((p) => (p - 1 + cards.length) % cards.length)
  }
  function mark(state) {
    setCardState(card.id, cardState[card.id] === state ? null : state)
    next()
  }

  const status = cardState[card.id]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-600 dark:text-slate-400">
          Thẻ {pos + 1}/{cards.length}
          {status === 'known' && <span className="ml-2 text-emerald-600">· đã nhớ</span>}
          {status === 'review' && <span className="ml-2 text-amber-600">· cần ôn lại</span>}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            Đã nhớ {known}/{cards.length}
          </span>
          <button
            type="button"
            onClick={() => {
              setOrder(shuffle(cards.map((_, i) => i)))
              setPos(0)
              setFlipped(false)
            }}
            className="focus-ring flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <IconRefresh className="h-3.5 w-3.5" />
            Trộn thẻ
          </button>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-300"
          style={{ width: `${(known / cards.length) * 100}%` }}
        />
      </div>

      <div className="flip-scene">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className={`flip-card focus-ring relative block h-72 w-full text-left sm:h-64 ${flipped ? 'is-flipped' : ''}`}
          aria-label="Lật thẻ"
        >
          {/* Mặt trước */}
          <span className="flip-face absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Câu hỏi
            </span>
            <RichText className="text-lg font-semibold text-slate-900 dark:text-white">
              {card.front}
            </RichText>
            {showSource && card.lessonTitle && (
              <span className="text-xs text-slate-400">
                {card.subjectName} · {card.lessonTitle}
              </span>
            )}
            <span className="mt-2 text-xs text-slate-400">Nhấn để xem đáp án (hoặc phím Space)</span>
          </span>

          {/* Mặt sau */}
          <span className="flip-face flip-face-back absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl border border-brand-300 bg-gradient-to-br from-brand-50 to-indigo-50 px-6 py-8 text-center shadow-sm dark:border-brand-500/40 dark:from-slate-900 dark:to-brand-950/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Đáp án
            </span>
            <RichText className="text-base leading-relaxed text-slate-800 dark:text-slate-100">
              {card.back}
            </RichText>
          </span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={prev}
          className="focus-ring rounded-xl border border-slate-300 p-2.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Thẻ trước"
        >
          <IconArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => mark('review')}
            className="focus-ring rounded-xl bg-amber-100 px-4 py-2.5 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:hover:bg-amber-500/25"
          >
            Chưa nhớ
          </button>
          <button
            type="button"
            onClick={() => mark('known')}
            className="focus-ring flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <IconCheck className="h-4 w-4" />
            Đã nhớ
          </button>
        </div>

        <button
          type="button"
          onClick={next}
          className="focus-ring rounded-xl border border-slate-300 p-2.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Thẻ sau"
        >
          <IconArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
