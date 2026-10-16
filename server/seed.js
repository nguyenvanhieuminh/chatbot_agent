import { pathToFileURL } from 'node:url'
import { db, logAction } from './db.js'
import { SUBJECT_CATALOG, GRADE_SUBJECTS } from '../shared/curriculum.js'
import lessonsCoBan from './seed/lessons-co-ban.js'

// Legacy data imports removed - data now managed via database and admin CMS
// If you need to re-seed, use Admin > Import/Export feature
const LEGACY_SUBJECTS = []

/** Lessons tu cac file src/data/*.js -> dang phang. */
function legacyLessons() {
  return LEGACY_SUBJECTS.flatMap((s) =>
    s.lessons.map((l, i) => ({
      id: l.id,
      subjectId: s.id,
      grade: l.grade,
      title: l.title,
      summary: l.summary,
      minutes: l.minutes,
      keywords: l.keywords ?? [],
      blocks: l.blocks ?? [],
      flashcards: l.flashcards ?? [],
      quiz: l.quiz ?? [],
      sortOrder: (i + 1) * 10,
    })),
  )
}

export function seedSubjects() {
  const upsert = db.prepare(`
    INSERT INTO subjects (id, name, short, icon, color, description, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      short = excluded.short,
      icon = excluded.icon,
      color = excluded.color,
      description = excluded.description,
      sort_order = excluded.sort_order
  `)
  for (const s of SUBJECT_CATALOG) {
    upsert.run(s.id, s.name, s.short, s.icon, s.color, s.description ?? '', s.order ?? 100)
  }

  const link = db.prepare(
    'INSERT OR IGNORE INTO subject_grades (subject_id, grade) VALUES (?, ?)',
  )
  for (const [grade, ids] of Object.entries(GRADE_SUBJECTS)) {
    for (const id of ids) link.run(id, Number(grade))
  }
}

/** Chi chen bai chua co (INSERT OR IGNORE) - khong ghi de bai admin da sua. */
export function seedLessons() {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO lessons
      (id, subject_id, grade, title, summary, minutes, keywords, blocks, flashcards, quiz, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)
  `)

  let inserted = 0
  const all = [...legacyLessons(), ...lessonsCoBan.map((l, i) => ({ ...l, sortOrder: l.sortOrder ?? (i + 1) * 10 }))]

  for (const l of all) {
    const res = insert.run(
      l.id,
      l.subjectId,
      l.grade,
      l.title,
      l.summary ?? '',
      l.minutes ?? 10,
      JSON.stringify(l.keywords ?? []),
      JSON.stringify(l.blocks ?? []),
      JSON.stringify(l.flashcards ?? []),
      JSON.stringify(l.quiz ?? []),
      l.sortOrder ?? 100,
    )
    inserted += Number(res.changes) || 0
  }
  return inserted
}

export function runSeed({ quiet = false } = {}) {
  seedSubjects()
  const inserted = seedLessons()
  if (inserted > 0) logAction(null, 'seed', 'lessons', `${inserted} bài`)
  if (!quiet) {
    const subjects = db.prepare('SELECT COUNT(*) n FROM subjects').get().n
    const lessons = db.prepare('SELECT COUNT(*) n FROM lessons').get().n
    console.log(`[seed] ${subjects} môn · ${lessons} bài học (mới thêm ${inserted})`)
  }
  return inserted
}

// Cho phep chay truc tiep: node server/seed.js
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runSeed()
}
