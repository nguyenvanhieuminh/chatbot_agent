import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client.js'
import { BLOG_CATEGORIES } from '../../shared/curriculum.js'
import { Loading, ErrorState, EmptyState } from '../components/States.jsx'

export default function BlogList() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const result = await api.getBlog(selectedCategory === 'all' ? null : selectedCategory)
        setPosts(result.posts || [])
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

  const categories = BLOG_CATEGORIES
  const filteredPosts = selectedCategory === 'all'
    ? posts
    : posts.filter(p => p.category === selectedCategory)

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <p className="label">Blog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Bài viết & Hướng dẫn
        </h1>
        <p className="mt-1.5 text-slate-600 dark:text-slate-400">
          Chia sẻ kinh nghiệm, mẹo học tập và lộ trình nghề nghiệp
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

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <EmptyState message="Chưa có bài viết. Sắp ra mắt!" />
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.id}
              to={`/bai-hoc/${post.id}`}
              className="group block rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-brand-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-brand-600"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Category Badge */}
                  {post.category && (
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                        {categories.find(c => c.id === post.category)?.icon || '📝'}{' '}
                        {categories.find(c => c.id === post.category)?.name || post.category}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-xl font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                    {post.title}
                  </h2>

                  {/* Summary */}
                  {post.summary && (
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                      {post.summary}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                    <span>⏱️ {post.minutes} min read</span>
                    {post.createdAt && (
                      <span>📅 {new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                  →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
