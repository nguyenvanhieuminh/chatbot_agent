/**
 * Sinh lai cot `source` tu `blocks` cho nhung bai ma source khong con parse
 * ra dung blocks.
 *
 * Can thiet vi `source` cua cac bai seed duoc sinh boi ban serializeLesson cu,
 * ban do chua co cu phap cho khoi so sanh (bi ep thanh 2 hop ghi chu) va lam
 * mat tieu de cua steps / example. Bai nao nhu vay chi can admin mo ra bam Luu
 * la noi dung cong khai bi hong, vi server parse lai source de ghi de blocks.
 *
 * `blocks` la nguon dung (day la thu trang cong khai render), `source` chi la
 * ban van ban de sua — nen sinh lai source tu blocks khong lam mat thong tin.
 *
 * Chay:  node server/fix-source.js --dry-run
 *        node server/fix-source.js
 */
import { db, rowToLesson } from './db.js'
import { parsePastedContent, serializeLesson } from '../shared/parseContent.js'

const dryRun = process.argv.includes('--dry-run')

/** So sanh khong phu thuoc thu tu key. */
const norm = (v) =>
  Array.isArray(v)
    ? v.map(norm)
    : v && typeof v === 'object'
      ? Object.fromEntries(
          Object.keys(v)
            .sort()
            .map((k) => [k, norm(v[k])]),
        )
      : v
const sameBlocks = (a, b) => JSON.stringify(norm(a)) === JSON.stringify(norm(b))

const lessons = db.prepare('SELECT * FROM lessons').all().map(rowToLesson)
const update = db.prepare("UPDATE lessons SET source = ?, updated_at = datetime('now') WHERE id = ?")

let fixed = 0
let stillBroken = 0

for (const lesson of lessons) {
  if (!lesson.blocks.length) continue
  if (lesson.source.trim() && sameBlocks(lesson.blocks, parsePastedContent(lesson.source).blocks)) {
    continue
  }

  const source = serializeLesson(lesson)
  const check = parsePastedContent(source)
  if (!sameBlocks(lesson.blocks, check.blocks)) {
    // Sinh lai van chua khop — khong ghi, de lai cho nguoi xem
    const lost = lesson.blocks
      .filter((b) => !check.blocks.some((q) => sameBlocks(b, q)))
      .map((b) => b.type)
    console.log(`  ! ${lesson.id} — sinh lai van lech (${lost.join(', ')}), bo qua`)
    stillBroken++
    continue
  }

  if (!dryRun) update.run(source, lesson.id)
  console.log(`  ${dryRun ? '[thu]' : '[sua]'} ${lesson.id}`)
  fixed++
}

console.log(
  `\n${dryRun ? 'Se sua' : 'Da sua'} ${fixed} bai` +
    (stillBroken ? `, ${stillBroken} bai can xem tay` : '') +
    ` / ${lessons.length} bai.`,
)
