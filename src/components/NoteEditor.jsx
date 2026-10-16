import { useEffect, useRef, useState } from 'react'
import { useProgress } from '../context/ProgressContext.jsx'
import { IconNote, IconCheck } from './Icons.jsx'

export default function NoteEditor({ lessonId }) {
  const { notes, saveNote } = useProgress()
  const [text, setText] = useState(notes[lessonId] ?? '')
  const [saved, setSaved] = useState(false)
  const timer = useRef(null)

  // Doi bai hoc -> nap lai ghi chu tuong ung
  useEffect(() => {
    setText(notes[lessonId] ?? '')
    setSaved(false)
  }, [lessonId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Tu dong luu sau 600ms khong go nua
  useEffect(() => {
    if (text === (notes[lessonId] ?? '')) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      saveNote(lessonId, text)
      setSaved(true)
      setTimeout(() => setSaved(false), 1600)
    }, 600)
    return () => clearTimeout(timer.current)
  }, [text]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center gap-2">
        <IconNote className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ghi chú của bạn</h3>
        {saved && (
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <IconCheck className="h-3.5 w-3.5" /> Đã lưu
          </span>
        )}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Ghi lại công thức dễ quên, lỗi mình từng mắc, cách nhớ riêng… Nội dung tự lưu vào máy bạn."
        className="focus-ring w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-relaxed outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950/60"
      />
      <p className="mt-2 text-xs text-slate-400">
        Ghi chú lưu trong trình duyệt này (localStorage), không gửi lên server.
      </p>
    </div>
  )
}
