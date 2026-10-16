const Database = require('better-sqlite3')
const { randomBytes, scryptSync } = require('node:crypto')
const { resolve } = require('node:path')

// Same hash function as server/auth.js
function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

const dbPath = resolve(__dirname, 'data/hoctap.db')
const db = new Database(dbPath)

// Xóa tất cả admin cũ
db.prepare('DELETE FROM admins').run()

// Hash password '123' bằng scrypt
const passwordHash = hashPassword('123')

// Tạo admin mới
const result = db.prepare(`
  INSERT INTO admins (username, password_hash, created_at)
  VALUES (?, ?, datetime('now'))
`).run('admin', passwordHash)

console.log('\n✅ Đã tạo admin account với scrypt hash:')
console.log('   Username: admin')
console.log('   Password: 123')
console.log('   ID:', result.lastInsertRowid)
console.log('\n🔗 Login tại: http://localhost:5173/#/admin/login\n')

db.close()
