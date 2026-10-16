import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth, HOME_BY_ROLE } from '../context/AuthContext'
import { ApiError } from '../api/client'
import { GRADES } from '../../shared/curriculum.js'
import AuthShell, { Field, ErrorBox, SubmitButton, inputClass } from '../components/AuthShell.jsx'

const ROLE_OPTIONS = [
  { value: 'student', icon: '🎒', label: 'Học sinh', desc: 'Vào lớp bằng mã, làm bài kiểm tra' },
  { value: 'teacher', icon: '🧑‍🏫', label: 'Giáo viên', desc: 'Tạo lớp, giao bài, xem tiến độ lớp' },
]

export default function Register() {
  const navigate = useNavigate()
  const { register, isAuthenticated, homePath } = useAuth()
  const [form, setForm] = useState({
    role: 'student',
    username: '',
    displayName: '',
    password: '',
    grade: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to={homePath} replace />

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await register({
        ...form,
        // Khoi lop chi gui khi la hoc sinh va co chon
        grade: form.role === 'student' && form.grade ? Number(form.grade) : undefined,
      })
      navigate(HOME_BY_ROLE[user.role] || '/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Miễn phí, dùng được ngay"
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/dang-nhap" className="focus-ring font-semibold text-brand-700 hover:underline dark:text-brand-300">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Bạn là
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLE_OPTIONS.map((opt) => {
              const active = form.role === opt.value
              return (
                <label
                  key={opt.value}
                  className={`focus-within:ring-2 focus-within:ring-brand-500 cursor-pointer rounded-lg border p-3 transition-colors ${
                    active
                      ? 'border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-500/10'
                      : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={opt.value}
                    checked={active}
                    onChange={set('role')}
                    className="sr-only"
                  />
                  <span className="text-xl">{opt.icon}</span>
                  <span className="mt-1 block text-sm font-semibold text-slate-900 dark:text-white">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-500">{opt.desc}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <Field label="Tên hiển thị" id="displayName" hint="Tên mà giáo viên và bạn học sẽ thấy.">
          <input
            id="displayName"
            type="text"
            value={form.displayName}
            onChange={set('displayName')}
            maxLength={60}
            autoComplete="name"
            disabled={loading}
            className={inputClass}
            placeholder="Nguyễn Văn An"
          />
        </Field>

        <Field
          label="Tên đăng nhập"
          id="username"
          hint="3–32 ký tự, chỉ chữ thường, số và . _ -"
        >
          <input
            id="username"
            type="text"
            value={form.username}
            onChange={set('username')}
            required
            autoComplete="username"
            disabled={loading}
            className={inputClass}
            placeholder="nguyenvanan"
          />
        </Field>

        <Field label="Mật khẩu" id="password" hint="Ít nhất 8 ký tự.">
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={set('password')}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={loading}
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>

        {form.role === 'student' && (
          <Field label="Khối lớp" id="grade" hint="Không bắt buộc — giúp gợi ý đúng nội dung.">
            <select
              id="grade"
              value={form.grade}
              onChange={set('grade')}
              disabled={loading}
              className={inputClass}
            >
              <option value="">Chưa chọn</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  Lớp {g}
                </option>
              ))}
            </select>
          </Field>
        )}

        <ErrorBox>{error}</ErrorBox>

        <SubmitButton loading={loading} loadingText="Đang tạo tài khoản…">
          Tạo tài khoản
        </SubmitButton>
      </form>
    </AuthShell>
  )
}
