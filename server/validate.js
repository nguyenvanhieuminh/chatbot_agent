import { GRADES, GRADE_SUBJECTS, BLOCK_TYPES } from '../shared/curriculum.js'
import { parsePastedContent } from '../shared/parseContent.js'

const BLOCK_TYPE_SET = new Set(BLOCK_TYPES.map((b) => b.type))
const NOTE_VARIANTS = new Set(['info', 'tip', 'warn'])
const STATUSES = new Set(['published', 'draft'])

class ValidationError extends Error {
  constructor(errors) {
    super('Dữ liệu không hợp lệ')
    this.name = 'ValidationError'
    this.errors = errors
  }
}

export { ValidationError }

const str = (v) => (typeof v === 'string' ? v.trim() : '')
const arr = (v) => (Array.isArray(v) ? v : [])

/** Chuyen tieu de thanh slug khong dau, dung lam phan duoi cua id. */
export function slugify(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Lam sach mot block; tra ve null neu block rong/khong dung dinh dang. */
function cleanBlock(block, index, errors) {
  if (!block || typeof block !== 'object') return null
  const type = str(block.type)
  if (!BLOCK_TYPE_SET.has(type)) {
    errors.push(`Khối #${index + 1}: loại "${type || '(trống)'}" không được hỗ trợ.`)
    return null
  }

  switch (type) {
    case 'heading':
    case 'text': {
      const text = str(block.text)
      if (!text) return null
      return { type, text }
    }
    case 'list': {
      const items = arr(block.items).map(str).filter(Boolean)
      if (!items.length) return null
      return { type, items }
    }
    case 'formula': {
      const latex = typeof block.latex === 'string' ? block.latex.trim() : ''
      if (!latex) return null
      const out = { type, latex }
      const caption = str(block.caption)
      if (caption) out.caption = caption
      return out
    }
    case 'table': {
      const headers = arr(block.headers).map(str)
      const rows = arr(block.rows)
        .map((r) => arr(r).map(str))
        .filter((r) => r.some(Boolean))
      if (!headers.length || !rows.length) return null
      // Chuan hoa do dai moi dong bang so cot cua header
      const normalized = rows.map((r) => headers.map((_, i) => r[i] ?? ''))
      return { type, headers, rows: normalized }
    }
    case 'note': {
      const text = str(block.text)
      if (!text) return null
      const variant = NOTE_VARIANTS.has(block.variant) ? block.variant : 'info'
      const out = { type, variant, text }
      const title = str(block.title)
      if (title) out.title = title
      return out
    }
    case 'steps': {
      const items = arr(block.items).map(str).filter(Boolean)
      if (!items.length) return null
      const out = { type, items }
      const title = str(block.title)
      if (title) out.title = title
      return out
    }
    case 'compare': {
      const side = (s) => ({
        title: str(s?.title),
        items: arr(s?.items).map(str).filter(Boolean),
      })
      const left = side(block.left)
      const right = side(block.right)
      if (!left.items.length && !right.items.length) return null
      const out = { type, left, right }
      const title = str(block.title)
      if (title) out.title = title
      return out
    }
    case 'example': {
      const problem = str(block.problem)
      const solution = arr(block.solution).map(str).filter(Boolean)
      if (!problem) return null
      const out = { type, problem, solution }
      const title = str(block.title)
      if (title) out.title = title
      return out
    }
    default:
      return null
  }
}

function cleanFlashcards(raw, errors) {
  const out = []
  arr(raw).forEach((c, i) => {
    const front = str(c?.front)
    const back = str(c?.back)
    if (!front && !back) return
    if (!front || !back) {
      errors.push(`Flashcard #${i + 1}: cần có cả mặt trước và mặt sau.`)
      return
    }
    out.push({ front, back })
  })
  return out
}

/**
 * Lam sach danh sach cau hoi trac nghiem. Duoc export de de kiem tra cua giao
 * vien (`assignments.questions`) dung dung mot shape voi `lessons.quiz`, thay vi
 * sinh ra mot dinh dang cau hoi thu hai.
 */
export function cleanQuiz(raw, errors) {
  const out = []
  arr(raw).forEach((q, i) => {
    const question = str(q?.question)
    const options = arr(q?.options).map(str)
    const filled = options.filter(Boolean)
    if (!question && !filled.length) return

    if (!question) {
      errors.push(`Câu hỏi #${i + 1}: thiếu nội dung câu hỏi.`)
      return
    }
    if (filled.length < 2) {
      errors.push(`Câu hỏi #${i + 1}: cần ít nhất 2 phương án.`)
      return
    }
    const answer = Number(q?.answer)
    if (!Number.isInteger(answer) || answer < 0 || answer >= filled.length) {
      errors.push(`Câu hỏi #${i + 1}: chưa chọn đáp án đúng hợp lệ.`)
      return
    }
    out.push({ question, options: filled, answer, explain: str(q?.explain) })
  })
  return out
}

/**
 * Kiem tra + lam sach payload bai hoc tu admin.
 * @param {object} payload
 * @param {{ isNew: boolean, subjectExists: (id: string) => boolean, idExists: (id: string) => boolean }} ctx
 */
export function validateLesson(payload, ctx) {
  const errors = []
  const subjectId = str(payload.subjectId)
  const grade = Number(payload.grade)
  const title = str(payload.title)
  const contentType = str(payload.contentType) || 'k12'
  const isK12 = contentType === 'k12'

  if (!title) errors.push('Thiếu tiêu đề bài học.')

  // For K-12 content, subject is required
  if (isK12) {
    if (!subjectId) errors.push('Chưa chọn môn học.')
    else if (!ctx.subjectExists(subjectId)) errors.push(`Môn học "${subjectId}" không tồn tại.`)
  }

  // Grade validation: K-12 must have valid grade (1-12), others use 0
  if (isK12) {
    if (!GRADES.includes(grade)) errors.push('Khối lớp phải từ 1 đến 12.')
    else if (subjectId && !(GRADE_SUBJECTS[grade] ?? []).includes(subjectId)) {
      errors.push(`Môn "${subjectId}" không thuộc chương trình lớp ${grade}.`)
    }
  }

  let id = str(payload.id)
  if (!id) {
    if (isK12) {
      id = `${subjectId}.l${grade}.${slugify(title)}`
    } else {
      id = slugify(title)
    }
  }
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(id)) {
    errors.push('Mã bài học chỉ gồm chữ thường, số và các dấu . _ -')
  }
  if (ctx.isNew && ctx.idExists(id)) errors.push(`Mã bài học "${id}" đã tồn tại.`)

  /*
   * `source` (van ban thuan) la nguon duy nhat cua noi dung bai hoc.
   * Server tu parse ra blocks/flashcards/quiz nen client khong the gui
   * du lieu lech voi van ban. Payload cu (chi co blocks) van chay duoc.
   */
  const source = typeof payload.source === 'string' ? payload.source : ''
  const fromSource = source.trim() ? parsePastedContent(source) : null

  const blocks = (fromSource ? fromSource.blocks : arr(payload.blocks))
    .map((b, i) => cleanBlock(b, i, errors))
    .filter(Boolean)
  const flashcards = cleanFlashcards(
    fromSource ? fromSource.flashcards : payload.flashcards,
    errors,
  )
  const quiz = cleanQuiz(fromSource ? fromSource.quiz : payload.quiz, errors)

  const status = STATUSES.has(payload.status) ? payload.status : 'draft'
  if (status === 'published' && !blocks.length) {
    errors.push('Không thể xuất bản bài học chưa có nội dung lý thuyết nào.')
  }

  // Chuong la tuy chon, nhung neu co thi phai thuoc dung mon + lop
  const chapterId = str(payload.chapterId)
  if (chapterId && ctx.chapterFits && !ctx.chapterFits(chapterId, subjectId, grade)) {
    errors.push(`Chương "${chapterId}" không thuộc môn ${subjectId} lớp ${grade}.`)
  }

  if (errors.length) throw new ValidationError(errors)

  const minutes = Number(payload.minutes)
  const result = {
    id,
    subjectId: subjectId || null,
    grade: isK12 ? grade : 0,
    chapterId: chapterId || null,
    title,
    summary: str(payload.summary),
    minutes: Number.isFinite(minutes) && minutes > 0 ? Math.min(Math.round(minutes), 600) : 10,
    keywords: arr(payload.keywords).map(str).filter(Boolean).slice(0, 30),
    source,
    blocks,
    flashcards,
    quiz,
    status,
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 100,
    contentType,
  }

  // Add multi-content fields
  if (!isK12) {
    result.category = str(payload.category) || null
    result.tags = arr(payload.tags).map(str).filter(Boolean).slice(0, 20)
    result.authorId = Number(payload.authorId) || null
    result.level = ['beginner', 'intermediate', 'advanced'].includes(payload.level) ? payload.level : null
  }

  return result
}

/**
 * Kiem tra payload chuong.
 * @param {object} payload
 * @param {{ isNew: boolean, subjectExists: (id: string) => boolean, idExists: (id: string) => boolean }} ctx
 */
export function validateChapter(payload, ctx) {
  const errors = []
  const subjectId = str(payload.subjectId)
  const grade = Number(payload.grade)
  const title = str(payload.title)

  if (!title) errors.push('Thiếu tên chương.')
  if (!subjectId) errors.push('Chưa chọn môn học.')
  else if (!ctx.subjectExists(subjectId)) errors.push(`Môn học "${subjectId}" không tồn tại.`)

  if (!GRADES.includes(grade)) errors.push('Khối lớp phải từ 1 đến 12.')
  else if (subjectId && !(GRADE_SUBJECTS[grade] ?? []).includes(subjectId)) {
    errors.push(`Môn "${subjectId}" không thuộc chương trình lớp ${grade}.`)
  }

  let id = str(payload.id)
  if (!id) id = `${subjectId}-${grade}.${slugify(title)}`
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(id)) {
    errors.push('Mã chương chỉ gồm chữ thường, số và các dấu . _ -')
  }
  if (ctx.isNew && ctx.idExists(id)) errors.push(`Mã chương "${id}" đã tồn tại.`)

  if (errors.length) throw new ValidationError(errors)

  return {
    id,
    subjectId,
    grade,
    title,
    description: str(payload.description),
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 100,
  }
}

export function validateSubject(payload, ctx) {
  const errors = []
  const id = str(payload.id)
  const name = str(payload.name)

  if (!name) errors.push('Thiếu tên môn học.')
  if (!id) errors.push('Thiếu mã môn học.')
  else if (!/^[a-z0-9][a-z0-9_-]*$/.test(id)) {
    errors.push('Mã môn học chỉ gồm chữ thường, số và dấu _ -')
  } else if (ctx.isNew && ctx.idExists(id)) {
    errors.push(`Mã môn "${id}" đã tồn tại.`)
  }

  const grades = arr(payload.grades)
    .map(Number)
    .filter((g) => GRADES.includes(g))
  if (!grades.length) errors.push('Chọn ít nhất một khối lớp cho môn này.')

  if (errors.length) throw new ValidationError(errors)

  return {
    id,
    name,
    short: str(payload.short) || name.slice(0, 8),
    icon: str(payload.icon) || '📘',
    color: str(payload.color) || 'indigo',
    description: str(payload.description),
    sortOrder: Number.isFinite(Number(payload.sortOrder)) ? Number(payload.sortOrder) : 100,
    grades: [...new Set(grades)].sort((a, b) => a - b),
  }
}
