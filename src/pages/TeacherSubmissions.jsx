import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { useApi } from '../lib/useApi.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'
import { formatDateTime, formatDue } from '../lib/datetime.js'

const LETTER = ['A', 'B', 'C', 'D', 'E', 'F']

export default function TeacherSubmissions() {
  const { assignmentId } = useParams()
  const { data, loading, error, reload } = useApi(
    () => api.teacherSubmissions(assignmentId),
    [assignmentId],
  )

  if (loading) return <Loading label="Đang tải bài nộp…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const { assignment, submissions, perQuestion } = data
  const scored = submissions.filter((s) => s.total)
  const avg = scored.length
    ? Math.round((scored.reduce((sum, s) => sum + s.score / s.total, 0) / scored.length) * 100)
    : null

  return (
    <div className="space-y-7">
      <header>
        <Link
          to={`/giao-vien/lop/${assignment.classId}`}
          className="focus-ring text-sm text-slate-500 hover:underline"
        >
          ← Về lớp
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {assignment.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {assignment.questionCount} câu · {submissions.length} bài nộp
          {avg !== null && ` · điểm TB ${avg}%`}
          {assignment.dueAt && ` · ${formatDue(assignment.dueAt)}`}
        </p>
      </header>

      {!submissions.length ? (
        <EmptyState
          icon="⏳"
          title="Chưa có ai nộp bài"
          desc={
            assignment.published
              ? 'Đề đã giao, đang chờ học sinh làm.'
              : 'Đề này còn là nháp nên học sinh chưa thấy. Sửa đề và chọn "Lưu và giao cho lớp".'
          }
        />
      ) : (
        <>
          <section>
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Bài nộp</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800">
                    <th className="py-2.5 pr-4 font-medium">Học sinh</th>
                    <th className="py-2.5 pr-4 font-medium">Điểm</th>
                    <th className="py-2.5 font-medium">Nộp lúc</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => {
                    const percent = s.total ? Math.round((s.score / s.total) * 100) : null
                    return (
                      <tr key={s.id} className="border-b border-slate-100 dark:border-slate-800/60">
                        <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-white">
                          {s.studentName}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={tone(percent)}>
                            {s.score}/{s.total}
                          </span>
                          {percent !== null && (
                            <span className="ml-2 text-xs text-slate-500">{percent}%</span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-500">{formatDateTime(s.submittedAt)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-1 font-semibold text-slate-900 dark:text-white">Câu nào học sinh sai nhiều</h2>
            <p className="mb-3 text-sm text-slate-500">
              Tỉ lệ đúng tính trên số học sinh đã trả lời câu đó.
            </p>
            <div className="space-y-2">
              {[...perQuestion]
                .sort((a, b) => (a.correctRate ?? 101) - (b.correctRate ?? 101))
                .map((q) => (
                  <div key={q.index} className="card flex flex-wrap items-center gap-4 p-3.5">
                    <span className="text-sm font-bold text-slate-400">Câu {q.index + 1}</span>
                    <p className="min-w-0 flex-1 truncate text-sm text-slate-700 dark:text-slate-300">
                      {q.question}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            (q.correctRate ?? 0) >= 80
                              ? 'bg-emerald-500'
                              : (q.correctRate ?? 0) >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                          }`}
                          style={{ width: `${q.correctRate ?? 0}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs text-slate-500">
                        {q.correctRate === null ? 'chưa ai làm' : `${q.correctRate}% đúng`}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Đáp án đề này</h2>
            <div className="space-y-2">
              {assignment.questions.map((q, qi) => (
                <div key={qi} className="card p-3.5 text-sm">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {qi + 1}. {q.question}
                  </p>
                  <p className="mt-1 text-emerald-700 dark:text-emerald-400">
                    Đáp án: {LETTER[q.answer]} — {q.options[q.answer]}
                  </p>
                  {q.explain && <p className="mt-1 text-slate-500">{q.explain}</p>}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

function tone(percent) {
  if (percent === null) return 'text-slate-500'
  if (percent >= 80) return 'font-semibold text-emerald-600 dark:text-emerald-400'
  if (percent >= 50) return 'font-semibold text-amber-600 dark:text-amber-400'
  return 'font-semibold text-rose-600 dark:text-rose-400'
}
