import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [audit, setAudit] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const [statsData, auditData] = await Promise.all([
        api.adminStats(),
        api.adminAudit(),
      ])
      setStats(statsData)
      setAudit(auditData.logs)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="📚"
          label="Tổng môn học"
          value={stats.subjects}
          color="blue"
          to="/admin/mon-hoc"
        />
        <StatCard
          icon="📝"
          label="Tổng bài học"
          value={stats.lessons}
          color="green"
          to="/admin/bai-hoc"
        />
        <StatCard
          icon="✅"
          label="Đã xuất bản"
          value={stats.published}
          color="indigo"
        />
        <StatCard
          icon="📄"
          label="Bản nháp"
          value={stats.drafts}
          color="amber"
        />
      </div>

      {/* Lessons by Subject */}
      {stats.bySubject && stats.bySubject.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Phân bố bài học theo môn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.bySubject.map((item) => (
              <div
                key={item.subject_id}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {item.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {item.count} bài học
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Hoạt động gần đây
        </h2>

        {audit.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            Chưa có hoạt động nào
          </p>
        ) : (
          <div className="space-y-3">
            {audit.map((log) => (
              <AuditLogItem key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, to }) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  }

  const content = (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  )

  if (to) {
    return <Link to={to}>{content}</Link>
  }

  return content
}

function AuditLogItem({ log }) {
  const actionLabels = {
    create_lesson: 'Tạo bài học',
    update_lesson: 'Cập nhật bài học',
    delete_lesson: 'Xóa bài học',
    publish_lesson: 'Xuất bản bài học',
    draft_lesson: 'Chuyển về nháp',
    create_subject: 'Tạo môn học',
    update_subject: 'Cập nhật môn học',
    delete_subject: 'Xóa môn học',
    import_lessons: 'Import bài học',
  }

  const actionIcons = {
    create_lesson: '➕',
    update_lesson: '✏️',
    delete_lesson: '🗑️',
    publish_lesson: '✅',
    draft_lesson: '📄',
    create_subject: '➕',
    update_subject: '✏️',
    delete_subject: '🗑️',
    import_lessons: '📥',
  }

  const details = log.details ? JSON.parse(log.details) : {}

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
        <span>{actionIcons[log.action] || '📝'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 dark:text-white">
          <span className="font-medium">{log.username}</span>
          {' '}
          <span className="text-slate-600 dark:text-slate-400">
            {actionLabels[log.action] || log.action}
          </span>
          {details.title && (
            <span className="text-slate-900 dark:text-white">
              {' '}<span className="font-medium">"{details.title}"</span>
            </span>
          )}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {new Date(log.created_at).toLocaleString('vi-VN')}
        </p>
      </div>
    </div>
  )
}
