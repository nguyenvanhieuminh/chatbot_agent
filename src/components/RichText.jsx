import { useMemo } from 'react'
import katex from 'katex'

/**
 * Render chuoi co:
 *  - cong thuc toan inline trong cap $...$
 *  - **in dam**, *in nghieng*
 * Khong dung dangerouslySetInnerHTML cho van ban thuong (chi cho KaTeX da sinh HTML an toan).
 */
function renderMath(tex, display = false) {
  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: 'ignore',
      output: 'html',
    })
  } catch {
    return null
  }
}

function InlineMath({ tex }) {
  const html = useMemo(() => renderMath(tex, false), [tex])
  if (!html) return <code className="text-rose-600 dark:text-rose-400">{tex}</code>
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export function BlockMath({ tex }) {
  const html = useMemo(() => renderMath(tex, true), [tex])
  if (!html) return <pre className="overflow-x-auto text-sm text-rose-600">{tex}</pre>
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

/** Tach **bold** va *italic* trong mot doan khong chua $. */
function styled(text, keyPrefix) {
  const out = []
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g
  let last = 0
  let m
  let i = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index))
    if (m[1] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b${i++}`} className="font-semibold text-slate-900 dark:text-white">
          {m[1]}
        </strong>,
      )
    } else {
      out.push(
        <em key={`${keyPrefix}-i${i++}`} className="italic">
          {m[2]}
        </em>,
      )
    }
    last = m.index + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export default function RichText({ children, className = '', as: Tag = 'span' }) {
  const nodes = useMemo(() => {
    const text = String(children ?? '')
    const parts = text.split('$')
    // Chi so le => nam giua cap $...$ => la cong thuc
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <InlineMath key={`m${i}`} tex={part} />
      ) : (
        <span key={`t${i}`}>{styled(part, `t${i}`)}</span>
      ),
    )
  }, [children])

  return <Tag className={className}>{nodes}</Tag>
}
