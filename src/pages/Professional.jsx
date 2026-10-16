import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client.js'
import { PROFESSIONAL_CATEGORIES, DIFFICULTY_LEVELS } from '../../shared/curriculum.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'

export default function Professional() {
  const { category: categoryParam } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await api.getProfessional(selectedCategory === 'all' ? null : selectedCategory)
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedCategory])

  if (loading) return <Loading label="Đang tải..." />
  if (error) return <ErrorState message={error} />

  const categories = PROFESSIONAL_CATEGORIES
  const lessons = selectedCategory === 'all'
    ? Object.values(data?.categories || {}).flat()
    : data?.lessons || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <p className="label">Học chuyên môn</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Kỹ năng chuyên môn
        </h1>
        <p className="mt-1.5 text-slate-600 dark:text-slate-400">
          Lập trình, thiết kế, data science và các kỹ năng cho developer
        </p>
      </header>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      {lessons.length === 0 ? (
        <EmptyState message="Chưa có nội dung. Sắp ra mắt!" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson) => (
            <Link
              key={lesson.id}
              to={`/bai-hoc/${lesson.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-600"
            >
              {/* Level Badge */}
              {lesson.level && (
                <div className="mb-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    lesson.level === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                    lesson.level === 'intermediate' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' :
                    'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                  }`}>
                    {DIFFICULTY_LEVELS.find(l => l.value === lesson.level)?.label || lesson.level}
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                {lesson.title}
              </h3>

              {/* Summary */}
              {lesson.summary && (
                <p className="mt-2 text-sm text-slate-600 line-clamp-2 dark:text-slate-400">
                  {lesson.summary}
                </p>
              )}

              {/* Tags */}
              {lesson.tags && lesson.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {lesson.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <span>⏱️ {lesson.minutes} min</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
