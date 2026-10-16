import { useState } from 'react'
import { api } from '../api/client'

export default function AdminImportExport() {
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [overwrite, setOverwrite] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Export filters
  const [subjectId, setSubjectId] = useState('')
  const [grade, setGrade] = useState('')
  const [status, setStatus] = useState('')

  async function handleExport() {
    setExportLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const params = {
        subject_id: subjectId,
        grade,
        status,
      }
      const data = await api.exportLessons(params)

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data.lessons, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pathvn-lessons-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: `Đã xuất ${data.lessons.length} bài học` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setExportLoading(false)
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      setImportFile(file)
      setMessage({ type: '', text: '' })
    }
  }

  async function handleImport() {
    if (!importFile) {
      setMessage({ type: 'error', text: 'Vui lòng chọn file JSON' })
      return
    }

    setImportLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const text = await importFile.text()
      const lessons = JSON.parse(text)

      if (!Array.isArray(lessons)) {
        throw new Error('File JSON phải là một mảng các bài học')
      }

      const result = await api.importLessons(lessons, overwrite)

      setMessage({
        type: 'success',
        text: `Đã import: ${result.created} bài mới, ${result.updated} bài cập nhật, ${result.skipped} bài bỏ qua`,
      })
      setImportFile(null)
      // Reset file input
      const fileInput = document.getElementById('import-file')
      if (fileInput) fileInput.value = ''
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setImportLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Import / Export</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Sao lưu và khôi phục dữ liệu bài học dạng JSON
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📤</span>
            <span>Export bài học</span>
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Xuất bài học ra file JSON để sao lưu hoặc chia sẻ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Môn học (tùy chọn)
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả môn học</option>
              <option value="toan">📐 Toán học</option>
              <option value="vatli">⚛️ Vật lý</option>
              <option value="hoahoc">🧪 Hóa học</option>
              <option value="sinhhoc">🌿 Sinh học</option>
            </select>
          </div>

          {/* Grade Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Lớp (tùy chọn)
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả lớp</option>
              {[10, 11, 12].map((g) => (
                <option key={g} value={g}>
                  Lớp {g}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Trạng thái (tùy chọn)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleExport}
          disabled={exportLoading}
          className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {exportLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang xuất...
            </span>
          ) : (
            '📤 Xuất file JSON'
          )}
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📥</span>
            <span>Import bài học</span>
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Nhập bài học từ file JSON đã xuất trước đó
          </p>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Chọn file JSON
          </label>
          <input
            id="import-file"
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-300"
          />
          {importFile && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Đã chọn: <span className="font-medium">{importFile.name}</span>
            </p>
          )}
        </div>

        {/* Overwrite Option */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="overwrite"
            checked={overwrite}
            onChange={(e) => setOverwrite(e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="overwrite" className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-medium">Ghi đè bài học trùng ID</span>
            <p className="text-slate-500 dark:text-slate-400">
              Nếu bật, các bài học có ID trùng sẽ được cập nhật. Nếu tắt, chúng sẽ bị bỏ qua.
            </p>
          </label>
        </div>

        {/* Warning */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            ⚠️ <strong>Lưu ý:</strong> Import sẽ tạo hoặc cập nhật bài học trong database. Hãy sao lưu
            dữ liệu hiện tại trước khi import để tránh mất mát.
          </p>
        </div>

        <button
          onClick={handleImport}
          disabled={importLoading || !importFile}
          className="w-full md:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          {importLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Đang import...
            </span>
          ) : (
            '📥 Import vào database'
          )}
        </button>
      </div>

      {/* Documentation */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
          📖 Định dạng file JSON
        </h3>
        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
          File JSON phải là một mảng các object bài học với cấu trúc:
        </p>
        <pre className="text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-4 rounded-lg overflow-x-auto">
{`[
  {
    "id": "toan.dao-ham-co-ban",
    "subjectId": "toan",
    "title": "Đạo hàm cơ bản",
    "grade": 11,
    "minutes": 20,
    "summary": "Khái niệm và quy tắc tính đạo hàm...",
    "keywords": ["đạo hàm", "vi phân"],
    "blocks": [...],
    "flashcards": [...],
    "quiz": [...],
    "status": "published"
  }
]`}
        </pre>
      </div>
    </div>
  )
}
