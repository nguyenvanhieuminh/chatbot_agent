import { useState } from 'react'

/**
 * Hien ma tham gia lop kem nut copy.
 *
 * `navigator.clipboard` chi ton tai o ngu canh bao mat (https hoac localhost) —
 * neu khong co thi an nut copy di thay vi de nguoi dung bam vao mot nut loi.
 */
export default function ClassCode({ code, size = 'sm' }) {
  const [copied, setCopied] = useState(false)
  const canCopy = typeof navigator !== 'undefined' && Boolean(navigator.clipboard)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // Nguoi dung tu chon tay duoc, khong can bao loi
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code
        className={`rounded-lg bg-slate-100 font-mono font-bold tracking-[0.2em] text-slate-900 dark:bg-slate-800 dark:text-white ${
          size === 'lg' ? 'px-4 py-2.5 text-2xl' : 'px-2.5 py-1.5 text-sm'
        }`}
      >
        {code}
      </code>
      {canCopy && (
        <button
          type="button"
          onClick={copy}
          className="focus-ring rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {copied ? 'Đã copy' : 'Copy'}
        </button>
      )}
    </div>
  )
}
