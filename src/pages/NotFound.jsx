import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="card mx-auto max-w-lg p-10 text-center">
      <p className="text-5xl">🧭</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Không tìm thấy trang</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Nội dung bạn tìm không tồn tại hoặc đã được đổi đường dẫn.
      </p>
      <Link
        to="/"
        className="focus-ring mt-6 inline-block rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
