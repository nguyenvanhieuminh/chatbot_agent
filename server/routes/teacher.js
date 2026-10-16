import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import {
  db,
  logAction,
  parseJson,
  generateClassCode,
  rowToClass,
  rowToAssignment,
  rowToSubmission,
} from '../db.js'
import { cleanQuiz } from '../validate.js'
import { requireTeacher } from '../auth.js'
import { GRADES } from '../../shared/curriculum.js'

const router = Router()
router.use(requireTeacher)

const str = (v) => (typeof v === 'string' ? v.trim() : '')

/**
 * Lay lop VA kiem tra quyen trong mot buoc.
 *
 * Day la diem de ro ri du lieu nhat cua ca tinh nang: neu chi kiem tra
 * `classes.id` ma khong kiem tra `teacher_id` thi mot giao vien doi id tren URL
 * la doc duoc lop cua nguoi khac. Moi route ben duoi PHAI di qua ham nay.
 * Admin duoc xem tat ca.
 */
function getOwnedClass(req, classId) {
  const row = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId)
  if (!row) return { error: { status: 404, message: 'Không tìm thấy lớp này.' } }
  if (req.user.role !== 'admin' && row.teacher_id !== req.user.id) {
    // Tra 404 thay vi 403 de khong tiet lo la lop nay co ton tai
    return { error: { status: 404, message: 'Không tìm thấy lớp này.' } }
  }
  return { row }
}

/** Lay de bai + kiem tra no thuoc lop ma giao vien nay so huu. */
function getOwnedAssignment(req, assignmentId) {
  const row = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId)
  if (!row) return { error: { status: 404, message: 'Không tìm thấy đề bài này.' } }
  const owned = getOwnedClass(req, row.class_id)
  if (owned.error) return { error: owned.error }
  return { row, classRow: owned.row }
}

function fail(res, error) {
  return res.status(error.status).json({ error: error.message })
}

/* ------------------------------- Lop hoc ------------------------------- */

router.get('/classes', (req, res) => {
  const onlyMine = req.user.role !== 'admin'
  const rows = db
    .prepare(
      `SELECT c.*,
              (SELECT COUNT(*) FROM class_members m WHERE m.class_id = c.id)  AS member_count,
              (SELECT COUNT(*) FROM assignments a WHERE a.class_id = c.id)    AS assignment_count
       FROM classes c
       ${onlyMine ? 'WHERE c.teacher_id = ?' : ''}
       ORDER BY c.archived, c.created_at DESC`,
    )
    .all(...(onlyMine ? [req.user.id] : []))
  res.json({ classes: rows.map(rowToClass) })
})

router.post('/classes', (req, res) => {
  const name = str(req.body?.name)
  if (!name) return res.status(422).json({ error: 'Nhập tên lớp.' })
  if (name.length > 80) return res.status(422).json({ error: 'Tên lớp tối đa 80 ký tự.' })

  let grade = null
  if (req.body?.grade !== undefined && req.body?.grade !== null && req.body?.grade !== '') {
    grade = Number(req.body.grade)
    if (!GRADES.includes(grade)) return res.status(422).json({ error: 'Khối lớp phải từ 1 đến 12.' })
  }

  let subjectId = str(req.body?.subjectId) || null
  if (subjectId && !db.prepare('SELECT 1 FROM subjects WHERE id = ?').get(subjectId)) {
    return res.status(422).json({ error: 'Môn học không tồn tại.' })
  }

  const id = randomUUID()
  const code = generateClassCode()
  db.prepare(
    `INSERT INTO classes (id, code, name, teacher_id, grade, subject_id, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, code, name, req.user.id, grade, subjectId, str(req.body?.description))

  logAction(req.user.id, 'create_class', id, name)
  const row = db.prepare('SELECT * FROM classes WHERE id = ?').get(id)
  res.status(201).json({ class: rowToClass(row) })
})

router.get('/classes/:id', (req, res) => {
  const { row, error } = getOwnedClass(req, req.params.id)
  if (error) return fail(res, error)

  const members = db
    .prepare(
      `SELECT u.id, u.username, u.display_name, u.grade, m.joined_at
       FROM class_members m JOIN users u ON u.id = m.user_id
       WHERE m.class_id = ?
       ORDER BY u.display_name COLLATE NOCASE`,
    )
    .all(row.id)

  const assignments = db
    .prepare('SELECT * FROM assignments WHERE class_id = ? ORDER BY created_at DESC')
    .all(row.id)

  res.json({
    class: rowToClass(row),
    members: members.map((m) => ({
      id: m.id,
      username: m.username,
      displayName: m.display_name,
      grade: m.grade ?? null,
      joinedAt: m.joined_at,
    })),
    // includeAnswers: giao vien duoc xem dap an
    assignments: assignments.map((a) => rowToAssignment(a, { includeAnswers: true })),
  })
})

router.put('/classes/:id', (req, res) => {
  const { row, error } = getOwnedClass(req, req.params.id)
  if (error) return fail(res, error)

  const name = str(req.body?.name) || row.name
  if (name.length > 80) return res.status(422).json({ error: 'Tên lớp tối đa 80 ký tự.' })
  const archived = req.body?.archived === undefined ? row.archived : req.body.archived ? 1 : 0

  db.prepare('UPDATE classes SET name = ?, description = ?, archived = ? WHERE id = ?').run(
    name,
    req.body?.description === undefined ? row.description : str(req.body.description),
    archived,
    row.id,
  )
  logAction(req.user.id, 'update_class', row.id, name)
  res.json({ class: rowToClass(db.prepare('SELECT * FROM classes WHERE id = ?').get(row.id)) })
})

router.delete('/classes/:id', (req, res) => {
  const { row, error } = getOwnedClass(req, req.params.id)
  if (error) return fail(res, error)
  // ON DELETE CASCADE don luon class_members, assignments, submissions
  db.prepare('DELETE FROM classes WHERE id = ?').run(row.id)
  logAction(req.user.id, 'delete_class', row.id, row.name)
  res.json({ ok: true })
})

/** Doi ma tham gia — dung khi ma cu bi chia se ra ngoai lop. */
router.post('/classes/:id/rotate-code', (req, res) => {
  const { row, error } = getOwnedClass(req, req.params.id)
  if (error) return fail(res, error)
  const code = generateClassCode()
  db.prepare('UPDATE classes SET code = ? WHERE id = ?').run(code, row.id)
  logAction(req.user.id, 'rotate_class_code', row.id)
  res.json({ code })
})

router.delete('/classes/:id/members/:userId', (req, res) => {
  const { row, error } = getOwnedClass(req, req.params.id)
  if (error) return fail(res, error)
  const n = db
    .prepare('DELETE FROM class_members WHERE class_id = ? AND user_id = ?')
    .run(row.id, Number(req.params.userId)).changes
  if (!n) return res.status(404).json({ error: 'Học sinh này không ở trong lớp.' })
  logAction(req.user.id, 'remove_class_member', row.id, req.params.userId)
  res.json({ ok: true })
})

/* ------------------------------- De bai ------------------------------- */

/** Doc + validate payload de bai. Tra { value } hoac { error }. */
function readAssignmentBody(body) {
  const title = str(body?.title)
  if (!title) return { error: 'Nhập tiêu đề đề bài.' }
  if (title.length > 120) return { error: 'Tiêu đề tối đa 120 ký tự.' }

  const errors = []
  const questions = cleanQuiz(body?.questions, errors)
  if (errors.length) return { error: errors[0] }

  let dueAt = null
  if (body?.dueAt) {
    const d = new Date(body.dueAt)
    if (Number.isNaN(d.getTime())) return { error: 'Hạn nộp không hợp lệ.' }
    dueAt = d.toISOString()
  }

  const published = Boolean(body?.published)
  if (published && !questions.length) {
    return { error: 'Đề chưa có câu hỏi nào nên không thể giao cho học sinh.' }
  }

  return {
    value: { title, instructions: str(body?.instructions), questions, dueAt, published },
  }
}

router.post('/classes/:id/assignments', (req, res) => {
  const { row, error } = getOwnedClass(req, req.params.id)
  if (error) return fail(res, error)

  const { value, error: invalid } = readAssignmentBody(req.body)
  if (invalid) return res.status(422).json({ error: invalid })

  // Lay de tu mot bai hoc co san: sao chep cau hoi ra de sua bai hoc ve sau
  // khong lam doi de da giao cho hoc sinh.
  let lessonId = str(req.body?.lessonId) || null
  let questions = value.questions
  if (lessonId) {
    const lesson = db.prepare('SELECT id, quiz FROM lessons WHERE id = ?').get(lessonId)
    if (!lesson) return res.status(422).json({ error: 'Bài học không tồn tại.' })
    if (!questions.length) {
      const errors = []
      questions = cleanQuiz(parseJson(lesson.quiz, []), errors)
      if (!questions.length) {
        return res.status(422).json({ error: 'Bài học này chưa có câu hỏi trắc nghiệm để giao.' })
      }
    }
  }
  if (value.published && !questions.length) {
    return res.status(422).json({ error: 'Đề chưa có câu hỏi nào nên không thể giao cho học sinh.' })
  }

  const id = randomUUID()
  db.prepare(
    `INSERT INTO assignments (id, class_id, lesson_id, title, instructions, questions, due_at, published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    row.id,
    lessonId,
    value.title,
    value.instructions,
    JSON.stringify(questions),
    value.dueAt,
    value.published ? 1 : 0,
  )
  logAction(req.user.id, 'create_assignment', id, value.title)
  const created = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id)
  res.status(201).json({ assignment: rowToAssignment(created, { includeAnswers: true }) })
})

router.put('/assignments/:id', (req, res) => {
  const { row, error } = getOwnedAssignment(req, req.params.id)
  if (error) return fail(res, error)

  const { value, error: invalid } = readAssignmentBody(req.body)
  if (invalid) return res.status(422).json({ error: invalid })

  db.prepare(
    `UPDATE assignments
     SET title = ?, instructions = ?, questions = ?, due_at = ?, published = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
  ).run(
    value.title,
    value.instructions,
    JSON.stringify(value.questions),
    value.dueAt,
    value.published ? 1 : 0,
    row.id,
  )
  logAction(req.user.id, 'update_assignment', row.id, value.title)
  const updated = db.prepare('SELECT * FROM assignments WHERE id = ?').get(row.id)
  res.json({ assignment: rowToAssignment(updated, { includeAnswers: true }) })
})

router.delete('/assignments/:id', (req, res) => {
  const { row, error } = getOwnedAssignment(req, req.params.id)
  if (error) return fail(res, error)
  db.prepare('DELETE FROM assignments WHERE id = ?').run(row.id)
  logAction(req.user.id, 'delete_assignment', row.id, row.title)
  res.json({ ok: true })
})

/** Bai nop cua mot de + thong ke tung cau de biet hoc sinh sai nhieu o dau. */
router.get('/assignments/:id/submissions', (req, res) => {
  const { row, error } = getOwnedAssignment(req, req.params.id)
  if (error) return fail(res, error)

  const subs = db
    .prepare(
      `SELECT s.*, u.display_name AS student_name, u.username
       FROM submissions s JOIN users u ON u.id = s.student_id
       WHERE s.assignment_id = ?
       ORDER BY s.submitted_at DESC`,
    )
    .all(row.id)

  const questions = parseJson(row.questions, [])
  const submissions = subs.map(rowToSubmission)

  // Ti le dung tung cau: chi tinh tren nhung ban nop co tra loi cau do
  const perQuestion = questions.map((q, qi) => {
    let answered = 0
    let correct = 0
    for (const s of submissions) {
      const picked = s.answers?.[qi]
      if (picked === undefined || picked === null) continue
      answered++
      if (Number(picked) === q.answer) correct++
    }
    return {
      index: qi,
      question: q.question,
      answered,
      correct,
      correctRate: answered ? Math.round((correct / answered) * 100) : null,
    }
  })

  res.json({
    assignment: rowToAssignment(row, { includeAnswers: true }),
    submissions,
    perQuestion,
  })
})

/** Chua bi dung o Buoc 2 (trac nghiem tu cham) — san cho cau tu luan o Buoc 3. */
router.patch('/submissions/:id/grade', (req, res) => {
  const sub = db.prepare('SELECT * FROM submissions WHERE id = ?').get(req.params.id)
  if (!sub) return res.status(404).json({ error: 'Không tìm thấy bài nộp.' })
  const { error } = getOwnedAssignment(req, sub.assignment_id)
  if (error) return fail(res, error)

  const score = req.body?.score === null || req.body?.score === undefined ? null : Number(req.body.score)
  if (score !== null && (!Number.isFinite(score) || score < 0)) {
    return res.status(422).json({ error: 'Điểm không hợp lệ.' })
  }
  if (score !== null && sub.total !== null && score > sub.total) {
    return res.status(422).json({ error: `Điểm không thể lớn hơn ${sub.total}.` })
  }

  db.prepare(
    `UPDATE submissions
     SET score = ?, feedback = ?, status = 'graded', graded_by = ?, graded_at = datetime('now')
     WHERE id = ?`,
  ).run(score, str(req.body?.feedback), req.user.id, sub.id)
  logAction(req.user.id, 'grade_submission', sub.id, String(score))
  res.json({ submission: rowToSubmission(db.prepare('SELECT * FROM submissions WHERE id = ?').get(sub.id)) })
})

/* ---------------------------- Dashboard lop ---------------------------- */

/**
 * So lieu tong hop cua mot lop: tien do hoc ly thuyet + ket qua lam de.
 * Doc `progress` (dong bo tu client khi hoc sinh da dang nhap) nen chi phan
 * anh hoat dong sau khi hoc sinh dang nhap, khong tinh luc dung an danh.
 */
router.get('/classes/:id/dashboard', (req, res) => {
  const { row, error } = getOwnedClass(req, req.params.id)
  if (error) return fail(res, error)

  const members = db
    .prepare(
      `SELECT u.id, u.username, u.display_name, u.grade
       FROM class_members m JOIN users u ON u.id = m.user_id
       WHERE m.class_id = ?
       ORDER BY u.display_name COLLATE NOCASE`,
    )
    .all(row.id)

  const assignments = db
    .prepare('SELECT * FROM assignments WHERE class_id = ? ORDER BY created_at DESC')
    .all(row.id)
  const publishedIds = assignments.filter((a) => a.published).map((a) => a.id)

  // Bai hoc dung lam mau so cho tien do: gioi han theo lop/mon cua class neu co
  const filters = []
  const params = []
  if (row.grade) {
    filters.push('grade = ?')
    params.push(row.grade)
  }
  if (row.subject_id) {
    filters.push('subject_id = ?')
    params.push(row.subject_id)
  }
  const scopeSql = filters.length ? ` AND ${filters.join(' AND ')}` : ''
  const scopedLessons = db
    .prepare(`SELECT id FROM lessons WHERE status = 'published'${scopeSql}`)
    .all(...params)
  const scopedIds = new Set(scopedLessons.map((l) => l.id))

  const students = members.map((m) => {
    const prog = db
      .prepare('SELECT lesson_id, done_at, best_score, best_total FROM progress WHERE user_id = ?')
      .all(m.id)
    const inScope = prog.filter((p) => scopedIds.has(p.lesson_id))
    const lessonsDone = inScope.filter((p) => p.done_at).length

    const subs = publishedIds.length
      ? db
          .prepare(
            `SELECT assignment_id, score, total, status FROM submissions
             WHERE student_id = ? AND assignment_id IN (${publishedIds.map(() => '?').join(',')})`,
          )
          .all(m.id, ...publishedIds)
      : []

    const scored = subs.filter((s) => s.score !== null && s.total)
    const avgPercent = scored.length
      ? Math.round((scored.reduce((sum, s) => sum + s.score / s.total, 0) / scored.length) * 100)
      : null

    return {
      id: m.id,
      username: m.username,
      displayName: m.display_name,
      grade: m.grade ?? null,
      lessonsDone,
      lessonsTotal: scopedIds.size,
      submitted: subs.length,
      assignmentsTotal: publishedIds.length,
      avgPercent,
    }
  })

  const withAvg = students.filter((s) => s.avgPercent !== null)
  res.json({
    class: rowToClass(row),
    summary: {
      memberCount: members.length,
      assignmentCount: assignments.length,
      publishedCount: publishedIds.length,
      lessonsTotal: scopedIds.size,
      classAvgPercent: withAvg.length
        ? Math.round(withAvg.reduce((s, x) => s + x.avgPercent, 0) / withAvg.length)
        : null,
    },
    students,
    assignments: assignments.map((a) => {
      const stats = db
        .prepare(
          `SELECT COUNT(*) AS n, AVG(CASE WHEN total > 0 THEN CAST(score AS REAL) / total END) AS avg
           FROM submissions WHERE assignment_id = ? AND score IS NOT NULL`,
        )
        .get(a.id)
      return {
        ...rowToAssignment(a, { includeAnswers: true }),
        submissionCount: db
          .prepare('SELECT COUNT(*) AS n FROM submissions WHERE assignment_id = ?')
          .get(a.id).n,
        gradedCount: stats.n,
        avgPercent: stats.avg === null ? null : Math.round(stats.avg * 100),
      }
    }),
  })
})

export default router
