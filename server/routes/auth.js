import { Router } from 'express'
import { db, logAction, rowToUser } from '../db.js'
import { GRADES } from '../../shared/curriculum.js'
import {
  verifyPassword,
  hashPassword,
  createSession,
  destroySession,
  destroyAllSessions,
  setSessionCookie,
  clearSessionCookie,
  requireAuth,
  createUser,
  SELF_SIGNUP_ROLES,
  checkRateLimit,
  recordFailure,
  clearFailures,
  checkSignupLimit,
  recordSignup,
} from '../auth.js'

const router = Router()

const USERNAME_RE = /^[a-z0-9][a-z0-9._-]{2,31}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Kiem tra du lieu dang ky, tra { value } hoac { error }. */
function validateSignup(body) {
  // Ten dang nhap khong phan biet hoa thuong de nguoi dung khong bi nham
  const username = String(body?.username ?? '').trim().toLowerCase()
  const password = String(body?.password ?? '')
  const displayName = String(body?.displayName ?? '').trim()
  const role = String(body?.role ?? '')
  const rawEmail = String(body?.email ?? '').trim().toLowerCase()
  const rawGrade = body?.grade

  if (!USERNAME_RE.test(username)) {
    return {
      error:
        'Tên đăng nhập phải dài 3–32 ký tự, chỉ gồm chữ thường, số và . _ - và bắt đầu bằng chữ hoặc số.',
    }
  }
  if (password.length < 8) return { error: 'Mật khẩu phải có ít nhất 8 ký tự.' }
  if (displayName.length > 60) return { error: 'Tên hiển thị quá dài (tối đa 60 ký tự).' }
  if (!SELF_SIGNUP_ROLES.includes(role)) {
    return { error: 'Chỉ có thể đăng ký với vai trò giáo viên hoặc học sinh.' }
  }
  if (rawEmail && !EMAIL_RE.test(rawEmail)) return { error: 'Email không hợp lệ.' }

  let grade = null
  if (rawGrade !== undefined && rawGrade !== null && rawGrade !== '') {
    grade = Number(rawGrade)
    if (!GRADES.includes(grade)) return { error: 'Khối lớp phải từ 1 đến 12.' }
  }
  // Khoi lop chi co y nghia voi hoc sinh
  if (role !== 'student') grade = null

  return {
    value: { username, password, displayName, role, email: rawEmail || null, grade },
  }
}

router.get('/me', (req, res) => {
  res.json({ user: req.user ?? null })
})

router.post('/register', (req, res) => {
  const ip = req.ip || 'unknown'
  const wait = checkSignupLimit(ip)
  if (wait > 0) {
    return res.status(429).json({
      error: `Đã tạo quá nhiều tài khoản từ thiết bị này. Thử lại sau ${Math.ceil(wait / 60)} phút.`,
    })
  }

  const { value, error } = validateSignup(req.body)
  if (error) return res.status(422).json({ error })

  let user
  try {
    user = createUser(value)
  } catch (err) {
    // createUser gan .status cho loi trung ten/email
    if (err.status) return res.status(err.status).json({ error: err.message })
    throw err
  }

  recordSignup(ip)
  logAction(user.id, 'register', user.username, { role: user.role })

  // Dang nhap luon sau khi dang ky cho do mot buoc
  const { token, expiresAt } = createSession(user.id)
  setSessionCookie(res, token, expiresAt)
  res.status(201).json({ user })
})

router.post('/login', (req, res) => {
  const ip = req.ip || 'unknown'
  const wait = checkRateLimit(ip)
  if (wait > 0) {
    return res
      .status(429)
      .json({ error: `Sai quá nhiều lần. Thử lại sau ${Math.ceil(wait / 60)} phút.` })
  }

  const username = String(req.body?.username ?? '').trim().toLowerCase()
  const password = String(req.body?.password ?? '')
  if (!username || !password) {
    return res.status(400).json({ error: 'Nhập đủ tên đăng nhập và mật khẩu.' })
  }

  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!row || !verifyPassword(password, row.password_hash)) {
    recordFailure(ip)
    logAction(null, 'login_failed', username)
    // Khong tiet lo la sai ten hay sai mat khau
    return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không đúng.' })
  }
  if (row.disabled) {
    logAction(row.id, 'login_blocked', username)
    return res.status(403).json({ error: 'Tài khoản này đã bị khoá. Liên hệ quản trị viên.' })
  }

  clearFailures(ip)
  const { token, expiresAt } = createSession(row.id)
  setSessionCookie(res, token, expiresAt)
  logAction(row.id, 'login', username)
  res.json({ user: rowToUser(row) })
})

router.post('/logout', (req, res) => {
  destroySession(req.sessionToken)
  clearSessionCookie(res)
  res.json({ ok: true })
})

router.post('/change-password', requireAuth, (req, res) => {
  const current = String(req.body?.currentPassword ?? '')
  const next = String(req.body?.newPassword ?? '')
  if (next.length < 8) {
    return res.status(422).json({ error: 'Mật khẩu mới phải có ít nhất 8 ký tự.' })
  }
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)
  if (!verifyPassword(current, row.password_hash)) {
    return res.status(401).json({ error: 'Mật khẩu hiện tại không đúng.' })
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(next), req.user.id)
  // Dang xuat moi phien khac cho an toan
  destroyAllSessions(req.user.id)
  clearSessionCookie(res)
  logAction(req.user.id, 'change_password', row.username)
  res.json({ ok: true, message: 'Đã đổi mật khẩu. Vui lòng đăng nhập lại.' })
})

export default router
