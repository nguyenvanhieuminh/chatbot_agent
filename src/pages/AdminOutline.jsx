import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, ApiError } from '../api/client.js'
import { useContent } from '../context/ContentContext.jsx'
import { GRADE_SUBJECTS, GRADES, SUBJECT_CATALOG } from '../../shared/curriculum.js'
import { Spinner } from '../components/States.jsx'

const FIELD =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
const LABEL = 'mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400'

const SAMPLE_OUTLINE = `Chương 1: Mệnh đề và tập hợp
  Mệnh đề toán học
  Tập hợp và các phép toán
Chương 2: Bất phương trình
  - Bất phương trình bậc nhất hai ẩn
  - Hệ bất phương trình
Chương 3: Hàm số và đồ thị
  Khái niệm hàm số
  Hàm số bậc hai
  Dấu của tam thức bậc hai`

/**
 * Trang "tao khung noi dung": dan outline dang text -> tao hang loat
 * chuong + bai hoc draft, va quan ly cay chuong da co cua tung (mon, lop).
 */
export default function AdminOutline() {
  const navigate = useNavigate()
  const content = useContent()

  const [grade, setGrade] = useState(10)
  const [subjectId, setSubjectId] = useState('toan')
  const [outline, setOutline] = useState('')
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState([])
  const [flash, setFlash] = useState('')

  const [chapters, setChapters] = useState([])
  const [loadingTree, setLoadingTree] = useState(true)

  /* -------------------- Mon hop le theo lop dang chon -------------------- */
  const allowedSubjects = useMemo(() => {
    const ids = GRADE_SUBJECTS[grade] ?? []
    return SUBJECT_CATALOG.filter((s) => ids.includes(s.id))
  }, [grade])

  useEffect(() => {
    if (allowedSubjects.length && !allowedSubjects.some((s) => s.id === subjectId)) {
      setSubjectId(allowedSubjects[0].id)
    }
  }, [allowedSubjects, subjectId])

  /* ------------------------- Nap cay chuong hien co ------------------------- */
  const loadTree = useCallback(async () => {
    setLoadingTree(true)
    try {
      const rows = await api.listChapters({ subject: subjectId, grade })
      setChapters(rows)
    } catch (err) {
      setErrors([err.message])
    } finally {
      setLoadingTree(false)
    }
  }, [subjectId, grade])

  useEffect(() => {
    loadTree()
  }, [loadTree])

  /* ------------------------------ Hanh dong ------------------------------ */

  async function runPreview() {
    if (!outline.trim()) return
    setBusy(true)
    setErrors([])
    setFlash('')
    try {
      const result = await api.createOutline(subjectId, grade, outline, true)
      setPreview(result)
    } catch (err) {
      setPreview(null)
      setErrors(err instanceof ApiError && err.errors?.length ? err.errors : [err.message])
    } finally {
      setBusy(false)
    }
  }

  async function apply() {
    setBusy(true)
    setErrors([])
    setFlash('')
    try {
      const result = await api.createOutline(subjectId, grade, outline, false)
      setFlash(
        `Đã tạo ${result.chaptersCreated} chương và ${result.lessonsCreated} bài học (bản nháp).` +
          (result.skipped.length ? ` Bỏ qua ${result.skipped.length} mục đã tồn tại.` : ''),
      )
      setOutline('')
      setPreview(null)
      content.reload()
      await loadTree()
    } catch (err) {
      setErrors(err instanceof ApiError && err.errors?.length ? err.errors : [err.message])
    } finally {
      setBusy(false)
    }
  }

  async function removeChapter(ch) {
    if (!confirm(`Xoá chương “${ch.title}”?`)) return
    try {
      await api.deleteChapter(ch.id)
      content.reload()
      await loadTree()
    } catch (err) {
      alert(err.message)
    }
  }

  const subjectMeta = SUBJECT_CATALOG.find((s) => s.id === subjectId)
  const totalLessons = chapters.reduce((sum, c) => sum + c.lessonCount, 0)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Tạo khung nội dung</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Dán mục lục sách giáo khoa để tạo hàng loạt chương và bài học. Bài tạo ra ở dạng
          <strong> bản nháp</strong> — mở từng bài để dán nội dung sau.
        </p>
      </div>

      {/* Chọn lớp + môn */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor="outline-grade">
            Khối lớp
          </label>
          <select
            id="outline-grade"
            className={FIELD}
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
          >
            {GRADES.map((g) => (
              <option key={g} value={g}>
                Lớp {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor="outline-subject">
            Môn học
          </label>
          <select
            id="outline-subject"
            className={FIELD}
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
          >
            {allowedSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Thông báo */}
      {flash && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          {flash}
        </p>
      )}
      {errors.length > 0 && (
        <ul className="space-y-1 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {errors.map((e, i) => (
            <li key={i}>• {e}</li>
          ))}
        </ul>
      )}

      {/* Vùng dán outline */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <label className={LABEL} htmlFor="outline-text">
            Mục lục
          </label>
          <button
            type="button"
            onClick={() => setOutline(SAMPLE_OUTLINE)}
            className="text-xs font-medium text-brand-700 hover:underline dark:text-brand-300"
          >
            Chèn ví dụ mẫu
          </button>
        </div>

        <textarea
          id="outline-text"
          value={outline}
          onChange={(e) => {
            setOutline(e.target.value)
            setPreview(null)
          }}
          rows={12}
          spellCheck={false}
          placeholder={SAMPLE_OUTLINE}
          className={`${FIELD} font-mono text-[13px] leading-relaxed`}
        />

        <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:bg-slate-900/60 dark:text-slate-400">
          <strong>Quy tắc:</strong> dòng sát lề = <em>một chương</em>; dòng thụt vào (2 dấu cách,
          Tab, hoặc bắt đầu bằng <code>-</code>) = <em>một bài học</em> thuộc chương ngay trên.
          Mục đã tồn tại sẽ được bỏ qua, nên chạy lại nhiều lần vẫn an toàn.
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runPreview}
            disabled={busy || !outline.trim()}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Xem trước
          </button>
          <button
            type="button"
            onClick={apply}
            disabled={busy || !outline.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {busy && <Spinner className="h-4 w-4" />}
            Tạo khung
          </button>
        </div>
      </div>

      {/* Xem trước kết quả parse */}
      {preview && (
        <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/5">
          <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            Sẽ tạo {preview.chaptersCreated} chương và {preview.lessonsCreated} bài học
          </p>
          <ul className="space-y-2 text-sm">
            {preview.chapters.map((ch, i) => (
              <li key={i}>
                <span className="font-medium text-slate-900 dark:text-white">📂 {ch.title}</span>
                {ch.lessons.length > 0 && (
                  <ul className="mt-1 ml-5 space-y-0.5 text-slate-600 dark:text-slate-400">
                    {ch.lessons.map((t, j) => (
                      <li key={j}>📝 {t}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {preview.skipped.length > 0 && (
            <div className="mt-3 border-t border-brand-200 pt-3 text-xs text-amber-700 dark:border-brand-500/30 dark:text-amber-300">
              <p className="font-semibold">Bỏ qua {preview.skipped.length} mục đã tồn tại:</p>
              <ul className="mt-1 space-y-0.5">
                {preview.skipped.slice(0, 8).map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
                {preview.skipped.length > 8 && <li>• …và {preview.skipped.length - 8} mục khác</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Cây chương hiện có */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {subjectMeta?.icon} {subjectMeta?.name} — Lớp {grade}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {chapters.length} chương · {totalLessons} bài
          </span>
        </div>

        {loadingTree ? (
          <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
            <Spinner className="h-4 w-4 text-brand-600" /> Đang tải…
          </div>
        ) : chapters.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Chưa có chương nào. Dán mục lục ở trên để tạo.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {chapters.map((ch) => (
              <ChapterRow
                key={ch.id}
                chapter={ch}
                onDelete={() => removeChapter(ch)}
                onAddLesson={() =>
                  navigate(`/admin/bai-hoc/moi?chapter=${encodeURIComponent(ch.id)}`)
                }
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/** Mot dong chuong, mo ra de xem danh sach bai hoc ben trong. */
function ChapterRow({ chapter, onDelete, onAddLesson }) {
  const [open, setOpen] = useState(false)
  const [lessons, setLessons] = useState(null)
  const [loading, setLoading] = useState(false)

  /*
   * Tai lai danh sach bai khi mo chuong, VA moi khi `lessonCount` thay doi.
   *
   * Truoc day chi tai dung mot lan (`if (lessons === null)`). Vi ChapterRow co
   * key = chapter.id, React giu nguyen component instance qua cac lan
   * `loadTree()`, nen state `lessons` cu song mai: xoa bai o trang khac xong mo
   * lai chuong van thay bai da xoa. Nguoi dung tuong chuong da trong roi bam
   * Xoa chuong va nhan 409 "Chuong con N bai hoc" ma khong hieu vi sao.
   */
  useEffect(() => {
    if (!open) return
    let alive = true
    setLoading(true)
    api
      .getChapter(chapter.id)
      .then((data) => {
        if (alive) setLessons(data.lessons ?? [])
      })
      .catch(() => {
        if (alive) setLessons([])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [open, chapter.id, chapter.lessonCount])

  return (
    <li className="py-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="text-xs text-slate-400">{open ? '▾' : '▸'}</span>
          <span className="truncate text-sm font-medium text-slate-900 dark:text-white">
            📂 {chapter.title}
          </span>
          <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
            {chapter.lessonCount} bài
          </span>
        </button>
        <button
          type="button"
          onClick={onAddLesson}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
        >
          + Bài
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
        >
          Xoá
        </button>
      </div>

      {open && (
        <div className="mt-1 ml-6">
          {loading ? (
            <p className="py-2 text-xs text-slate-500">Đang tải…</p>
          ) : !lessons?.length ? (
            <p className="py-2 text-xs text-slate-500 dark:text-slate-400">
              Chưa có bài học trong chương này.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {lessons.map((l) => (
                <li key={l.id} className="flex items-center gap-2">
                  <Link
                    to={`/admin/bai-hoc/${encodeURIComponent(l.id)}`}
                    className="truncate text-sm text-slate-700 hover:text-brand-700 hover:underline dark:text-slate-300 dark:hover:text-brand-300"
                  >
                    📝 {l.title}
                  </Link>
                  {l.status === 'draft' && (
                    <span className="shrink-0 rounded bg-amber-100 px-1.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                      nháp
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}
