import RichText, { BlockMath } from './RichText.jsx'
import { IconInfo, IconBulb, IconAlert, IconPencil } from './Icons.jsx'

/**
 * Render noi dung ly thuyet.
 *
 * Huong thiet ke: kieu tai lieu. Phan cap dua vao khoang trang va co chu, khong
 * dua vao vien — vi khoi ly thuyet nam trong mot khung da co vien roi, long
 * them vien nua thi thanh hop trong hop.
 *
 * Vi vay o day chi con hai thu co nen rieng: hop luu y (vach doc + nen rat nhat)
 * va vi du (mot khoi nen xam). Cong thuc, bang, cac buoc, so sanh deu khong vien.
 */

/** Bo dau $ va ki tu dac biet de dung lam id cho heading (muc luc nhay den). */
export function headingId(text, index) {
  const slug = String(text ?? '')
    .replace(/\$[^$]*\$/g, '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
  // Them chi so de hai heading trung ten khong bi trung id
  return `muc-${index}${slug ? '-' + slug : ''}`
}

const NOTE_STYLE = {
  info: {
    rule: 'border-brand-400 bg-brand-50/60 dark:border-brand-500/60 dark:bg-brand-500/5',
    label: 'text-brand-700 dark:text-brand-300',
    Icon: IconInfo,
    fallback: 'Ghi nhớ',
  },
  tip: {
    rule: 'border-emerald-400 bg-emerald-50/60 dark:border-emerald-500/60 dark:bg-emerald-500/5',
    label: 'text-emerald-700 dark:text-emerald-300',
    Icon: IconBulb,
    fallback: 'Mẹo',
  },
  warn: {
    rule: 'border-amber-400 bg-amber-50/70 dark:border-amber-500/60 dark:bg-amber-500/5',
    label: 'text-amber-700 dark:text-amber-300',
    Icon: IconAlert,
    fallback: 'Lưu ý',
  },
}

function Heading({ text, index }) {
  return (
    <h3
      id={headingId(text, index)}
      className="mt-12 mb-4 scroll-mt-24 text-xl font-semibold tracking-tight text-slate-900 first:mt-0 dark:text-white"
    >
      <RichText>{text}</RichText>
    </h3>
  )
}

function Formula({ latex, caption }) {
  return (
    <figure className="my-7 overflow-x-auto rounded-lg bg-slate-50 px-4 py-5 dark:bg-slate-900/60">
      <BlockMath tex={latex} />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
          <RichText>{caption}</RichText>
        </figcaption>
      )}
    </figure>
  )
}

function Table({ headers, rows }) {
  return (
    <div className="my-7 overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b-2 border-slate-300 dark:border-slate-600">
            {headers.map((h, i) => (
              <th
                key={i}
                className="py-2.5 pr-5 font-semibold text-slate-900 last:pr-0 dark:text-white"
              >
                <RichText>{h}</RichText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r} className="border-b border-slate-100 dark:border-slate-800">
              {row.map((cell, c) => (
                <td key={c} className="py-2.5 pr-5 align-top last:pr-0">
                  <RichText>{cell}</RichText>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Note({ variant = 'info', title, text }) {
  const s = NOTE_STYLE[variant] ?? NOTE_STYLE.info
  return (
    <aside className={`my-6 rounded-r-lg border-l-4 py-3 pl-4 pr-4 ${s.rule}`}>
      <p className={`mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${s.label}`}>
        <s.Icon className="h-4 w-4" />
        {title ?? s.fallback}
      </p>
      <RichText as="p" className="text-slate-700 dark:text-slate-300">
        {text}
      </RichText>
    </aside>
  )
}

function Steps({ title, items }) {
  return (
    <div className="my-7">
      {title && (
        <p className="mb-3 font-semibold text-slate-900 dark:text-white">
          <RichText>{title}</RichText>
        </p>
      )}
      <ol className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="flex gap-3.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {i + 1}
            </span>
            <RichText className="min-w-0">{it}</RichText>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Compare({ title, left, right }) {
  return (
    <div className="my-7">
      {title && (
        <p className="mb-4 font-semibold text-slate-900 dark:text-white">
          <RichText>{title}</RichText>
        </p>
      )}
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {[left, right].map((col, i) => (
          <div key={i}>
            <RichText
              as="p"
              className="border-b-2 border-slate-300 pb-2 text-sm font-semibold text-slate-900 dark:border-slate-600 dark:text-white"
            >
              {col.title}
            </RichText>
            <ul className="mt-3 space-y-2">
              {col.items.map((it, j) => (
                <li key={j} className="flex gap-2.5 text-sm leading-relaxed">
                  <span className="mt-[0.5em] h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                  <RichText className="min-w-0">{it}</RichText>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function Example({ title, problem, solution }) {
  return (
    <div className="my-7 rounded-xl bg-slate-50 px-5 py-4 dark:bg-slate-900/60">
      <p className="label mb-2.5 flex items-center gap-2">
        <IconPencil className="h-4 w-4" />
        {title ?? 'Ví dụ'}
      </p>
      <RichText as="p" className="font-medium text-slate-900 dark:text-white">
        {problem}
      </RichText>
      {solution.length > 0 && (
        <div className="mt-3 space-y-2 border-l-2 border-slate-300 pl-4 dark:border-slate-700">
          {solution.map((s, i) => (
            <RichText key={i} as="p" className="text-slate-600 dark:text-slate-400">
              {s}
            </RichText>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TheoryBlocks({ blocks = [] }) {
  return (
    <div className="reading">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'heading':
            return <Heading key={i} text={b.text} index={i} />
          case 'text':
            return (
              <RichText key={i} as="p" className="my-5">
                {b.text}
              </RichText>
            )
          case 'formula':
            return <Formula key={i} latex={b.latex} caption={b.caption} />
          case 'table':
            return <Table key={i} headers={b.headers} rows={b.rows} />
          case 'note':
            return <Note key={i} variant={b.variant} title={b.title} text={b.text} />
          case 'steps':
            return <Steps key={i} title={b.title} items={b.items} />
          case 'compare':
            return <Compare key={i} title={b.title} left={b.left} right={b.right} />
          case 'example':
            return <Example key={i} title={b.title} problem={b.problem} solution={b.solution} />
          case 'list':
            return (
              <ul key={i} className="my-5 space-y-2.5">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    <RichText className="min-w-0">{it}</RichText>
                  </li>
                ))}
              </ul>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
