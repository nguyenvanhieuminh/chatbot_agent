import { Router } from 'express'
import { db, rowToLesson, rowToSubject, rowToChapter } from '../db.js'
import { TIERS, GRADES } from '../../shared/curriculum.js'

const router = Router()

/**
 * Mot lan goi duy nhat tra ve toan bo noi dung da xuat ban.
 * Toan bo du lieu la text nen payload nho; client cache trong memory
 * va dieu huong hoan toan phia client - khong can goi API tung trang.
 */
router.get('/content', (_req, res) => {
  const subjectRows = db.prepare('SELECT * FROM subjects ORDER BY sort_order, name').all()
  const gradeRows = db.prepare('SELECT * FROM subject_grades').all()
  const lessonRows = db
    .prepare(
      `SELECT * FROM lessons WHERE status = 'published'
       ORDER BY grade, subject_id, sort_order, title`,
    )
    .all()

  const gradesBySubject = new Map()
  for (const r of gradeRows) {
    if (!gradesBySubject.has(r.subject_id)) gradesBySubject.set(r.subject_id, [])
    gradesBySubject.get(r.subject_id).push(r.grade)
  }

  const subjects = subjectRows.map((r) => ({
    ...rowToSubject(r),
    grades: (gradesBySubject.get(r.id) ?? []).sort((a, b) => a - b),
  }))

  // Chi tra ve chuong con it nhat mot bai da xuat ban, tranh muc luc rong
  const chapterRows = db
    .prepare(
      `SELECT c.* FROM chapters c
       WHERE EXISTS (SELECT 1 FROM lessons l WHERE l.chapter_id = c.id AND l.status = 'published')
       ORDER BY c.grade, c.subject_id, c.sort_order, c.title`,
    )
    .all()

  res.json({
    tiers: TIERS,
    grades: GRADES,
    subjects,
    chapters: chapterRows.map(rowToChapter),
    lessons: lessonRows.map(rowToLesson),
    generatedAt: new Date().toISOString(),
  })
})

/** Mot bai cu the (dung khi mo deep-link truc tiep). */
router.get('/lessons/:id', (req, res) => {
  const row = db
    .prepare("SELECT * FROM lessons WHERE id = ? AND status = 'published'")
    .get(req.params.id)
  if (!row) return res.status(404).json({ error: 'Không tìm thấy bài học.' })
  res.json(rowToLesson(row))
})

router.get('/health', (_req, res) => {
  const lessons = db.prepare("SELECT COUNT(*) n FROM lessons WHERE status='published'").get().n
  res.json({ ok: true, lessons })
})

/* -------------------- Multi-content routes -------------------- */

/** Professional content by category */
router.get('/professional', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM lessons
       WHERE content_type = 'professional' AND status = 'published'
       ORDER BY category, level, sort_order, title`,
    )
    .all()

  // Group by category
  const byCategory = {}
  for (const row of rows) {
    const cat = row.category || 'uncategorized'
    if (!byCategory[cat]) byCategory[cat] = []
    byCategory[cat].push(rowToLesson(row))
  }

  res.json({ categories: byCategory })
})

/** Professional content in a specific category */
router.get('/professional/:category', (req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM lessons
       WHERE content_type = 'professional' AND category = ? AND status = 'published'
       ORDER BY level, sort_order, title`,
    )
    .all(req.params.category)

  res.json({
    category: req.params.category,
    lessons: rows.map(rowToLesson)
  })
})

/** Blog posts */
router.get('/blog', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM lessons
       WHERE content_type = 'blog' AND status = 'published'
       ORDER BY created_at DESC`,
    )
    .all()

  res.json({ posts: rows.map(rowToLesson) })
})

/** Blog post by category */
router.get('/blog/category/:category', (req, res) => {
  const rows = db
    .prepare(
      `SELECT * FROM lessons
       WHERE content_type = 'blog' AND category = ? AND status = 'published'
       ORDER BY created_at DESC`,
    )
    .all(req.params.category)

  res.json({
    category: req.params.category,
    posts: rows.map(rowToLesson)
  })
})

export default router
