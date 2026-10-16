import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { serializeLesson } from '../shared/parseContent.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const DB_PATH = process.env.DB_PATH || resolve(__dirname, '../data/pathvn.db')

mkdirSync(dirname(DB_PATH), { recursive: true })

export const db = new DatabaseSync(DB_PATH)

db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

/* ------------------------ Tien ich kiem tra schema ------------------------ */

function tableExists(name) {
  return Boolean(
    db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(name),
  )
}

function columnExists(table, column) {
  if (!tableExists(table)) return false
  return db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .some((c) => c.name === column)
}

/* --------------------- Migration danh tinh (admins -> users) ---------------------
 * PHAI chay TRUOC khoi CREATE TABLE ben duoi: neu doi ten bang xong ma khoi
 * CREATE TABLE van khai bao `admins` thi lan khoi dong sau se tao lai mot bang
 * `admins` rong, va session se tro ve bang sai.
 *
 * `ALTER TABLE ... RENAME TO` voi foreign_keys = ON tu cap nhat cac menh de
 * REFERENCES o bang khac (sessions.admin_id -> users(id)), nen khong mat rang buoc.
 */
function migrateIdentity() {
  if (tableExists('admins') && !tableExists('users')) {
    db.exec('ALTER TABLE admins RENAME TO users')
    console.log('[db] Da doi ten bang admins -> users')
  }
  if (columnExists('sessions', 'admin_id')) {
    db.exec('ALTER TABLE sessions RENAME COLUMN admin_id TO user_id')
    console.log('[db] Da doi ten cot sessions.admin_id -> user_id')
  }
  if (columnExists('audit_log', 'admin_id')) {
    db.exec('ALTER TABLE audit_log RENAME COLUMN admin_id TO user_id')
    console.log('[db] Da doi ten cot audit_log.admin_id -> user_id')
  }
}

migrateIdentity()

db.exec(`
CREATE TABLE IF NOT EXISTS subjects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  short       TEXT NOT NULL,
  icon        TEXT NOT NULL DEFAULT '📘',
  color       TEXT NOT NULL DEFAULT 'indigo',
  description TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS subject_grades (
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  grade      INTEGER NOT NULL,
  PRIMARY KEY (subject_id, grade)
);

CREATE TABLE IF NOT EXISTS chapters (
  id          TEXT PRIMARY KEY,
  subject_id  TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  grade       INTEGER NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 100,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_chapters_subject_grade ON chapters(subject_id, grade);

CREATE TABLE IF NOT EXISTS lessons (
  id          TEXT PRIMARY KEY,
  subject_id  TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  grade       INTEGER NOT NULL,
  chapter_id  TEXT REFERENCES chapters(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  summary     TEXT NOT NULL DEFAULT '',
  minutes     INTEGER NOT NULL DEFAULT 10,
  keywords    TEXT NOT NULL DEFAULT '[]',
  source      TEXT NOT NULL DEFAULT '',
  blocks      TEXT NOT NULL DEFAULT '[]',
  flashcards  TEXT NOT NULL DEFAULT '[]',
  quiz        TEXT NOT NULL DEFAULT '[]',
  status      TEXT NOT NULL DEFAULT 'published',
  sort_order  INTEGER NOT NULL DEFAULT 100,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_lessons_subject_grade ON lessons(subject_id, grade);
CREATE INDEX IF NOT EXISTS idx_lessons_grade ON lessons(grade);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON lessons(status);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  email         TEXT,
  grade         INTEGER,
  disabled      INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER,
  action     TEXT NOT NULL,
  target     TEXT NOT NULL DEFAULT '',
  detail     TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

/* ------------------------- Lop hoc cua giao vien ------------------------- */

CREATE TABLE IF NOT EXISTS classes (
  id          TEXT PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  teacher_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grade       INTEGER,
  subject_id  TEXT REFERENCES subjects(id) ON DELETE SET NULL,
  description TEXT NOT NULL DEFAULT '',
  archived    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);

CREATE TABLE IF NOT EXISTS class_members (
  class_id  TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (class_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_class_members_user ON class_members(user_id);

/* Cot questions dung dung shape voi lessons.quiz, xem cleanQuiz() o validate.js.
 * lesson_id chi de ghi nguon goc khi giao vien lay de tu mot bai co san — de van
 * duoc sao chep vao questions, nen sua bai hoc khong lam doi de da giao. */
CREATE TABLE IF NOT EXISTS assignments (
  id         TEXT PRIMARY KEY,
  class_id   TEXT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  lesson_id  TEXT REFERENCES lessons(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  questions  TEXT NOT NULL DEFAULT '[]',
  due_at     TEXT,
  published  INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);

/* Moi hoc sinh chi co mot ban nop cho moi de (UNIQUE) — nop lai thi ghi de. */
CREATE TABLE IF NOT EXISTS submissions (
  id            TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  answers       TEXT NOT NULL DEFAULT '{}',
  score         INTEGER,
  total         INTEGER,
  status        TEXT NOT NULL DEFAULT 'submitted',
  feedback      TEXT NOT NULL DEFAULT '',
  graded_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  graded_at     TEXT,
  submitted_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);

/* ------------------- Tien do hoc tap dong bo len server -------------------
 * Chi luu cho nguoi da dang nhap. Khach van dung localStorage nhu truoc.
 * Dashboard cua giao vien doc tu day. */
CREATE TABLE IF NOT EXISTS progress (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id  TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  done_at    TEXT,
  best_score INTEGER,
  best_total INTEGER,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_lesson ON progress(lesson_id);
`)

/* --------------------------- Migration --------------------------- */

/**
 * `CREATE TABLE IF NOT EXISTS` khong them cot vao bang da ton tai, nen DB cu
 * thieu cac cot moi. Bo sung bang ALTER TABLE — `columnExists`/`tableExists`
 * dinh nghia o dau file vi migration danh tinh can dung truoc khoi CREATE.
 */

/**
 * DB cu chi co admin, nen khi vua them cot `role` thi moi hang dang co deu
 * la quan tri vien — gan 'admin' cho chung truoc khi mac dinh 'student' co
 * hieu luc voi nguoi dang ky moi.
 */
if (!columnExists('users', 'role')) {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student'")
  const n = db.prepare("UPDATE users SET role = 'admin'").run().changes
  console.log(`[db] Da them cot users.role, gan 'admin' cho ${n} tai khoan co san`)
}

if (!columnExists('users', 'email')) {
  db.exec('ALTER TABLE users ADD COLUMN email TEXT')
  console.log('[db] Da them cot users.email')
}

if (!columnExists('users', 'grade')) {
  db.exec('ALTER TABLE users ADD COLUMN grade INTEGER')
  console.log('[db] Da them cot users.grade')
}

if (!columnExists('users', 'disabled')) {
  db.exec('ALTER TABLE users ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0')
  console.log('[db] Da them cot users.disabled')
}

/**
 * `ALTER TABLE ADD COLUMN` khong nhan rang buoc UNIQUE, nen email phai duoc
 * bao dam duy nhat bang index rieng. Index mot phan de nhieu tai khoan khong
 * khai email van hop le.
 */
db.exec(
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL',
)
db.exec('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)')

/**
 * Session mo coi: tro tới user da bi xoa tu truoc khi foreign_keys duoc bat.
 * Chung khong the dang nhap ai (getSessionUser dung JOIN nen tra null) nhung
 * lam `PRAGMA foreign_key_check` bao loi, nen xoa cho sach.
 */
{
  const orphans = db
    .prepare('DELETE FROM sessions WHERE user_id NOT IN (SELECT id FROM users)')
    .run().changes
  if (orphans) console.log(`[db] Da xoa ${orphans} session mo coi`)
}

if (!columnExists('lessons', 'chapter_id')) {
  db.exec('ALTER TABLE lessons ADD COLUMN chapter_id TEXT REFERENCES chapters(id) ON DELETE SET NULL')
  console.log('[db] Da them cot lessons.chapter_id')
}

if (!columnExists('lessons', 'source')) {
  db.exec("ALTER TABLE lessons ADD COLUMN source TEXT NOT NULL DEFAULT ''")
  console.log('[db] Da them cot lessons.source')
}

/* -------------------- Multi-content support migration -------------------- */

if (!columnExists('lessons', 'content_type')) {
  db.exec("ALTER TABLE lessons ADD COLUMN content_type TEXT NOT NULL DEFAULT 'k12' CHECK (content_type IN ('k12', 'professional', 'blog', 'course'))")
  console.log('[db] Da them cot lessons.content_type')
}

if (!columnExists('lessons', 'category')) {
  db.exec('ALTER TABLE lessons ADD COLUMN category TEXT')
  console.log('[db] Da them cot lessons.category')
}

if (!columnExists('lessons', 'tags')) {
  db.exec("ALTER TABLE lessons ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'")
  console.log('[db] Da them cot lessons.tags')
}

if (!columnExists('lessons', 'author_id')) {
  db.exec('ALTER TABLE lessons ADD COLUMN author_id INTEGER REFERENCES users(id) ON DELETE SET NULL')
  console.log('[db] Da them cot lessons.author_id')
}

if (!columnExists('lessons', 'level')) {
  db.exec("ALTER TABLE lessons ADD COLUMN level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', NULL))")
  console.log('[db] Da them cot lessons.level')
}

// Create indexes for new content types
db.exec('CREATE INDEX IF NOT EXISTS idx_lessons_content_type ON lessons(content_type)')
db.exec('CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category)')
db.exec('CREATE INDEX IF NOT EXISTS idx_lessons_author ON lessons(author_id)')

/**
 * Bai hoc cu chi co `blocks` -> dung lai van ban nguon tu blocks, de editor
 * text co noi dung ma sua. Chi chay mot lan cho moi bai.
 */
export function backfillSource() {
  const rows = db
    .prepare("SELECT id, blocks, flashcards, quiz FROM lessons WHERE source = ''")
    .all()
  if (!rows.length) return 0

  const update = db.prepare('UPDATE lessons SET source = ? WHERE id = ?')
  let n = 0
  for (const r of rows) {
    const text = serializeLesson({
      blocks: parseJson(r.blocks, []),
      flashcards: parseJson(r.flashcards, []),
      quiz: parseJson(r.quiz, []),
    })
    if (!text.trim()) continue
    update.run(text, r.id)
    n++
  }
  if (n) console.log(`[db] Da dung lai van ban nguon cho ${n} bai hoc`)
  return n
}

/**
 * Bai hoc chua thuoc chuong nao -> gom vao mot chuong mac dinh cho tung
 * cap (mon, lop), de trang cong khai luon co cau truc chuong de duyet.
 */
export function backfillChapters() {
  const orphans = db
    .prepare('SELECT subject_id, grade, COUNT(*) n FROM lessons WHERE chapter_id IS NULL GROUP BY subject_id, grade')
    .all()
  if (!orphans.length) return 0

  const insertChapter = db.prepare(
    `INSERT OR IGNORE INTO chapters (id, subject_id, grade, title, description, sort_order)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
  const linkLessons = db.prepare(
    'UPDATE lessons SET chapter_id = ? WHERE subject_id = ? AND grade = ? AND chapter_id IS NULL',
  )

  let created = 0
  for (const { subject_id, grade } of orphans) {
    const chapterId = `${subject_id}-${grade}.chuong-1`
    insertChapter.run(chapterId, subject_id, grade, 'Chương 1', 'Nội dung tổng hợp', 1)
    linkLessons.run(chapterId, subject_id, grade)
    created++
  }
  console.log(`[db] Da tao ${created} chuong mac dinh cho bai hoc chua phan chuong`)
  return created
}

/**
 * Chay `fn` trong mot transaction.
 *
 * `node:sqlite` KHONG co helper `db.transaction()` nhu better-sqlite3, nen phai
 * tu phat BEGIN/COMMIT/ROLLBACK. SQLite khong cho long transaction, vi vay `fn`
 * tuyet doi khong duoc goi lai `withTransaction`.
 */
export function withTransaction(fn) {
  db.exec('BEGIN')
  try {
    const result = fn()
    db.exec('COMMIT')
    return result
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

/** Doc JSON tu cot TEXT, tra ve fallback neu du lieu loi. */
export function parseJson(value, fallback) {
  try {
    const parsed = JSON.parse(value)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

/** Chuyen mot dong `lessons` tu DB thanh object cho client. */
export function rowToLesson(row) {
  return {
    id: row.id,
    subjectId: row.subject_id,
    grade: row.grade,
    chapterId: row.chapter_id ?? null,
    title: row.title,
    summary: row.summary,
    minutes: row.minutes,
    status: row.status,
    sortOrder: row.sort_order,
    source: row.source ?? '',
    keywords: parseJson(row.keywords, []),
    blocks: parseJson(row.blocks, []),
    flashcards: parseJson(row.flashcards, []),
    quiz: parseJson(row.quiz, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // Multi-content fields
    contentType: row.content_type ?? 'k12',
    category: row.category ?? null,
    tags: parseJson(row.tags, []),
    authorId: row.author_id ?? null,
    level: row.level ?? null,
  }
}

export function rowToSubject(row) {
  return {
    id: row.id,
    name: row.name,
    short: row.short,
    icon: row.icon,
    color: row.color,
    description: row.description,
    sortOrder: row.sort_order,
  }
}

export function rowToChapter(row) {
  return {
    id: row.id,
    subjectId: row.subject_id,
    grade: row.grade,
    title: row.title,
    description: row.description,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/** Chuyen mot dong `users` thanh object cho client — khong bao gio kem password_hash. */
export function rowToUser(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    email: row.email ?? null,
    grade: row.grade ?? null,
    disabled: Boolean(row.disabled),
    createdAt: row.created_at,
  }
}

export function rowToClass(row) {
  if (!row) return null
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    teacherId: row.teacher_id,
    teacherName: row.teacher_name ?? undefined,
    grade: row.grade ?? null,
    subjectId: row.subject_id ?? null,
    description: row.description,
    archived: Boolean(row.archived),
    createdAt: row.created_at,
    // Chi co khi query co JOIN dem
    memberCount: row.member_count,
    assignmentCount: row.assignment_count,
  }
}

export function rowToAssignment(row, { includeAnswers = false } = {}) {
  if (!row) return null
  const questions = parseJson(row.questions, [])
  return {
    id: row.id,
    classId: row.class_id,
    lessonId: row.lesson_id ?? null,
    title: row.title,
    instructions: row.instructions,
    // Hoc sinh chua nop khong duoc thay dap an — xem stripAnswers()
    questions: includeAnswers ? questions : stripAnswers(questions),
    questionCount: questions.length,
    dueAt: row.due_at ?? null,
    published: Boolean(row.published),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Bo `answer` va `explain` khoi cau hoi truoc khi gui cho hoc sinh dang lam bai.
 * Neu khong lam viec nay thi dap an nam san trong JSON tra ve — mo DevTools la
 * thay, bai kiem tra thanh vo nghia.
 */
export function stripAnswers(questions) {
  return questions.map(({ question, options }) => ({ question, options }))
}

export function rowToSubmission(row) {
  if (!row) return null
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    studentId: row.student_id,
    studentName: row.student_name ?? undefined,
    answers: parseJson(row.answers, {}),
    score: row.score ?? null,
    total: row.total ?? null,
    status: row.status,
    feedback: row.feedback,
    gradedBy: row.graded_by ?? null,
    gradedAt: row.graded_at ?? null,
    submittedAt: row.submitted_at,
  }
}

/**
 * Sinh ma tham gia lop. Bo cac ky tu de doc nham khi giao vien viet len bang:
 * 0/O, 1/I/L, 2/Z, 5/S, 8/B.
 */
const CODE_ALPHABET = 'ACDEFGHJKMNPQRTUVWXY3467'

export function generateClassCode() {
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
    }
    const taken = db.prepare('SELECT 1 FROM classes WHERE code = ?').get(code)
    if (!taken) return code
  }
  throw new Error('Không sinh được mã lớp mới, thử lại.')
}

export function logAction(userId, action, target = '', detail = '') {
  db.prepare('INSERT INTO audit_log (user_id, action, target, detail) VALUES (?, ?, ?, ?)').run(
    userId ?? null,
    action,
    target,
    typeof detail === 'string' ? detail : JSON.stringify(detail),
  )
}
