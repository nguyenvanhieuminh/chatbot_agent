import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext.jsx'
import { useProgress } from '../context/ProgressContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  IconSun,
  IconMoon,
  IconSearch,
  IconBook,
  IconCards,
  IconQuiz,
  IconChart,
  IconFlame,
  IconMenu,
  IconClose,
} from './Icons.jsx'

const NAV = [
  { to: '/lop', label: 'Phổ thông', Icon: IconBook },
  { to: '/learn', label: 'Chuyên môn', Icon: IconBook },
  { to: '/blog', label: 'Blog', Icon: IconBook },
  { to: '/flashcard', label: 'Flashcard', Icon: IconCards },
  { to: '/trac-nghiem', label: 'Trắc nghiệm', Icon: IconQuiz },
  { to: '/tien-do', label: 'Tiến độ', Icon: IconChart },
]

/** Nhan cho nut dan vao khu rieng cua tung vai tro. */
const AREA_LABEL = {
  admin: '⚙️ Quản trị',
  teacher: '🧑‍🏫 Lớp tôi dạy',
  student: '🎒 Lớp của tôi',
}

/** Muc menu chinh them theo vai tro. */
const ROLE_NAV = {
  teacher: [{ to: '/giao-vien', label: 'Lớp tôi dạy', Icon: IconBook }],
  student: [
    { to: '/lop-hoc', label: 'Lớp của tôi', Icon: IconBook },
    { to: '/bai-kiem-tra', label: 'Bài được giao', Icon: IconQuiz },
  ],
}

export default function Navbar({ onOpenSearch }) {
  const { isDark, toggleTheme } = useTheme()
  const { streak } = useProgress()
  const { isAuthenticated, role, homePath, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const navItems = [...NAV, ...(ROLE_NAV[role] ?? [])]

  async function handleLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      await logout()
      navigate('/')
    }
  }

  const linkClass = ({ isActive }) =>
    [
      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white',
    ].join(' ')

  return (
    <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="focus-ring flex shrink-0 items-center gap-2 rounded-lg">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-lg shadow-sm">
            🛤️
          </span>
          <span className="hidden text-base font-bold tracking-tight text-slate-900 sm:block dark:text-white">
            Path<span className="text-brand-600 dark:text-brand-400">VN</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="focus-ring flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 transition-colors hover:border-brand-300 hover:text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <IconSearch className="h-4 w-4" />
            <span className="hidden xl:inline">Tìm lý thuyết…</span>
            <kbd className="hidden rounded border border-slate-300 px-1.5 text-xs font-sans xl:inline dark:border-slate-700">
              Ctrl K
            </kbd>
          </button>

          {streak?.count > 0 && (
            <span
              title={`Bạn đã học ${streak.count} ngày liên tiếp`}
              className="hidden items-center gap-1 rounded-xl bg-orange-50 px-2.5 py-2 text-sm font-semibold text-orange-600 sm:flex dark:bg-orange-500/10 dark:text-orange-400"
            >
              <IconFlame className="h-4 w-4" />
              {streak.count}
            </span>
          )}

          <Link
            to={isAuthenticated ? homePath : '/dang-nhap'}
            title={isAuthenticated ? AREA_LABEL[role] : 'Đăng nhập'}
            className="focus-ring hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 sm:block dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {isAuthenticated ? AREA_LABEL[role] : '🔑 Đăng nhập'}
          </Link>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
            className="focus-ring rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {isDark ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              title="Đăng xuất"
              className="focus-ring hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 sm:block dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Đăng xuất
            </button>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Mở menu"
            aria-expanded={open}
            className="focus-ring rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden dark:border-slate-800 dark:text-slate-400"
          >
            {open ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-fade-up border-t border-slate-200 bg-white px-4 py-2 lg:hidden dark:border-slate-800 dark:bg-slate-950">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} className={linkClass} onClick={() => setOpen(false)}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <Link
            to={isAuthenticated ? homePath : '/dang-nhap'}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            {isAuthenticated ? AREA_LABEL[role] : '🔑 Đăng nhập'}
          </Link>
          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                handleLogout()
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              Đăng xuất
            </button>
          )}
        </nav>
      )}
    </header>
  )
}
