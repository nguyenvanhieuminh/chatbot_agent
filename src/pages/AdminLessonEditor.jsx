import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { api, ApiError } from '../api/client.js'
import { useContent } from '../context/ContentContext.jsx'
import {
  GRADE_SUBJECTS,
  GRADES,
  SUBJECT_CATALOG,
  CONTENT_TYPES,
  PROFESSIONAL_CATEGORIES,
  BLOG_CATEGORIES,
  DIFFICULTY_LEVELS
} from '../../shared/curriculum.js'
import { parsePastedContent, SYNTAX_HELP, SAMPLE_INPUT } from '../../shared/parseContent.js'
import TheoryBlocks from '../components/TheoryBlocks.jsx'
import { Spinner } from '../components/States.jsx'

const FIELD =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'
const LABEL = 'mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-400'

const EMPTY_FORM = {
  id: '',
  contentType: 'k12',
  subjectId: 'toan',
  grade: 10,
  chapterId: '',
  title: '',
  summary: '',
  minutes: 12,
  keywords: [],
  source: '',
  status: 'draft',
  sortOrder: 100,
  // Multi-content fields
  category: '',
  tags: [],
  level: '',
}

/**
 * Soan bai hoc bang van ban thuan.
 *
 * `source` la nguon duy nhat: server tu parse ra blocks/flashcards/quiz khi luu,
 * nen o day chi can mot textarea + khung xem truoc. Khong co form theo tung khoi.
 */
export default function AdminLessonEditor() {
  const { lessonId } = useParams()
  const isNew = !lessonId
  const navigate = useNavigate()
  const content = useContent()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState(EMPTY_FORM)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState([])
  const [flash, setFlash] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  const set = useCallback((patch) => setForm((f) => ({ ...f, ...patch })), [])

  // Parse lai moi khi go — chi de xem truoc, khong luu blocks tu client
  const parsed = useMemo(
    () => (form.source.trim() ? parsePastedContent(form.source) : null),
    [form.source],
  )

  /* ------------------------- Nap bai khi sua ------------------------- */
  useEffect(() => {
    if (isNew) return
    let alive = true
    setLoading(true)
    api
      .getLesson(lessonId)
      .then((data) => alive && setForm({ ...EMPTY_FORM, ...data }))
      .catch((err) => alive && setErrors([err.message]))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [lessonId, isNew])

  /* ------------------ Mon hop le theo lop dang chon ------------------ */
  const allowedSubjects = useMemo(() => {
    const ids = GRADE_SUBJECTS[form.grade] ?? []
    return SUBJECT_CATALOG.filter((s) => ids.includes(s.id))
  }, [form.grade])

  useEffect(() => {
    if (allowedSubjects.length && !allowedSubjects.some((s) => s.id === form.subjectId)) {
      set({ subjectId: allowedSubjects[0].id })
    }
  }, [allowedSubjects, form.subjectId, set])

  /* ---------------- Chuong hop le theo (mon, lop) ---------------- */
  useEffect(() => {
    let alive = true
    api
      .listChapters({ subject: form.subjectId, grade: form.grade })
      .then((rows) => alive && setChapters(rows))
      .catch(() => alive && setChapters([]))
    return () => {
      alive = false
    }
  }, [form.subjectId, form.grade])

  useEffect(() => {
    if (form.chapterId && chapters.length && !chapters.some((c) => c.id === form.chapterId)) {
      set({ chapterId: '' })
    }
  }, [chapters, form.chapterId, set])

  // Vao tu nut "+ Bai" o trang khung noi dung: nhan san chuong, mon, lop
  useEffect(() => {
    if (!isNew) return
    const preset = searchParams.get('chapter')
    if (!preset) return
    api
      .getChapter(preset)
      .then((ch) =>
        setForm((f) => ({ ...f, chapterId: ch.id, subjectId: ch.subjectId, grade: ch.grade })),
      )
      .catch(() => {})
  }, [isNew, searchParams])

  /* ---------------------------- Hanh dong ---------------------------- */

  async function save(status) {
    setSaving(true)
    setErrors([])
    setFlash('')
    try {
      const payload = { ...form, status: status ?? form.status }
      if (isNew) {
        const created = await api.createLesson(payload)
        content.reload()
        navigate(`/admin/bai-hoc/${encodeURIComponent(created.id)}`, { replace: true })
      } else {
        const updated = await api.updateLesson(lessonId, payload)
        setForm({ ...EMPTY_FORM, ...updated })
        content.reload()
        setFlash(status === 'published' ? 'Đã lưu và xuất bản.' : 'Đã lưu bản nháp.')
      }
    } catch (err) {
      setErrors(err instanceof ApiError && err.errors?.length ? err.errors : [err.message])
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!confirm(`Xoá vĩnh viễn bài “${form.title}”?`)) return
    try {
      await api.deleteLesson(lessonId)
      content.reload()
      navigate('/admin/bai-hoc')
    } catch (err) {
      setErrors([err.message])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-slate-500">
        <Spinner className="h-6 w-6 text-brand-600" />
        Đang tải bài học…
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Thanh tiêu đề */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to="/admin/bai-hoc"
          className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300"
        >
          ← Danh sách bài học
        </Link>
        <span className="text-slate-300">|</span>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">
          {isNew ? 'Bài học mới' : 'Sửa bài học'}
        </h1>
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
            form.status === 'published'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
          }`}
        >
          {form.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
        </span>

        <div className="ml-auto flex flex-wrap gap-2">
          {!isNew && (
            <>
              <Link
                to={`/bai-hoc/${encodeURIComponent(form.id)}`}
                target="_blank"
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Xem trên web ↗
              </Link>
              <button
                type="button"
                onClick={remove}
                className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/40 dark:hover:bg-rose-500/10"
              >
                Xoá
              </button>
            </>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={() => save('draft')}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Lưu nháp
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => save('published')}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {saving && <Spinner className="h-4 w-4" />}
            Lưu &amp; xuất bản
          </button>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 dark:border-rose-500/40 dark:bg-rose-500/10">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">Chưa lưu được:</p>
          <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-sm text-rose-700 dark:text-rose-300">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {flash && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300">
          {flash}
        </div>
      )}

      {/* Loại nội dung */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <label className={LABEL}>Loại nội dung *</label>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => set({ contentType: type.value })}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                form.contentType === type.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {CONTENT_TYPES.find((t) => t.value === form.contentType)?.description}
        </p>
      </section>

      {/* Thông tin chung */}
      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-4">
            <label className={LABEL} htmlFor="lesson-title">
              Tiêu đề *
            </label>
            <input
              id="lesson-title"
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder={
                form.contentType === 'k12' ? 'Đạo hàm và ứng dụng' :
                form.contentType === 'blog' ? 'Cách học lập trình hiệu quả' :
                'React Hooks cơ bản'
              }
              className={`${FIELD} text-base font-semibold`}
            />
          </div>

          {/* K-12 fields */}
          {form.contentType === 'k12' && (
            <>
              <div>
                <label className={LABEL} htmlFor="lesson-grade">
                  Khối lớp *
                </label>
                <select
                  id="lesson-grade"
                  value={form.grade}
                  onChange={(e) => set({ grade: Number(e.target.value) })}
                  className={FIELD}
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      Lớp {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL} htmlFor="lesson-subject">
                  Môn học *
                </label>
                <select
                  id="lesson-subject"
                  value={form.subjectId}
                  onChange={(e) => set({ subjectId: e.target.value })}
                  className={FIELD}
                >
                  {allowedSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={LABEL} htmlFor="lesson-chapter">
                  Chương
                </label>
                <select
                  id="lesson-chapter"
                  value={form.chapterId ?? ''}
                  onChange={(e) => set({ chapterId: e.target.value })}
                  className={FIELD}
                >
                  <option value="">— Chưa phân chương —</option>
                    {chapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Professional/Blog fields */}
            {(form.contentType === 'professional' || form.contentType === 'blog') && (
              <>
                <div>
                  <label className={LABEL} htmlFor="lesson-category">
                    Danh mục *
                  </label>
                  <select
                    id="lesson-category"
                    value={form.category ?? ''}
                    onChange={(e) => set({ category: e.target.value })}
                    className={FIELD}
                  >
                    <option value="">— Chọn danh mục —</option>
                    {(form.contentType === 'professional' ? PROFESSIONAL_CATEGORIES : BLOG_CATEGORIES).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {form.contentType === 'professional' && (
                  <div>
                    <label className={LABEL} htmlFor="lesson-level">
                      Độ khó
                    </label>
                    <select
                      id="lesson-level"
                      value={form.level ?? ''}
                      onChange={(e) => set({ level: e.target.value })}
                      className={FIELD}
                    >
                      <option value="">— Không chỉ định —</option>
                      {DIFFICULTY_LEVELS.map((lv) => (
                        <option key={lv.value} value={lv.value}>
                          {lv.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={form.contentType === 'blog' ? 'sm:col-span-2' : ''}>
                  <label className={LABEL} htmlFor="lesson-tags">
                    Tags (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    id="lesson-tags"
                    value={form.tags?.join(', ') || ''}
                    onChange={(e) =>
                      set({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })
                    }
                    placeholder="react, javascript, hooks"
                    className={FIELD}
                  />
                </div>
              </>
            )}

            {/* Common fields */}
            <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL} htmlFor="lesson-minutes">
                Phút đọc
              </label>
              <input
                id="lesson-minutes"
                type="number"
                min="1"
                value={form.minutes}
                onChange={(e) => set({ minutes: Number(e.target.value) })}
                className={FIELD}
              />
            </div>
            <div>
              <label className={LABEL} htmlFor="lesson-order">
                Thứ tự
              </label>
              <input
                id="lesson-order"
                type="number"
                value={form.sortOrder}
                onChange={(e) => set({ sortOrder: Number(e.target.value) })}
                className={FIELD}
              />
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className={LABEL} htmlFor="lesson-summary">
              Mô tả ngắn (hiện ở mục lục)
            </label>
            <input
              id="lesson-summary"
              value={form.summary}
              onChange={(e) => set({ summary: e.target.value })}
              placeholder="Khái niệm đạo hàm, quy tắc tính và ứng dụng khảo sát hàm số."
              className={FIELD}
            />
          </div>

          <div>
            <label className={LABEL} htmlFor="lesson-keywords">
              Từ khoá (phẩy)
            </label>
            <input
              id="lesson-keywords"
              value={form.keywords.join(', ')}
              onChange={(e) =>
                set({ keywords: e.target.value.split(',').map((k) => k.trim()).filter(Boolean) })
              }
              placeholder="đạo hàm, cực trị"
              className={FIELD}
            />
          </div>
        </div>
      </section>

      {/* Soạn nội dung: text bên trái, xem trước bên phải */}
      <section className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Nội dung</h2>

          {parsed && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {parsed.blocks.length} khối · {parsed.flashcards.length} thẻ ·{' '}
              {parsed.quiz.length} câu hỏi
            </span>
          )}

          <div className="ml-auto flex items-center gap-1">
            {!form.source.trim() && (
              <button
                type="button"
                onClick={() => set({ source: SAMPLE_INPUT })}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-brand-500/10"
              >
                Chèn mẫu
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {showHelp ? 'Ẩn cú pháp' : 'Cú pháp'}
            </button>
            <button
              type="button"
              onClick={() => setShowPreview((v) => !v)}
              className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
            </button>
          </div>
        </div>

        {showHelp && <SyntaxHelp />}

        <div className={showPreview ? 'grid lg:grid-cols-2' : ''}>
          {/* Vùng soạn text */}
          <div className="border-slate-200 dark:border-slate-700 lg:border-r">
            <textarea
              value={form.source}
              onChange={(e) => set({ source: e.target.value })}
              spellCheck={false}
              placeholder={SAMPLE_INPUT}
              className="block h-[65vh] w-full resize-y border-0 bg-transparent px-4 py-3 font-mono text-[13.5px] leading-[1.75] text-slate-800 outline-none placeholder:text-slate-300 dark:text-slate-100 dark:placeholder:text-slate-600"
            />
          </div>

          {/* Xem trước */}
          {showPreview && (
            <div className="h-[65vh] overflow-y-auto bg-slate-50/60 px-5 py-4 dark:bg-slate-900/40">
              {!parsed ? (
                <p className="py-16 text-center text-sm text-slate-400">
                  Gõ nội dung bên trái để xem trước.
                </p>
              ) : (
                <>
                  {parsed.warnings.length > 0 && (
                    <ul className="mb-4 space-y-1 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
                      {parsed.warnings.map((w, i) => (
                        <li key={i}>⚠ {w}</li>
                      ))}
                    </ul>
                  )}

                  {parsed.blocks.length > 0 ? (
                    <TheoryBlocks blocks={parsed.blocks} />
                  ) : (
                    <p className="text-sm text-slate-400">Chưa có khối lý thuyết nào.</p>
                  )}

                  {parsed.flashcards.length > 0 && (
                    <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        {parsed.flashcards.length} thẻ ghi nhớ
                      </h3>
                      <ul className="space-y-1.5">
                        {parsed.flashcards.map((c, i) => (
                          <li
                            key={i}
                            className="rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-800"
                          >
                            <span className="text-slate-800 dark:text-slate-200">{c.front}</span>
                            <span className="mx-2 text-slate-300">→</span>
                            <span className="text-slate-600 dark:text-slate-400">{c.back}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parsed.quiz.length > 0 && (
                    <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        {parsed.quiz.length} câu trắc nghiệm
                      </h3>
                      <ol className="space-y-3">
                        {parsed.quiz.map((q, i) => (
                          <li
                            key={i}
                            className="rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-800"
                          >
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {i + 1}. {q.question}
                            </p>
                            <ul className="mt-1 space-y-0.5">
                              {q.options.map((o, j) => (
                                <li
                                  key={j}
                                  className={
                                    j === q.answer
                                      ? 'text-emerald-700 dark:text-emerald-400'
                                      : 'text-slate-500 dark:text-slate-400'
                                  }
                                >
                                  {j === q.answer ? '✓' : '○'} {o}
                                </li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/** Bang tra cu phap, hien khi bam "Cu phap". */
function SyntaxHelp() {
  return (
    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {SYNTAX_HELP.map((h) => (
          <div key={h.code} className="flex items-baseline gap-2 text-xs">
            <code className="shrink-0 rounded bg-white px-1.5 py-0.5 font-mono text-[11px] text-brand-700 dark:bg-slate-800 dark:text-brand-300">
              {h.code}
            </code>
            <span className="text-slate-500 dark:text-slate-400">{h.desc}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Trong mọi đoạn text: <code className="font-mono">$…$</code> công thức trong dòng,{' '}
        <code className="font-mono">**đậm**</code>, <code className="font-mono">*nghiêng*</code>.
      </p>
    </div>
  )
}
