import { Router } from 'express'
import { db, rowToLesson, rowToSubject, rowToChapter, logAction } from '../db.js'
import { requireAdmin } from '../auth.js'
import {
  validateLesson,
  validateSubject,
  validateChapter,
  ValidationError,
  slugify,
} from '../validate.js'
import { GRADES, GRADE_SUBJECTS, SUBJECT_CATALOG, BLOCK_TYPES, TIERS } from '../../shared/curriculum.js'

const router = Router()
router.use(requireAdmin)

const subjectExists = (id) => Boolean(db.prepare('SELECT 1 FROM subjects WHERE id = ?').get(id))
const lessonExists = (id) => Boolean(db.prepare('SELECT 1 FROM lessons WHERE id = ?').get(id))
const chapterExists = (id) => Boolean(db.prepare('SELECT 1 FROM chapters WHERE id = ?').get(id))

/** Chuong ton tai va dung mon + lop? Dung khi validate bai hoc. */
const chapterFits = (id, subjectId, grade) =>
  Boolean(
    db
      .prepare('SELECT 1 FROM chapters WHERE id = ? AND subject_id = ? AND grade = ?')
      .get(id, subjectId, grade),
  )

function handleValidation(res, err) {
  if (err instanceof ValidationError) {
    res.status(422).json({ error: err.message, errors: err.errors })
    return true
  }
  return false
}

/* ---------------------------- Metadata ---------------------------- */

router.get('/meta', (_req, res) => {
  res.json({
    grades: GRADES,
    tiers: TIERS,
    gradeSubjects: GRADE_SUBJECTS,
    blockTypes: BLOCK_TYPES,
    catalog: SUBJECT_CATALOG.map(({ id, name, icon, color }) => ({ id, name, icon, color })),
  })
})

/* ---------------------------- Thong ke ---------------------------- */

router.get('/stats', (_req, res) => {
  const subjectCount = db.prepare('SELECT COUNT(*) n FROM subjects').get().n
  const lessonCount = db.prepare('SELECT COUNT(*) n FROM lessons').get().n
  const published = db.prepare("SELECT COUNT(*) n FROM lessons WHERE status='published'").get().n
  const drafts = lessonCount - published
  const byGrade = db
    .prepare('SELECT grade, COUNT(*) n FROM lessons GROUP BY grade ORDER BY grade')
    .all()
  const bySubject = db
    .prepare(
      `SELECT l.subject_id, s.name, s.icon, COUNT(*) AS count
       FROM lessons l JOIN subjects s ON s.id = l.subject_id
       GROUP BY l.subject_id ORDER BY count DESC`,
    )
    .all()
  const cards = db.prepare('SELECT flashcards, quiz FROM lessons').all()
  let cardCount = 0
  let quizCount = 0
  for (const r of cards) {
    try {
      cardCount += JSON.parse(r.flashcards).length
      quizCount += JSON.parse(r.quiz).length
    } catch {
      /* bo qua dong loi */
    }
  }
  const recent = db
    .prepare('SELECT id, title, grade, subject_id, status, updated_at FROM lessons ORDER BY updated_at DESC LIMIT 8')
    .all()

  res.json({
    subjects: subjectCount,
    lessons: lessonCount,
    published,
    drafts,
    cardCount,
    quizCount,
    byGrade,
    bySubject,
    recent
  })
})

router.get('/audit', (_req, res) => {
  const logs = db
    .prepare(
      `SELECT al.*, u.username, u.role FROM audit_log al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.id DESC LIMIT 60`,
    )
    .all()
  res.json({ logs })
})

/* ---------------------------- Chuong ---------------------------- */

router.get('/chapters', (req, res) => {
  const { grade, subject } = req.query
  const where = []
  const params = []
  if (grade) {
    where.push('c.grade = ?')
    params.push(Number(grade))
  }
  if (subject) {
    where.push('c.subject_id = ?')
    params.push(subject)
  }
  const rows = db
    .prepare(
      `SELECT c.*,
              (SELECT COUNT(*) FROM lessons l WHERE l.chapter_id = c.id) AS lesson_count
       FROM chapters c
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY c.grade, c.subject_id, c.sort_order, c.title`,
    )
    .all(...params)
  res.json(rows.map((r) => ({ ...rowToChapter(r), lessonCount: Number(r.lesson_count) })))
})

router.get('/chapters/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM chapters WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Không tìm thấy chương.' })
  const lessons = db
    .prepare('SELECT * FROM lessons WHERE chapter_id = ? ORDER BY sort_order, title')
    .all(req.params.id)
  res.json({ ...rowToChapter(row), lessons: lessons.map(rowToLesson) })
})

router.post('/chapters', (req, res) => {
  let data
  try {
    data = validateChapter(req.body, { isNew: true, subjectExists, idExists: chapterExists })
  } catch (err) {
    if (handleValidation(res, err)) return
    throw err
  }

  db.prepare(
    `INSERT INTO chapters (id, subject_id, grade, title, description, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(data.id, data.subjectId, data.grade, data.title, data.description, data.sortOrder)
  logAction(req.user.id, 'create_chapter', data.id, data.title)
  res.status(201).json(rowToChapter(db.prepare('SELECT * FROM chapters WHERE id = ?').get(data.id)))
})

router.put('/chapters/:id', (req, res) => {
  if (!chapterExists(req.params.id)) return res.status(404).json({ error: 'Không tìm thấy chương.' })

  let data
  try {
    data = validateChapter(
      { ...req.body, id: req.params.id },
      { isNew: false, subjectExists, idExists: chapterExists },
    )
  } catch (err) {
    if (handleValidation(res, err)) return
    throw err
  }

  db.prepare(
    `UPDATE chapters SET subject_id = ?, grade = ?, title = ?, description = ?, sort_order = ?,
       updated_at = datetime('now')
     WHERE id = ?`,
  ).run(data.subjectId, data.grade, data.title, data.description, data.sortOrder, req.params.id)
  logAction(req.user.id, 'update_chapter', data.id, data.title)
  res.json(rowToChapter(db.prepare('SELECT * FROM chapters WHERE id = ?').get(req.params.id)))
})

router.delete('/chapters/:id', (req, res) => {
  const n = db
    .prepare('SELECT COUNT(*) n FROM lessons WHERE chapter_id = ?')
    .get(req.params.id).n
  if (Number(n)) {
    return res.status(409).json({
      error: `Chương còn ${n} bài học. Hãy chuyển hoặc xoá các bài đó trước.`,
    })
  }
  const result = db.prepare('DELETE FROM chapters WHERE id = ?').run(req.params.id)
  if (!Number(result.changes)) return res.status(404).json({ error: 'Không tìm thấy chương.' })
  logAction(req.user.id, 'delete_chapter', req.params.id)
  res.json({ ok: true })
})

/** Doi thu tu hang loat: [{ id, sortOrder }] */
router.patch('/chapters/reorder', (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : []
  const stmt = db.prepare("UPDATE chapters SET sort_order = ?, updated_at = datetime('now') WHERE id = ?")
  let n = 0
  for (const it of items) {
    const order = Number(it?.sortOrder)
    if (!it?.id || !Number.isFinite(order)) continue
    n += Number(stmt.run(order, String(it.id)).changes)
  }
  logAction(req.user.id, 'reorder_chapters', '', `${n} chương`)
  res.json({ updated: n })
})

/**
 * Tao khung noi dung tu outline dang text.
 *
 * Dong khong thut le  -> mot chuong
 * Dong thut le (2 space / tab / dau -) -> mot bai hoc draft thuoc chuong gan nhat
 *
 * Bo qua (skip) muc da ton tai, nen chay lai nhieu lan van an toan.
 */
router.post('/chapters/outline', (req, res) => {
  const subjectId = String(req.body?.subjectId ?? '').trim()
  const grade = Number(req.body?.grade)
  const outline = String(req.body?.outline ?? '')
  const dryRun = Boolean(req.body?.dryRun)

  const errors = []
  if (!subjectId) errors.push('Chưa chọn môn học.')
  else if (!subjectExists(subjectId)) errors.push(`Môn học "${subjectId}" không tồn tại.`)
  if (!GRADES.includes(grade)) errors.push('Khối lớp phải từ 1 đến 12.')
  else if (subjectId && !(GRADE_SUBJECTS[grade] ?? []).includes(subjectId)) {
    errors.push(`Môn "${subjectId}" không thuộc chương trình lớp ${grade}.`)
  }
  if (!outline.trim()) errors.push('Chưa nhập nội dung outline.')
  if (errors.length) return res.status(422).json({ error: 'Dữ liệu không hợp lệ', errors })

  // Phan tich outline thanh cay chuong -> bai
  const parsed = []
  for (const raw of outline.split('\n')) {
    if (!raw.trim()) continue
    const isChild = /^(\s{2,}|\t|\s*[-*•])/.test(raw)
    const title = raw.replace(/^[\s\-*•]+/, '').trim()
    if (!title) continue

    if (isChild && parsed.length) {
      parsed[parsed.length - 1].lessons.push(title)
    } else {
      parsed.push({ title, lessons: [] })
    }
  }
  if (!parsed.length) {
    return res.status(422).json({ error: 'Không đọc được chương nào từ outline.', errors: [] })
  }

  // Thu tu tiep theo, de chay lai khong ghi de thu tu cu
  const maxChapterOrder = Number(
    db
      .prepare('SELECT COALESCE(MAX(sort_order), 0) m FROM chapters WHERE subject_id = ? AND grade = ?')
      .get(subjectId, grade).m,
  )

  const result = { chaptersCreated: 0, lessonsCreated: 0, skipped: [], chapters: [] }

  const insertChapter = db.prepare(
    `INSERT INTO chapters (id, subject_id, grade, title, description, sort_order)
     VALUES (?, ?, ?, ?, '', ?)`,
  )
  const insertLesson = db.prepare(
    `INSERT INTO lessons (id, subject_id, grade, chapter_id, title, status, sort_order)
     VALUES (?, ?, ?, ?, ?, 'draft', ?)`,
  )

  parsed.forEach((ch, ci) => {
    const chapterId = `${subjectId}-${grade}.${slugify(ch.title)}`
    const chapterOrder = maxChapterOrder + ci + 1
    const chapterTaken = chapterExists(chapterId)

    if (chapterTaken) {
      result.skipped.push(`Chương "${ch.title}" đã tồn tại`)
    } else if (!dryRun) {
      insertChapter.run(chapterId, subjectId, grade, ch.title, chapterOrder)
      result.chaptersCreated++
    } else {
      result.chaptersCreated++
    }

    const lessonTitles = []
    ch.lessons.forEach((title, li) => {
      const lessonId = `${subjectId}.l${grade}.${slugify(title)}`
      if (lessonExists(lessonId)) {
        result.skipped.push(`Bài "${title}" đã tồn tại`)
        return
      }
      if (!dryRun) insertLesson.run(lessonId, subjectId, grade, chapterId, title, li + 1)
      result.lessonsCreated++
      lessonTitles.push(title)
    })

    result.chapters.push({ title: ch.title, lessons: lessonTitles })
  })

  if (!dryRun) {
    logAction(
      req.user.id,
      'create_outline',
      `${subjectId}-${grade}`,
      `${result.chaptersCreated} chương, ${result.lessonsCreated} bài`,
    )
  }
  res.status(dryRun ? 200 : 201).json(result)
})

/* ---------------------------- Bai hoc ---------------------------- */

router.get('/lessons', (req, res) => {
  const { grade, subject, status, q, chapter } = req.query
  const where = []
  const params = []
  if (grade) {
    where.push('grade = ?')
    params.push(Number(grade))
  }
  if (subject) {
    where.push('subject_id = ?')
    params.push(subject)
  }
  if (chapter) {
    where.push('chapter_id = ?')
    params.push(chapter)
  }
  if (status) {
    where.push('status = ?')
    params.push(status)
  }
  if (q) {
    where.push('(title LIKE ? OR id LIKE ? OR summary LIKE ?)')
    const like = `%${q}%`
    params.push(like, like, like)
  }
  /*
   * Sap xep theo cot ma client yeu cau. Phai dung DANH SACH TRANG cot - ten cot
   * khong the truyen qua placeholder `?` nen noi thang chuoi vao SQL; nhan bua
   * req.query.sort la mo duong cho SQL injection.
   */
  const SORTABLE = {
    title: 'title',
    grade: 'grade',
    status: 'status',
    updated_at: 'updated_at',
    created_at: 'created_at',
    sort_order: 'sort_order',
  }
  const sortCol = SORTABLE[String(req.query.sort ?? '')]
  const dir = String(req.query.order ?? '').toLowerCase() === 'asc' ? 'ASC' : 'DESC'
  const orderBy = sortCol
    ? `${sortCol} ${dir}, grade, subject_id, title`
    : 'grade, subject_id, sort_order, title'

  const sql = `SELECT * FROM lessons ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
               ORDER BY ${orderBy}`
  res.json(db.prepare(sql).all(...params).map(rowToLesson))
})

router.get('/lessons/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Không tìm thấy bài học.' })
  res.json(rowToLesson(row))
})

router.post('/lessons', (req, res) => {
  let data
  try {
    data = validateLesson(req.body, {
      isNew: true,
      subjectExists,
      idExists: lessonExists,
      chapterFits,
    })
  } catch (err) {
    if (handleValidation(res, err)) return
    throw err
  }

  db.prepare(
    `INSERT INTO lessons
       (id, subject_id, grade, chapter_id, title, summary, minutes, source, keywords, blocks, flashcards, quiz, status, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    data.id,
    data.subjectId,
    data.grade,
    data.chapterId,
    data.title,
    data.summary,
    data.minutes,
    data.source,
    JSON.stringify(data.keywords),
    JSON.stringify(data.blocks),
    JSON.stringify(data.flashcards),
    JSON.stringify(data.quiz),
    data.status,
    data.sortOrder,
  )
  logAction(req.user.id, 'create_lesson', data.id, data.title)
  res.status(201).json(db.prepare('SELECT * FROM lessons WHERE id = ?').get(data.id))
})

router.put('/lessons/:id', (req, res) => {
  const current = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id)
  if (!current) return res.status(404).json({ error: 'Không tìm thấy bài học.' })

  let data
  try {
    data = validateLesson(
      { ...req.body, id: req.params.id },
      { isNew: false, subjectExists, idExists: lessonExists, chapterFits },
    )
  } catch (err) {
    if (handleValidation(res, err)) return
    throw err
  }

  db.prepare(
    `UPDATE lessons SET
       subject_id = ?, grade = ?, chapter_id = ?, title = ?, summary = ?, minutes = ?,
       source = ?, keywords = ?, blocks = ?, flashcards = ?, quiz = ?, status = ?, sort_order = ?,
       updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    data.subjectId,
    data.grade,
    data.chapterId,
    data.title,
    data.summary,
    data.minutes,
    data.source,
    JSON.stringify(data.keywords),
    JSON.stringify(data.blocks),
    JSON.stringify(data.flashcards),
    JSON.stringify(data.quiz),
    data.status,
    data.sortOrder,
    req.params.id,
  )
  logAction(req.user.id, 'update_lesson', data.id, data.title)
  res.json(rowToLesson(db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id)))
})

router.patch('/lessons/:id/status', (req, res) => {
  const status = req.body?.status === 'published' ? 'published' : 'draft'
  const result = db
    .prepare("UPDATE lessons SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, req.params.id)
  if (!Number(result.changes)) return res.status(404).json({ error: 'Không tìm thấy bài học.' })
  logAction(req.user.id, 'set_status', req.params.id, status)
  res.json({ id: req.params.id, status })
})

router.delete('/lessons/:id', (req, res) => {
  const result = db.prepare('DELETE FROM lessons WHERE id = ?').run(req.params.id)
  if (!Number(result.changes)) return res.status(404).json({ error: 'Không tìm thấy bài học.' })
  logAction(req.user.id, 'delete_lesson', req.params.id)
  res.json({ ok: true })
})

/** Nhap nhieu bai mot luc tu file JSON da xuat truoc do. */
router.post('/lessons/import', (req, res) => {
  const items = Array.isArray(req.body?.lessons) ? req.body.lessons : []
  if (!items.length) return res.status(400).json({ error: 'Không có bài học nào trong dữ liệu.' })

  const overwrite = Boolean(req.body?.overwrite)
  const created = []
  const updated = []
  const failed = []

  for (const raw of items) {
    const exists = raw?.id ? lessonExists(raw.id) : false
    if (exists && !overwrite) {
      failed.push({ id: raw.id, errors: ['Đã tồn tại — bật "ghi đè" nếu muốn thay thế.'] })
      continue
    }
    try {
      const data = validateLesson(raw, {
        isNew: !exists,
        subjectExists,
        idExists: lessonExists,
        chapterFits,
      })
      if (exists) {
        db.prepare(
          `UPDATE lessons SET subject_id=?, grade=?, chapter_id=?, title=?, summary=?, minutes=?,
             source=?, keywords=?, blocks=?, flashcards=?, quiz=?, status=?, sort_order=?,
             updated_at=datetime('now') WHERE id=?`,
        ).run(
          data.subjectId, data.grade, data.chapterId, data.title, data.summary, data.minutes,
          data.source, JSON.stringify(data.keywords), JSON.stringify(data.blocks),
          JSON.stringify(data.flashcards), JSON.stringify(data.quiz),
          data.status, data.sortOrder, data.id,
        )
        updated.push(data.id)
      } else {
        db.prepare(
          `INSERT INTO lessons (id, subject_id, grade, chapter_id, title, summary, minutes,
             source, keywords, blocks, flashcards, quiz, status, sort_order)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        ).run(
          data.id, data.subjectId, data.grade, data.chapterId, data.title, data.summary, data.minutes,
          data.source, JSON.stringify(data.keywords), JSON.stringify(data.blocks),
          JSON.stringify(data.flashcards), JSON.stringify(data.quiz),
          data.status, data.sortOrder,
        )
        created.push(data.id)
      }
    } catch (err) {
      failed.push({ id: raw?.id ?? '(chưa có mã)', errors: err.errors ?? [err.message] })
    }
  }

  logAction(req.user.id, 'import_lessons', '', `+${created.length} ~${updated.length} !${failed.length}`)
  res.json({ created, updated, failed })
})

/** Xuat toan bo (hoac theo bo loc) ra JSON de sao luu / chuyen may. */
router.get('/lessons-export', (req, res) => {
  const { grade, subject } = req.query
  const where = []
  const params = []
  if (grade) {
    where.push('grade = ?')
    params.push(Number(grade))
  }
  if (subject) {
    where.push('subject_id = ?')
    params.push(subject)
  }
  const rows = db
    .prepare(
      `SELECT * FROM lessons ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY grade, subject_id, sort_order`,
    )
    .all(...params)
  res.json({ version: 1, exportedAt: new Date().toISOString(), lessons: rows.map(rowToLesson) })
})

/* ---------------------------- Mon hoc ---------------------------- */

router.get('/subjects', (_req, res) => {
  const rows = db.prepare('SELECT * FROM subjects ORDER BY sort_order, name').all()
  const links = db.prepare('SELECT * FROM subject_grades').all()
  const counts = db.prepare('SELECT subject_id, COUNT(*) n FROM lessons GROUP BY subject_id').all()
  const countMap = new Map(counts.map((c) => [c.subject_id, c.n]))

  res.json(
    rows.map((r) => ({
      ...rowToSubject(r),
      grades: links.filter((l) => l.subject_id === r.id).map((l) => l.grade).sort((a, b) => a - b),
      lessonCount: countMap.get(r.id) ?? 0,
    })),
  )
})

function writeSubject(data) {
  db.prepare(
    `INSERT INTO subjects (id, name, short, icon, color, description, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, short=excluded.short, icon=excluded.icon,
       color=excluded.color, description=excluded.description, sort_order=excluded.sort_order`,
  ).run(data.id, data.name, data.short, data.icon, data.color, data.description, data.sortOrder)

  db.prepare('DELETE FROM subject_grades WHERE subject_id = ?').run(data.id)
  const link = db.prepare('INSERT OR IGNORE INTO subject_grades (subject_id, grade) VALUES (?, ?)')
  for (const g of data.grades) link.run(data.id, g)
}

router.post('/subjects', (req, res) => {
  let data
  try {
    data = validateSubject(req.body, { isNew: true, idExists: subjectExists })
  } catch (err) {
    if (handleValidation(res, err)) return
    throw err
  }
  writeSubject(data)
  logAction(req.user.id, 'create_subject', data.id, data.name)
  res.status(201).json(data)
})

router.put('/subjects/:id', (req, res) => {
  if (!subjectExists(req.params.id)) return res.status(404).json({ error: 'Không tìm thấy môn học.' })
  let data
  try {
    data = validateSubject({ ...req.body, id: req.params.id }, { isNew: false, idExists: subjectExists })
  } catch (err) {
    if (handleValidation(res, err)) return
    throw err
  }
  writeSubject(data)
  logAction(req.user.id, 'update_subject', data.id, data.name)
  res.json(data)
})

router.delete('/subjects/:id', (req, res) => {
  const n = db.prepare('SELECT COUNT(*) n FROM lessons WHERE subject_id = ?').get(req.params.id).n
  if (n > 0) {
    return res
      .status(409)
      .json({ error: `Môn này còn ${n} bài học. Xoá hoặc chuyển các bài đó trước.` })
  }
  const result = db.prepare('DELETE FROM subjects WHERE id = ?').run(req.params.id)
  if (!Number(result.changes)) return res.status(404).json({ error: 'Không tìm thấy môn học.' })
  logAction(req.user.id, 'delete_subject', req.params.id)
  res.json({ ok: true })
})

/* ------------------------- Tien ich slug ------------------------- */

router.post('/slug', (req, res) => {
  res.json({ slug: slugify(req.body?.text) })
})

export default router
