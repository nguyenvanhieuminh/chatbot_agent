// Dai dau thanh Unicode (combining diacritical marks)
const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g')

/** Bo dau tieng Viet + ha chu, de "dao ham" tim duoc "đạo hàm". */
export function normalize(str = '') {
  return str
    .toString()
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

/** Gop toan bo text cua mot bai thanh mot chuoi de tim kiem. */
function lessonHaystack(lesson) {
  const parts = [lesson.title, lesson.summary, lesson.subjectName, `lop ${lesson.grade}`, ...(lesson.keywords ?? [])]
  for (const b of lesson.blocks ?? []) {
    if (b.text) parts.push(b.text)
    if (b.title) parts.push(b.title)
    if (b.caption) parts.push(b.caption)
    if (b.items) parts.push(...b.items)
    if (b.problem) parts.push(b.problem)
    if (b.solution) parts.push(...b.solution)
    if (b.headers) parts.push(...b.headers)
    if (b.rows) parts.push(...b.rows.flat())
    if (b.left) parts.push(b.left.title, ...(b.left.items ?? []))
    if (b.right) parts.push(b.right.title, ...(b.right.items ?? []))
  }
  for (const c of lesson.flashcards ?? []) parts.push(c.front, c.back)
  for (const q of lesson.quiz ?? []) parts.push(q.question, ...(q.options ?? []), q.explain)
  return normalize(parts.filter(Boolean).join(' · '))
}

/** Lay mot doan van ban quanh tu khoa dau tien tim thay, de hien thi goi y. */
function makeSnippet(lesson, terms) {
  const pool = [lesson.summary, ...(lesson.blocks ?? []).map((b) => b.text).filter(Boolean)]
  for (const text of pool) {
    const pos = normalize(text).indexOf(terms[0])
    if (pos === -1) continue
    const start = Math.max(0, pos - 45)
    const raw = text.slice(start, start + 150).replace(/\*\*/g, '')
    return (start > 0 ? '…' : '') + raw + (start + 150 < text.length ? '…' : '')
  }
  return lesson.summary
}

/**
 * Dung index tim kiem tu danh sach bai hoc.
 * Noi dung den tu API nen index phai duoc tao lai moi khi du lieu doi.
 */
export function createSearchIndex(lessons = []) {
  const index = lessons.map((lesson) => ({
    lesson,
    title: normalize(lesson.title),
    keywords: normalize((lesson.keywords ?? []).join(' ')),
    haystack: lessonHaystack(lesson),
  }))

  return function search(query, limit = 12) {
    const q = normalize(query)
    if (q.length < 2) return []
    const terms = q.split(/\s+/).filter(Boolean)

    const hits = []
    for (const entry of index) {
      if (!terms.every((t) => entry.haystack.includes(t))) continue
      let score = 0
      if (entry.title.includes(q)) score += 100
      if (entry.title.startsWith(q)) score += 50
      if (entry.keywords.includes(q)) score += 40
      for (const t of terms) {
        if (entry.title.includes(t)) score += 10
        if (entry.keywords.includes(t)) score += 6
      }
      hits.push({ lesson: entry.lesson, score, snippet: makeSnippet(entry.lesson, terms) })
    }

    return hits.sort((a, b) => b.score - a.score).slice(0, limit)
  }
}
