import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../context/ContentContext.jsx'
import { IconSearch, IconClose } from './Icons.jsx'

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { search } = useContent()

  const results = useMemo(() => search(query), [search, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setCursor(0)
      // Doi modal mount xong roi moi focus
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => setCursor(0), [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCursor((c) => Math.min(c + 1, Math.max(results.length - 1, 0)))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCursor((c) => Math.max(c - 1, 0))
      }
      if (e.key === 'Enter' && results[cursor]) {
        navigate(`/bai-hoc/${results[cursor].lesson.id}`)
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, cursor, navigate, onClose])

  if (!open) return null

  return (
    <div className="no-print fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh]">
      <button
        type="button"
        aria-label="Đóng tìm kiếm"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
      />
      <div className="animate-pop relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 dark:border-slate-800">
          <IconSearch className="h-5 w-5 shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm công thức, khái niệm, bài học… (vd: dao ham, li do dao ham)"
            className="w-full bg-transparent py-4 text-base outline-none placeholder:text-slate-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="focus-ring rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Đóng"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {query.trim().length < 2 && (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Nhập từ khoá để tìm trong toàn bộ lý thuyết. Không cần gõ dấu.
            </p>
          )}
          {query.trim().length >= 2 && results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Không tìm thấy kết quả cho “{query}”.
            </p>
          )}
          <ul>
            {results.map(({ lesson, snippet }, i) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => {
                    navigate(`/bai-hoc/${lesson.id}`)
                    onClose()
                  }}
                  className={`flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors dark:border-slate-800/70 ${
                    i === cursor ? 'bg-brand-50 dark:bg-brand-500/10' : ''
                  }`}
                >
                  <span className="mt-0.5 text-lg" aria-hidden="true">
                    {lesson.subjectIcon}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      {lesson.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                      {lesson.subjectName} · Lớp {lesson.grade}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-xs text-slate-600 dark:text-slate-400">
                      {snippet}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/60">
          <span>↑ ↓ di chuyển</span>
          <span>↵ mở bài</span>
          <span>Esc đóng</span>
        </div>
      </div>
    </div>
  )
}
