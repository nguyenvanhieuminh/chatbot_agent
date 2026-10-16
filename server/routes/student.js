import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { db, logAction, parseJson, rowToClass, rowToAssignment, rowToSubmission } from '../db.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

const str = (v) => (typeof v === 'string' ? v.trim() : '')

/** Lay de bai + kiem tra hoc sinh nay co trong lop duoc giao de do. */
function getVisibleAssignment(req, assignmentId) {
  const row = db
    .prepare(
      `SELECT a.* FROM assignments a
       JOIN class_members m ON m.class_id = a.class_id AND m.user_id = ?
       WHERE a.id = ? AND a.published = 1`,
    )
    .get(req.user.id, assignmentId)
  if (!row) return { error: { status: 404, message: 'Không tìm thấy bài kiểm tra này.' } }
  return { row }
}

/* ---------------------------- Lop cua toi ---------------------------- */

router.get('/classes', (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, u.display_name AS teacher_name
       FROM class_members m
       JOIN classes c ON c.id = m.class_id
       JOIN users u ON u.id = c.teacher_id
       WHERE m.user_id = ?
       ORDER BY c.archived, m.joined_at DESC`,
    )
    .all(req.user.id)

  const classes = rows.map((row) => {
    const total = db
      .prepare('SELECT COUNT(*) AS n FROM assignments WHERE class_id = ? AND published = 1')
      .get(row.id).n
    const done = db
      .prepare(
        `SELECT COUNT(*) AS n FROM submissions s
         JOIN assignments a ON a.id = s.assignment_id
         WHERE a.class_id = ? AND a.published = 1 AND s.student_id = ?`,
      )
      .get(row.id, req.user.id).n
    return { ...rowToClass(row), assignmentCount: total, submittedCount: done }
  })

  res.json({ classes })
})

router.post('/classes/join', (req, res) => {
  // Ma lop viet HOA, bo dau cach de nguoi dung dan tu tin nhan van vao duoc
  const code = str(req.body?.code).toUpperCase().replace(/\s+/g, '')
  if (!code) return res.status(422).json({ error: 'Nhập mã lớp.' })

  const cls = db.prepare('SELECT * FROM classes WHERE code = ?').get(code)
  if (!cls) return res.status(404).json({ error: 'Mã lớp không đúng. Kiểm tra lại với giáo viên.' })
  if (cls.archived) return res.status(409).json({ error: 'Lớp này đã được lưu trữ, không nhận thêm thành viên.' })
  if (cls.teacher_id === req.user.id) {
    return res.status(409).json({ error: 'Đây là lớp bạn dạy, không cần tham gia.' })
  }

  const already = db
    .prepare('SELECT 1 FROM class_members WHERE class_id = ? AND user_id = ?')
    .get(cls.id, req.user.id)
  if (already) return res.status(409).json({ error: 'Bạn đã ở trong lớp này rồi.' })

  db.prepare('INSERT INTO class_members (class_id, user_id) VALUES (?, ?)').run(cls.id, req.user.id)
  logAction(req.user.id, 'join_class', cls.id, cls.name)
  res.status(201).json({ class: rowToClass(cls) })
})

router.delete('/classes/:id/leave', (req, res) => {
  const n = db
    .prepare('DELETE FROM class_members WHERE class_id = ? AND user_id = ?')
    .run(req.params.id, req.user.id).changes
  if (!n) return res.status(404).json({ error: 'Bạn không ở trong lớp này.' })
  logAction(req.user.id, 'leave_class', req.params.id)
  res.json({ ok: true })
})

/* -------------------------- Bai kiem tra -------------------------- */

router.get('/assignments', (req, res) => {
  const rows = db
    .prepare(
      `SELECT a.*, c.name AS class_name, c.id AS cid,
              s.id AS sub_id, s.score AS sub_score, s.total AS sub_total,
              s.status AS sub_status, s.submitted_at AS sub_at
       FROM class_members m
       JOIN assignments a ON a.class_id = m.class_id AND a.published = 1
       JOIN classes c ON c.id = a.class_id
       LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
       WHERE m.user_id = ?
       ORDER BY (s.id IS NOT NULL), a.due_at IS NULL, a.due_at, a.created_at DESC`,
    )
    .all(req.user.id, req.user.id)

  res.json({
    assignments: rows.map((r) => ({
      // rowToAssignment mac dinh cat dap an — dung cho danh sach
      ...rowToAssignment(r),
      className: r.class_name,
      submission: r.sub_id
        ? {
            id: r.sub_id,
            score: r.sub_score,
            total: r.sub_total,
            status: r.sub_status,
            submittedAt: r.sub_at,
          }
        : null,
    })),
  })
})

/**
 * Xem mot de. Chua nop thi cau hoi bi cat `answer`/`explain`; nop roi thi tra
 * ve day du kem dap an da chon de hoc sinh doi chieu.
 */
router.get('/assignments/:id', (req, res) => {
  const { row, error } = getVisibleAssignment(req, req.params.id)
  if (error) return res.status(error.status).json({ error: error.message })

  const sub = db
    .prepare('SELECT * FROM submissions WHERE assignment_id = ? AND student_id = ?')
    .get(row.id, req.user.id)

  const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(row.class_id)

  res.json({
    assignment: rowToAssignment(row, { includeAnswers: Boolean(sub) }),
    className: cls?.name ?? '',
    submission: sub ? rowToSubmission(sub) : null,
  })
})

router.post('/assignments/:id/submit', (req, res) => {
  const { row, error } = getVisibleAssignment(req, req.params.id)
  if (error) return res.status(error.status).json({ error: error.message })

  const existing = db
    .prepare('SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?')
    .get(row.id, req.user.id)
  if (existing) return res.status(409).json({ error: 'Bạn đã nộp bài này rồi.' })

  if (row.due_at && new Date(row.due_at).getTime() < Date.now()) {
    return res.status(409).json({ error: 'Đã quá hạn nộp bài này.' })
  }

  const questions = parseJson(row.questions, [])
  const raw = req.body?.answers
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return res.status(422).json({ error: 'Dữ liệu trả lời không hợp lệ.' })
  }

  // Chi nhan dap an cho cau co thuc va trong pham vi phuong an — tranh client
  // gui index rac lam sai ket qua cham
  const answers = {}
  let score = 0
  questions.forEach((q, qi) => {
    const picked = Number(raw[qi])
    if (!Number.isInteger(picked) || picked < 0 || picked >= q.options.length) return
    answers[qi] = picked
    if (picked === q.answer) score++
  })

  const id = randomUUID()
  db.prepare(
    `INSERT INTO submissions (id, assignment_id, student_id, answers, score, total, status)
     VALUES (?, ?, ?, ?, ?, ?, 'graded')`,
  ).run(id, row.id, req.user.id, JSON.stringify(answers), score, questions.length)

  logAction(req.user.id, 'submit_assignment', row.id, `${score}/${questions.length}`)
  res.status(201).json({
    submission: rowToSubmission(db.prepare('SELECT * FROM submissions WHERE id = ?').get(id)),
    // Nop xong moi duoc thay dap an dung
    questions,
  })
})

export default router
