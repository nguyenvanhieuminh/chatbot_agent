import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { useApi } from '../lib/useApi.js'
import { Loading, ErrorState } from '../components/States.jsx'
import Quiz from '../components/Quiz.jsx'
import { formatDateTime, formatDue, isOverdue } from '../lib/datetime.js'

export default function TakeAssignment() {
  const { assignmentId } = useParams()
  const { data, loading, error, reload } = useApi(
    () => api.studentAssignment(assignmentId),
    [assignmentId],
  )
  const [justSubmitted, setJustSubmitted] = useState(null)

  if (loading) return <Loading label="Đang tải bài kiểm tra…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const { assignment, className, submission } = data
  const done = submission ?? justSubmitted
  const overdue = assignment.dueAt && isOverdue(assignment.dueAt)

  async function submit(answers) {
    const res = await api.studentSubmit(assignment.id, answers)
    setJustSubmitted(res.submission)
    // Tai lai de lay cau hoi kem dap an tu server, thay vi tin vao du lieu client
    reload()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link to="/bai-kiem-tra" className="focus-ring text-sm text-slate-500 hover:underline">
          ← Bài kiểm tra
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {assignment.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {className} · {assignment.questionCount} câu
          {assignment.dueAt && ` · hạn ${formatDateTime(assignment.dueAt)} (${formatDue(assignment.dueAt)})`}
        </p>
      </header>

      {assignment.instructions && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {assignment.instructions}
        </div>
      )}

      {done ? (
        <ResultPanel submission={done} />
      ) : overdue ? (
        <div className="card p-6 text-center">
          <p className="text-4xl">⏰</p>
          <p className="mt-3 font-semibold text-slate-900 dark:text-white">Đã quá hạn nộp</p>
          <p className="mt-1 text-sm text-slate-500">
            Hạn nộp là {formatDateTime(assignment.dueAt)}. Liên hệ giáo viên nếu cần nộp muộn.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Bạn chỉ được nộp <strong>một lần</strong>. Kiểm tra lại các câu trước khi nộp.
        </div>
      )}

      <Quiz
        questions={assignment.questions}
        title={done ? 'Bài làm của bạn' : 'Đề bài'}
        onSubmit={done || overdue ? undefined : submit}
        allowRetry={false}
        // Chua nop thi server khong gui dap an ve, nen khong to mau dung/sai
        revealAnswers={Boolean(done)}
        initialAnswers={done ? (submission?.answers ?? {}) : undefined}
        readOnly={Boolean(done) || overdue}
        emptyText="Đề này chưa có câu hỏi nào."
      />
    </div>
  )
}

function ResultPanel({ submission }) {
  const percent = submission.total ? Math.round((submission.score / submission.total) * 100) : null
  const tone =
    percent === null
      ? 'text-slate-600'
      : percent >= 80
        ? 'text-emerald-700 dark:text-emerald-400'
        : percent >= 50
          ? 'text-amber-700 dark:text-amber-400'
          : 'text-rose-700 dark:text-rose-400'

  return (
    <div className="card flex flex-wrap items-center gap-4 p-5">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/15">
        <span className="text-xl font-bold text-brand-700 dark:text-brand-300">
          {submission.score}
        </span>
        <span className="text-xs text-slate-500">/ {submission.total}</span>
      </div>
      <div className="min-w-0">
        <p className={`font-semibold ${tone}`}>
          {percent === null ? 'Đã nộp bài' : `Bạn đúng ${percent}% số câu`}
        </p>
        <p className="text-sm text-slate-500">Nộp lúc {formatDateTime(submission.submittedAt)}</p>
        {submission.feedback && (
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
            <span className="font-semibold">Nhận xét của giáo viên: </span>
            {submission.feedback}
          </p>
        )}
      </div>
    </div>
  )
}
