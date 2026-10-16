import { Router } from 'express'
import { db, withTransaction } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

/** Doi dong `progress` thanh dang client dung (giong shape localStorage cu). */
function toClientShape(rows) {
  const done = {}
  const quiz = {}
  for (const r of rows) {
    if (r.done_at) done[r.lesson_id] = r.done_at
    if (r.best_total) quiz[r.lesson_id] = { score: r.best_score, total: r.best_total, at: r.updated_at }
  }
  return { done, quiz }
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM progress WHERE user_id = ?').all(req.user.id)
  res.json(toClientShape(rows))
})

/**
 * Ghi tien do mot bai. Diem quiz chi ghi khi TOT HON diem cu — neu khong thi
 * lam lai bai va lam te hon se xoa mat diem tot nhat da dat.
 */
const upsert = db.prepare(`
  INSERT INTO progress (user_id, lesson_id, done_at, best_score, best_total, updated_at)
  VALUES (?, ?, ?, ?, ?, datetime('now'))
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET
    done_at = COALESCE(excluded.done_at, progress.done_at),
    best_score = CASE
      WHEN excluded.best_total IS NULL THEN progress.best_score
      WHEN progress.best_total IS NULL THEN excluded.best_score
      WHEN CAST(excluded.best_score AS REAL) / excluded.best_total
         > CAST(progress.best_score AS REAL) / progress.best_total THEN excluded.best_score
      ELSE progress.best_score END,
    best_total = CASE
      WHEN excluded.best_total IS NULL THEN progress.best_total
      WHEN progress.best_total IS NULL THEN excluded.best_total
      WHEN CAST(excluded.best_score AS REAL) / excluded.best_total
         > CAST(progress.best_score AS REAL) / progress.best_total THEN excluded.best_total
      ELSE progress.best_total END,
    updated_at = datetime('now')
`)

/** Bo qua lesson_id khong ton tai thay vi bao loi — FK se nem neu de nguyen. */
const lessonExists = db.prepare('SELECT 1 FROM lessons WHERE id = ?')

function writeOne(userId, lessonId, { doneAt, score, total }) {
  if (!lessonId || !lessonExists.get(lessonId)) return false
  const hasQuiz = Number.isInteger(score) && Number.isInteger(total) && total > 0
  upsert.run(userId, lessonId, doneAt ?? null, hasQuiz ? score : null, hasQuiz ? total : null)
  return true
}

router.put('/:lessonId', (req, res) => {
  const ok = writeOne(req.user.id, req.params.lessonId, {
    doneAt: req.body?.done ? new Date().toISOString() : null,
    score: Number(req.body?.score),
    total: Number(req.body?.total),
  })
  if (!ok) return res.status(404).json({ error: 'Bài học không tồn tại.' })
  res.json({ ok: true })
})

router.delete('/:lessonId', (req, res) => {
  db.prepare('DELETE FROM progress WHERE user_id = ? AND lesson_id = ?').run(
    req.user.id,
    req.params.lessonId,
  )
  res.json({ ok: true })
})

/**
 * Gop tien do dang co trong localStorage len server — goi mot lan ngay sau khi
 * dang nhap. Dung `writeOne` nen diem thap hon khong ghi de diem cao hon da co
 * tren server, va bai da hoc khong bi mat trang thai.
 */
router.post('/merge', (req, res) => {
  const done = req.body?.done ?? {}
  const quiz = req.body?.quiz ?? {}
  if (typeof done !== 'object' || typeof quiz !== 'object') {
    return res.status(422).json({ error: 'Dữ liệu tiến độ không hợp lệ.' })
  }

  const ids = new Set([...Object.keys(done), ...Object.keys(quiz)])
  let merged = 0
  let skipped = 0

  withTransaction(() => {
    for (const lessonId of ids) {
      const q = quiz[lessonId]
      const ok = writeOne(req.user.id, lessonId, {
        doneAt: done[lessonId] ? String(done[lessonId]) : null,
        score: Number(q?.score),
        total: Number(q?.total),
      })
      if (ok) merged++
      else skipped++
    }
  })

  const rows = db.prepare('SELECT * FROM progress WHERE user_id = ?').all(req.user.id)
  res.json({ merged, skipped, ...toClientShape(rows) })
})

export default router
