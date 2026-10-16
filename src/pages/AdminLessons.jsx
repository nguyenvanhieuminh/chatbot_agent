import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function AdminLessons() {
  const [lessons, setLessons] = useState([])
  const [meta, setMeta] = useState({ subjects: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [subjectId, setSubjectId] = useState('')
  const [grade, setGrade] = useState('')
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('updated_at')
  const [order, setOrder] = useState('desc')

  useEffect(() => {
    loadMeta()
  }, [])

  useEffect(() => {
    loadLessons()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, grade, status, search, sort, order])

  async function loadMeta() {
    try {
      const data = await api.adminMeta()
      setMeta(data)
    } catch (err) {
      console.error('Load meta failed:', err)
    }
  }

  async function loadLessons() {
    setLoading(true)
    setError('')
    try {
      // Ten tham so phai khop dung voi req.query o server/routes/admin.js:
      // `subject` (khong phai subject_id), `grade`, `status`, `q`, `sort`, `order`.
      const params = {
        subject: subjectId,
        grade,
        status,
        q: search,
        sort,
        order,
      }
      const data = await api.listLessons(params)
      // GET /admin/lessons tra ve MOT MANG THUAN, khong boc trong { lessons }.
      // Doc data.lessons se ra undefined -> `lessons.length` khi render nem
      // TypeError va lam trang toan bo man hinh. Guard de API doi shape sau nay
      // chi lam danh sach rong chu khong sap trang.
      setLessons(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusToggle(lesson) {
    const newStatus = lesson.status === 'published' ? 'draft' : 'published'
    try {
      await api.setLessonStatus(lesson.id, newStatus)
      await loadLessons()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  async function handleDelete(lesson) {
    if (!confirm(`Xóa bài "${lesson.title}"?\nHành động này không thể hoàn tác.`)) return
    try {
      await api.deleteLesson(lesson.id)
      await loadLessons()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  function handleSort(field) {
    if (sort === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc')
    } else {
      setSort(field)
      setOrder('asc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý bài học</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {lessons.length} bài học
          </p>
        </div>
        <Link
          to="/admin/bai-hoc/moi"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <span>➕</span>
          <span>Tạo bài mới</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Tìm kiếm bài học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Subject Filter */}
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả môn học</option>
            {meta.subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.icon} {s.name}
              </option>
            ))}
          </select>

          {/* Grade Filter */}
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả lớp</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g} value={g}>
                Lớp {g}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>

          {/* Sort */}
          <select
            value={`${sort}-${order}`}
            onChange={(e) => {
              const [newSort, newOrder] = e.target.value.split('-')
              setSort(newSort)
              setOrder(newOrder)
            }}
            className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated_at-desc">Mới cập nhật</option>
            <option value="updated_at-asc">Cũ nhất</option>
            <option value="title-asc">Tên A-Z</option>
            <option value="title-desc">Tên Z-A</option>
            <option value="grade-asc">Lớp thấp-cao</option>
            <option value="grade-desc">Lớp cao-thấp</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Đang tải...</p>
            </div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">Không có bài học nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th
                    onClick={() => handleSort('title')}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      Bài học
                      {sort === 'title' && <span>{order === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th
                    onClick={() => handleSort('grade')}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      Lớp
                      {sort === 'grade' && <span>{order === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th
                    onClick={() => handleSort('updated_at')}
                    className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-1">
                      Cập nhật
                      {sort === 'updated_at' && <span>{order === 'asc' ? '↑' : '↓'}</span>}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {lessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/bai-hoc/${lesson.id}`}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {lesson.title}
                      </Link>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {lesson.summary}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lesson.subject_icon}</span>
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {lesson.subject_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        Lớp {lesson.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleStatusToggle(lesson)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          lesson.status === 'published'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                        }`}
                      >
                        {lesson.status === 'published' ? '✅ Đã xuất bản' : '📄 Bản nháp'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(lesson.updated_at).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/bai-hoc/${lesson.id}`}
                          className="px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        >
                          ✏️ Sửa
                        </Link>
                        <button
                          onClick={() => handleDelete(lesson)}
                          className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
