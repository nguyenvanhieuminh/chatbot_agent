import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { formatDateTime } from '../lib/datetime.js'

const ROLE_LABEL = {
  admin: 'Quản trị viên',
  teacher: 'Giáo viên',
  student: 'Học sinh',
}

export default function AdminAccount() {
  const { user, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // Validation
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp' })
      return
    }

    if (currentPassword === newPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải khác mật khẩu hiện tại' })
      return
    }

    setLoading(true)

    try {
      await changePassword(currentPassword, newPassword)
      setMessage({ type: 'success', text: 'Đã đổi mật khẩu thành công!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tài khoản</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Quản lý thông tin tài khoản quản trị
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Thông tin tài khoản
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tên đăng nhập
            </span>
            <span className="text-sm text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded">
              {user?.username}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vai trò</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {ROLE_LABEL[user?.role] ?? user?.role ?? '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">#{user?.id}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tạo lúc
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {formatDateTime(user?.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Đổi mật khẩu</h2>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-4 rounded-lg border p-4 ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
              minLength={6}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Tối thiểu 6 ký tự
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              '🔒 Đổi mật khẩu'
            )}
          </button>
        </form>
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
          <span>🔐</span>
          <span>Lời khuyên bảo mật</span>
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>Sử dụng mật khẩu mạnh với ít nhất 12 ký tự, kết hợp chữ, số và ký tự đặc biệt</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>Không sử dụng lại mật khẩu từ các tài khoản khác</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>Đổi mật khẩu định kỳ 3-6 tháng một lần</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
            <span>Không chia sẻ mật khẩu với người khác</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
