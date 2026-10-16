import { useMemo, useState } from 'react'
import RichText from './RichText.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { IconCheck, IconClose, IconRefresh } from './Icons.jsx'

const LETTER = ['A', 'B', 'C', 'D', 'E', 'F']

/**
 * Trac nghiem dung cho hai ngu canh:
 *
 *  1. Quiz trong bai hoc (mac dinh) — tu luu diem vao ProgressContext, lam lai
 *     bao nhieu lan cung duoc.
 *  2. De kiem tra cua giao vien — truyen `onSubmit` de nop len server, kem
 *     `allowRetry={false}` vi moi hoc sinh chi nop mot lan.
 *
 * Khi la de kiem tra, cau hoi tu server KHONG co `answer` truoc luc nop, nen
 * `revealAnswers` quyet dinh co to mau dung/sai hay khong.
 */
export default function Quiz({
  lessonId,
  questions = [],
  title = 'Trắc nghiệm',
  onSubmit,
  allowRetry = true,
  revealAnswers = true,
  initialAnswers,
  readOnly = false,
  emptyText = 'Bài này chưa có câu hỏi trắc nghiệm.',
}) {
  const { saveQuizResult, quiz } = useProgress()
  const [answers, setAnswers] = useState(initialAnswers ?? {})
  const [submitted, setSubmitted] = useState(readOnly)
  const [round, setRound] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // De kiem tra khong co diem "tot nhat" trong ProgressContext
  const best = onSubmit ? null : quiz[lessonId]
  const answeredCount = Object.keys(answers).length
  const score = useMemo(
    () => questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0),
    [answers, questions],
  )

  if (!questions.length) {
    return <p className="text-sm text-slate-500">{emptyText}</p>
  }

  const submit = async () => {
    if (onSubmit) {
      setBusy(true)
      setError('')
      try {
        await onSubmit(answers)
        setSubmitted(true)
      } catch (err) {
        setError(err?.message || 'Không nộp được bài. Thử lại.')
      } finally {
        setBusy(false)
      }
      return
    }
    setSubmitted(true)
    saveQuizResult(lessonId, score, questions.length)
  }

  const retry = () => {
    setAnswers({})
    setSubmitted(false)
    setRound((r) => r + 1)
  }

  const percent = Math.round((score / questions.length) * 100)
  const verdict =
    percent === 100
      ? { text: 'Xuất sắc! Đúng toàn bộ 🎉', tone: 'text-emerald-600 dark:text-emerald-400' }
      : percent >= 70
        ? { text: 'Tốt! Xem lại vài câu sai là ổn.', tone: 'text-emerald-600 dark:text-emerald-400' }
        : percent >= 50
          ? { text: 'Tạm được — nên đọc lại phần lý thuyết.', tone: 'text-amber-600 dark:text-amber-400' }
          : { text: 'Cần ôn lại lý thuyết trước khi làm lại.', tone: 'text-rose-600 dark:text-rose-400' }

  return (
    <div key={round} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {title} <span className="text-sm font-normal text-slate-500">({questions.length} câu)</span>
        </h3>
        {best && (
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            Điểm tốt nhất: {best.score}/{best.total}
          </span>
        )}
      </div>

      {questions.map((q, qi) => {
        const picked = answers[qi]
        // Chi to mau dung/sai khi duoc phep tiet lo dap an. De kiem tra chua nop
        // thi `q.answer` khong ton tai, to mau se sai toan bo.
        const showMarks = submitted && revealAnswers
        return (
          <div
            key={qi}
            className="card p-4"
          >
            <RichText as="p" className="mb-3 font-medium text-slate-900 dark:text-slate-100">
              {`${qi + 1}. ${q.question}`}
            </RichText>

            <div className="grid gap-2">
              {q.options.map((opt, oi) => {
                const isPicked = picked === oi
                const isCorrect = q.answer === oi
                let style =
                  'border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-700 dark:hover:bg-slate-800'
                if (!showMarks && isPicked)
                  style = 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/15'
                if (showMarks && isCorrect)
                  style = 'border-emerald-500 bg-emerald-50 dark:border-emerald-500/60 dark:bg-emerald-500/10'
                if (showMarks && isPicked && !isCorrect)
                  style = 'border-rose-500 bg-rose-50 dark:border-rose-500/60 dark:bg-rose-500/10'

                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={submitted || readOnly || busy}
                    onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                    className={`focus-ring flex items-start gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${style}`}
                  >
                    <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-current text-xs font-bold text-slate-500 dark:text-slate-400">
                      {LETTER[oi]}
                    </span>
                    <RichText className="text-slate-700 dark:text-slate-200">{opt}</RichText>
                    {showMarks && isCorrect && (
                      <IconCheck className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                    )}
                    {showMarks && isPicked && !isCorrect && (
                      <IconClose className="ml-auto h-4 w-4 shrink-0 text-rose-600" />
                    )}
                  </button>
                )
              })}
            </div>

            {showMarks && q.explain && (
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Giải thích: </span>
                <RichText className="text-slate-600 dark:text-slate-400">{q.explain}</RichText>
              </div>
            )}
          </div>
        )
      })}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
        >
          {error}
        </div>
      )}

      {!submitted ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={answeredCount === 0 || busy}
            className="focus-ring rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? 'Đang nộp…' : 'Nộp bài'}
          </button>
          <span className="text-sm text-slate-500">
            Đã trả lời {answeredCount}/{questions.length} câu
          </span>
          {onSubmit && answeredCount < questions.length && (
            <span className="text-sm text-amber-600 dark:text-amber-400">
              Còn {questions.length - answeredCount} câu chưa trả lời — nộp rồi không sửa được.
            </span>
          )}
        </div>
      ) : !revealAnswers ? null : (
        <div className="card flex flex-wrap items-center gap-4 p-4">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/15">
            <span className="text-xl font-bold text-brand-700 dark:text-brand-300">{score}</span>
            <span className="text-xs text-slate-500">/ {questions.length}</span>
          </div>
          <div className="min-w-0">
            <p className={`font-semibold ${verdict.tone}`}>{verdict.text}</p>
            <p className="text-sm text-slate-500">Bạn đúng {percent}% số câu.</p>
          </div>
          {allowRetry && (
            <button
              type="button"
              onClick={retry}
              className="focus-ring ml-auto flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <IconRefresh className="h-4 w-4" />
              Làm lại
            </button>
          )}
        </div>
      )}
    </div>
  )
}
