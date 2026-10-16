import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Chan route theo vai tro.
 *
 * `roles` bo trong = chi can dang nhap. Phan biet ro hai truong hop:
 *  - Chua dang nhap  -> day ve /dang-nhap, nho lai trang dang muon vao
 *  - Da dang nhap nhung sai quyen -> hien thong bao, KHONG day ve login
 *    (day ve login se tao vong lap vi nguoi dung dang nhap roi)
 */
export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, loading, role, homePath } = useAuth()
  const location = useLocation()

  // min-h-[60vh] thay vi min-h-screen: cac route nay nam trong PublicShell da
  // co navbar + footer, dung min-h-screen se lam trang cao qua mot man hinh
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Đang kiểm tra phiên đăng nhập…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location.pathname }} replace />
  }

  if (roles?.length && !roles.includes(role)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-5xl">🔒</p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bạn không có quyền vào trang này
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Trang này dành cho {roles.map((r) => ROLE_LABEL[r] ?? r).join(' hoặc ')}. Tài khoản của
            bạn đang là {ROLE_LABEL[role] ?? role}.
          </p>
          <Link
            to={homePath}
            className="focus-ring mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Về trang của tôi
          </Link>
        </div>
      </div>
    )
  }

  return <Outlet />
}

const ROLE_LABEL = {
  admin: 'quản trị viên',
  teacher: 'giáo viên',
  student: 'học sinh',
}
