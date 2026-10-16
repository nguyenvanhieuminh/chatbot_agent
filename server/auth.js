import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { db, logAction, rowToUser } from './db.js'

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 ngay
export const COOKIE_NAME = 'pathvn_sid'

export const ROLES = ['admin', 'teacher', 'student']

/** Vai tro nguoi dung tu dang ky duoc chon — `admin` chi tao tu server/CLI. */
export const SELF_SIGNUP_ROLES = ['teacher', 'student']

/* ----------------------------- Mat khau ----------------------------- */

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored).split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  if (candidate.length !== expected.length) return false
  return timingSafeEqual(candidate, expected)
}

/* ----------------------------- Session ----------------------------- */

export function createSession(userId) {
  const token = randomBytes(32).toString('hex')
  const expiresAt = Date.now() + SESSION_TTL_MS
  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(
    token,
    userId,
    expiresAt,
  )
  return { token, expiresAt }
}

export function destroySession(token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
}

/** Dang xuat moi thiet bi cua mot nguoi — dung khi doi mat khau hoac bi khoa. */
export function destroyAllSessions(userId) {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId)
}

export function getSessionUser(token) {
  if (!token) return null
  const row = db
    .prepare(
      `SELECT s.expires_at, u.*
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`,
    )
    .get(token)
  if (!row) return null
  if (row.expires_at < Date.now()) {
    destroySession(token)
    return null
  }
  // Tai khoan bi khoa coi nhu chua dang nhap, khong can cho session het han
  if (row.disabled) return null
  return rowToUser(row)
}

/** Don session het han - goi dinh ky khi server chay. */
export function pruneSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
}

/* ----------------------------- Cookie ----------------------------- */

export function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i === -1) continue
    out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export function setSessionCookie(res, token, expiresAt) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Expires=${new Date(expiresAt).toUTCString()}${secure}`,
  )
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`)
}

/* --------------------------- Middleware --------------------------- */

export function attachUser(req, _res, next) {
  const cookies = parseCookies(req.headers.cookie || '')
  req.user = getSessionUser(cookies[COOKIE_NAME])
  req.sessionToken = cookies[COOKIE_NAME] ?? null
  next()
}

/** Chi can dang nhap, khong phan biet vai tro. */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên đã hết hạn.' })
  }
  next()
}

/**
 * Chan theo vai tro. Tra 401 khi chua dang nhap va 403 khi da dang nhap nhung
 * sai quyen — hai truong hop nay client xu ly khac nhau (mot cai day ve trang
 * dang nhap, mot cai hien thong bao khong co quyen).
 */
export function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa đăng nhập hoặc phiên đã hết hạn.' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bạn không có quyền thực hiện việc này.' })
    }
    next()
  }
}

export const requireAdmin = requireRole('admin')
export const requireTeacher = requireRole('teacher', 'admin')

/* ------------------------- Chong do mat khau ------------------------- */

const attempts = new Map() // ip -> { count, until }
const MAX_ATTEMPTS = 8
const LOCK_MS = 10 * 60 * 1000

export function checkRateLimit(ip) {
  const rec = attempts.get(ip)
  if (rec && rec.until > Date.now() && rec.count >= MAX_ATTEMPTS) {
    return Math.ceil((rec.until - Date.now()) / 1000)
  }
  return 0
}

export function recordFailure(ip) {
  const now = Date.now()
  const rec = attempts.get(ip)
  if (!rec || rec.until < now) attempts.set(ip, { count: 1, until: now + LOCK_MS })
  else attempts.set(ip, { count: rec.count + 1, until: now + LOCK_MS })
}

export function clearFailures(ip) {
  attempts.delete(ip)
}

/**
 * Dang ky mo cho moi nguoi, nen can chan tao tai khoan hang loat. Dem ca lan
 * thanh cong (khac `attempts` chi dem lan sai) va tinh theo cua so truot.
 */
const registrations = new Map() // ip -> number[] (timestamp)
const MAX_SIGNUPS = 5
const SIGNUP_WINDOW_MS = 60 * 60 * 1000

export function checkSignupLimit(ip) {
  const now = Date.now()
  const recent = (registrations.get(ip) ?? []).filter((t) => now - t < SIGNUP_WINDOW_MS)
  registrations.set(ip, recent)
  if (recent.length < MAX_SIGNUPS) return 0
  return Math.ceil((SIGNUP_WINDOW_MS - (now - recent[0])) / 1000)
}

export function recordSignup(ip) {
  const list = registrations.get(ip) ?? []
  list.push(Date.now())
  registrations.set(ip, list)
}

/* --------------------------- Tao tai khoan --------------------------- */

/**
 * Tao nguoi dung moi. Nem loi co `.status` de route tra dung ma HTTP thay vi
 * de rang buoc UNIQUE cua SQLite noi len thanh loi 500.
 */
export function createUser({ username, password, displayName = '', role, email = null, grade = null }) {
  if (!ROLES.includes(role)) {
    const err = new Error('Vai trò không hợp lệ.')
    err.status = 422
    throw err
  }
  const taken = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)
  if (taken) {
    const err = new Error('Tên đăng nhập này đã có người dùng.')
    err.status = 409
    throw err
  }
  if (email) {
    const dup = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email)
    if (dup) {
      const err = new Error('Email này đã được dùng cho tài khoản khác.')
      err.status = 409
      throw err
    }
  }

  const info = db
    .prepare(
      `INSERT INTO users (username, display_name, password_hash, role, email, grade)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(username, displayName || username, hashPassword(password), role, email, grade)

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
  return rowToUser(row)
}

export function ensureDefaultAdmin() {
  const count = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get().n
  if (count > 0) return null

  const username = process.env.ADMIN_USER || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'pathvn@2026'
  createUser({ username, password, displayName: 'Quản trị viên', role: 'admin' })
  logAction(null, 'create_default_admin', username)

  return { username, password, generated: !process.env.ADMIN_PASSWORD }
}
