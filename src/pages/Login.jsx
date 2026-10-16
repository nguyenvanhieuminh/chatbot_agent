import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, HOME_BY_ROLE } from '../context/AuthContext'
import { ApiError } from '../api/client'
import AuthShell, { Field, ErrorBox, SubmitButton, inputClass } from '../components/AuthShell.jsx'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, homePath } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) return <Navigate to={homePath} replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(username, password)
      // Quay lai dung trang nguoi dung dinh vao truoc khi bi chan, neu co
      const from = location.state?.from
      navigate(from || HOME_BY_ROLE[user.role] || '/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Sign in to PathVN"
      subtitle="For students, teachers, and administrators"
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" className="focus-ring font-semibold text-brand-700 hover:underline dark:text-brand-300">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Tên đăng nhập" id="username">
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            disabled={loading}
            className={inputClass}
            placeholder="tendangnhap"
          />
        </Field>

        <Field label="Mật khẩu" id="password">
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
            className={inputClass}
            placeholder="••••••••"
          />
        </Field>

        <ErrorBox>{error}</ErrorBox>

        <SubmitButton loading={loading} loadingText="Đang đăng nhập…">
          Đăng nhập
        </SubmitButton>
      </form>
    </AuthShell>
  )
}
