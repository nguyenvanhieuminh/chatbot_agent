import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Tổng quan' },
    { path: '/admin/khung-noi-dung', icon: '🏗️', label: 'Tạo khung nội dung' },
    { path: '/admin/bai-hoc', icon: '📝', label: 'Bài học' },
    { path: '/admin/mon-hoc', icon: '📚', label: 'Môn học' },
    { path: '/admin/import-export', icon: '💾', label: 'Import/Export' },
    { path: '/admin/tai-khoan', icon: '👤', label: 'Tài khoản' },
  ]

  async function handleLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await logout()
      navigate('/dang-nhap')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <span className="text-2xl">🛤️</span>
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              PathVN Admin
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.username}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quản trị viên</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              {menuItems.find(item =>
                location.pathname === item.path ||
                (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path))
              )?.label || 'Admin'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Link về trang chính */}
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <span>🏠</span>
              <span>Về trang chính</span>
            </Link>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
