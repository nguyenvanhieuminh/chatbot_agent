import express from 'express'
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { attachUser, ensureDefaultAdmin, pruneSessions } from './auth.js'
import { backfillChapters, backfillSource } from './db.js'
import publicRoutes from './routes/public.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import teacherRoutes from './routes/teacher.js'
import studentRoutes from './routes/student.js'
import progressRoutes from './routes/progress.js'
import { runSeed } from './seed.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 3001)
const DIST = resolve(__dirname, '../dist')

const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '4mb' }))
app.use(attachUser)

app.use('/api', publicRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/teacher', teacherRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/progress', progressRoutes)

// Phuc vu ban build khi da chay `npm run build` (production 1 cong duy nhat)
if (existsSync(DIST)) {
  app.use(express.static(DIST))
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(resolve(DIST, 'index.html')))
}

// 404 cho API khong khop route nao
app.use('/api', (_req, res) => res.status(404).json({ error: 'Không có endpoint này.' }))

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[server]', err)
  res.status(500).json({ error: 'Lỗi máy chủ. Xem log để biết chi tiết.' })
})

runSeed({ quiet: true })
backfillChapters()
backfillSource()
pruneSessions()
setInterval(pruneSessions, 60 * 60 * 1000).unref()

const created = ensureDefaultAdmin()

app.listen(PORT, () => {
  console.log(`\n  API  → http://localhost:${PORT}/api`)
  if (existsSync(DIST)) console.log(`  Web  → http://localhost:${PORT}`)
  if (created) {
    console.log('\n  ┌─ Tài khoản admin đã được tạo ───────────────')
    console.log(`  │  Tên đăng nhập : ${created.username}`)
    console.log(`  │  Mật khẩu      : ${created.password}`)
    if (created.generated) console.log('  │  ⚠ Đổi mật khẩu này ngay trong /admin/tai-khoan')
    console.log('  └─────────────────────────────────────────────')
  }
  console.log('')
})
