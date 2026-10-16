import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)

  useEffect(() => {
    loadSubjects()
  }, [])

  async function loadSubjects() {
    setLoading(true)
    setError('')
    try {
      const data = await api.listSubjects()
      setSubjects(data.subjects)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAdd() {
    setEditingSubject({
      id: '',
      name: '',
      short: '',
      icon: '',
      color: 'blue',
      description: '',
    })
    setShowModal(true)
  }

  function handleEdit(subject) {
    setEditingSubject({ ...subject })
    setShowModal(true)
  }

  async function handleDelete(subject) {
    if (!confirm(`Xóa môn học "${subject.name}"?\n\n⚠️ Lưu ý: Bạn không thể xóa nếu còn bài học thuộc môn này.`)) {
      return
    }
    try {
      await api.deleteSubject(subject.id)
      await loadSubjects()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  function handleCloseModal() {
    setShowModal(false)
    setEditingSubject(null)
  }

  async function handleSave() {
    if (!editingSubject) return

    try {
      const isNew = !subjects.find((s) => s.id === editingSubject.id)

      const data = {
        id: editingSubject.id.trim(),
        name: editingSubject.name.trim(),
        short: editingSubject.short.trim(),
        icon: editingSubject.icon.trim(),
        color: editingSubject.color,
        description: editingSubject.description.trim(),
      }

      if (isNew) {
        await api.createSubject(data)
      } else {
        await api.updateSubject(editingSubject.id, data)
      }

      handleCloseModal()
      await loadSubjects()
    } catch (err) {
      alert('Lỗi: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý môn học</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{subjects.length} môn học</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <span>➕</span>
          <span>Thêm môn học</span>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">Chưa có môn học nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Môn học
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Tên ngắn
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Màu sắc
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Số bài học
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {subjects.map((subject) => (
                  <tr key={subject.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <code className="text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {subject.id}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{subject.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {subject.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {subject.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{subject.short}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full bg-${subject.color}-500`}></div>
                        <span className="text-sm text-slate-700 dark:text-slate-300">{subject.color}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {subject.lessonCount || 0} bài
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(subject)}
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

      {/* Modal */}
      {showModal && editingSubject && (
        <SubjectModal
          subject={editingSubject}
          onChange={setEditingSubject}
          onSave={handleSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

function SubjectModal({ subject, onChange, onSave, onClose }) {
  const isNew = !subject.id || subject.id === ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isNew ? 'Thêm môn học mới' : 'Chỉnh sửa môn học'}
          </h2>

          {/* ID */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              ID (slug) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject.id}
              onChange={(e) => onChange({ ...subject, id: e.target.value })}
              disabled={!isNew}
              placeholder="toan, vatli, hoahoc..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            {isNew && (
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Chỉ dùng chữ thường, không dấu, không khoảng trắng
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tên đầy đủ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject.name}
              onChange={(e) => onChange({ ...subject, name: e.target.value })}
              placeholder="Toán học, Vật lý..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Short */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tên ngắn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject.short}
              onChange={(e) => onChange({ ...subject, short: e.target.value })}
              placeholder="Toán, Lý..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Icon (emoji) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject.icon}
              onChange={(e) => onChange({ ...subject, icon: e.target.value })}
              placeholder="📐 📊 🧪 🌿"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Màu chủ đạo <span className="text-red-500">*</span>
            </label>
            <select
              value={subject.color}
              onChange={(e) => onChange({ ...subject, color: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="red">Red</option>
              <option value="yellow">Yellow</option>
              <option value="purple">Purple</option>
              <option value="pink">Pink</option>
              <option value="indigo">Indigo</option>
              <option value="orange">Orange</option>
              <option value="teal">Teal</option>
              <option value="cyan">Cyan</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              value={subject.description}
              onChange={(e) => onChange({ ...subject, description: e.target.value })}
              rows={3}
              placeholder="Mô tả ngắn về môn học..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {isNew ? '➕ Thêm' : '💾 Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
