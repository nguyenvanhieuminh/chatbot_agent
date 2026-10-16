import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { useApi } from '../lib/useApi.js'
import { useContent } from '../context/ContentContext.jsx'
import { Loading, ErrorState } from '../components/States.jsx'
import { toDateTimeLocal } from '../lib/datetime.js'

const LETTER = ['A', 'B', 'C', 'D', 'E', 'F']
const emptyQuestion = () => ({ question: '', options: ['', ''], answer: 0, explain: '' })

export default function TeacherAssignmentEditor() {
  const { classId, assignmentId } = useParams()
  const isEdit = Boolean(assignmentId)

  // Sua de: phai lay de tu dashboard cua lop vi day la noi tra ve kem dap an
  const loaded = useApi(
    () => (isEdit ? api.teacherSubmissions(assignmentId) : Promise.resolve(null)),
    [assignmentId],
  )

  if (isEdit && loaded.loading) return <Loading label="Đang tải đề…" />
  if (isEdit && loaded.error) return <ErrorState message={loaded.error} onRetry={loaded.reload} />

  return (
    <Editor
      classId={classId ?? loaded.data?.assignment?.classId}
      assignment={loaded.data?.assignment ?? null}
      hasSubmissions={(loaded.data?.submissions?.length ?? 0) > 0}
    />
  )
}

function Editor({ classId, assignment, hasSubmissions }) {
  const navigate = useNavigate()
  const content = useContent()
  const [title, setTitle] = useState(assignment?.title ?? '')
  const [instructions, setInstructions] = useState(assignment?.instructions ?? '')
  const [dueAt, setDueAt] = useState(toDateTimeLocal(assignment?.dueAt))
  const [questions, setQuestions] = useState(
    assignment?.questions?.length ? assignment.questions : [emptyQuestion()],
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function patchQuestion(qi, patch) {
    setQuestions((qs) => qs.map((q, i) => (i === qi ? { ...q, ...patch } : q)))
  }

  async function save(publish) {
    setError('')
    setBusy(true)
    try {
      const payload = {
        title,
        instructions,
        questions,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        published: publish,
      }
      if (assignment) {
        await api.teacherUpdateAssignment(assignment.id, payload)
        navigate(`/giao-vien/lop/${classId}`)
      } else {
        await api.teacherCreateAssignment(classId, payload)
        navigate(`/giao-vien/lop/${classId}`)
      }
    } catch (err) {
      setError(err?.message || 'Không lưu được đề.')
    } finally {
      setBusy(false)
    }
  }

  /** Lay nguyen bo cau hoi tu quiz cua mot bai hoc co san. */
  function importFromLesson(lessonId) {
    const lesson = content.getLesson?.(lessonId)
    if (!lesson?.quiz?.length) {
      setError('Bài học này chưa có câu hỏi trắc nghiệm.')
      return
    }
    setError('')
    setQuestions(lesson.quiz.map((q) => ({ ...q, options: [...q.options] })))
    if (!title) setTitle(lesson.title)
  }

  const input =
    'focus-ring w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  return (
    <div className="space-y-6">
      <header>
        <Link
          to={classId ? `/giao-vien/lop/${classId}` : '/giao-vien'}
          className="focus-ring text-sm text-slate-500 hover:underline"
        >
          ← Về lớp
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {assignment ? 'Sửa đề bài' : 'Tạo đề bài'}
        </h1>
      </header>

      {hasSubmissions && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          Đề này đã có học sinh nộp bài. Sửa câu hỏi sẽ làm điểm đã chấm không còn khớp với đề mới.
        </div>
      )}

      <div className="card space-y-4 p-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Tiêu đề
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Kiểm tra 15 phút — Chương 1"
            className={input}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Hạn nộp
            </span>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className={input}
            />
            <span className="mt-1 block text-xs text-slate-500">
              Để trống nếu không giới hạn. Quá hạn thì học sinh không nộp được.
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Lấy câu hỏi từ bài học
            </span>
            <select
              value=""
              onChange={(e) => e.target.value && importFromLesson(e.target.value)}
              className={input}
            >
              <option value="">— Chọn bài để nhập câu hỏi —</option>
              {(content.allLessons ?? [])
                .filter((l) => l.quiz?.length)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    Lớp {l.grade} · {l.title} ({l.quiz.length} câu)
                  </option>
                ))}
            </select>
            <span className="mt-1 block text-xs text-slate-500">
              Câu hỏi được sao chép vào đề, nên sửa bài học sau này không làm đổi đề.
            </span>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Hướng dẫn cho học sinh
          </span>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={2}
            className={input}
            placeholder="Không dùng tài liệu. Làm trong 15 phút."
          />
        </label>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Câu hỏi ({questions.length})
          </h2>
          <button
            type="button"
            onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}
            className="focus-ring rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            + Thêm câu
          </button>
        </div>

        {questions.map((q, qi) => (
          <div key={qi} className="card space-y-3 p-4">
            <div className="flex items-start gap-3">
              <span className="mt-2 text-sm font-bold text-slate-400">{qi + 1}.</span>
              <textarea
                value={q.question}
                onChange={(e) => patchQuestion(qi, { question: e.target.value })}
                rows={2}
                placeholder="Nội dung câu hỏi"
                className={input}
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))}
                  aria-label={`Xoá câu ${qi + 1}`}
                  className="focus-ring mt-1 rounded-lg px-2 py-1 text-sm text-slate-400 hover:text-red-600"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-2 pl-7">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2" title="Chọn làm đáp án đúng">
                    <input
                      type="radio"
                      name={`answer-${qi}`}
                      checked={q.answer === oi}
                      onChange={() => patchQuestion(qi, { answer: oi })}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    <span className="w-4 text-xs font-bold text-slate-500">{LETTER[oi]}</span>
                  </label>
                  <input
                    value={opt}
                    onChange={(e) =>
                      patchQuestion(qi, {
                        options: q.options.map((o, i) => (i === oi ? e.target.value : o)),
                      })
                    }
                    placeholder={`Phương án ${LETTER[oi]}`}
                    className={input}
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() =>
                        patchQuestion(qi, {
                          options: q.options.filter((_, i) => i !== oi),
                          // Xoa phuong an dang la dap an -> dat lai ve A, khong
                          // thi answer tro tro vao phuong an khong con ton tai
                          answer: q.answer === oi ? 0 : q.answer > oi ? q.answer - 1 : q.answer,
                        })
                      }
                      aria-label={`Xoá phương án ${LETTER[oi]}`}
                      className="focus-ring rounded px-2 text-sm text-slate-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < LETTER.length && (
                <button
                  type="button"
                  onClick={() => patchQuestion(qi, { options: [...q.options, ''] })}
                  className="focus-ring text-xs text-brand-700 hover:underline dark:text-brand-300"
                >
                  + Thêm phương án
                </button>
              )}
            </div>

            <div className="pl-7">
              <input
                value={q.explain ?? ''}
                onChange={(e) => patchQuestion(qi, { explain: e.target.value })}
                placeholder="Giải thích (hiện sau khi học sinh nộp bài)"
                className={input}
              />
            </div>
          </div>
        ))}
      </section>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
        <button
          type="button"
          onClick={() => save(true)}
          disabled={busy}
          className="focus-ring rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? 'Đang lưu…' : 'Lưu và giao cho lớp'}
        </button>
        <button
          type="button"
          onClick={() => save(false)}
          disabled={busy}
          className="focus-ring rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Lưu nháp
        </button>
      </div>
    </div>
  )
}
