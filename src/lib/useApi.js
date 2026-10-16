import { useCallback, useEffect, useState } from 'react'

/**
 * Goi mot ham API khi mount va moi lan `deps` doi.
 *
 * `fn` duoc goi voi AbortSignal; huy request khi component unmount hoac deps
 * doi, nen khong con setState sau unmount va khong bi ket qua cu ghi de ket
 * qua moi khi nguoi dung bam nhanh giua cac trang.
 */
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    const ctrl = new AbortController()
    let active = true
    setLoading(true)
    setError('')
    Promise.resolve(fn(ctrl.signal))
      .then((result) => {
        if (active) setData(result)
      })
      .catch((err) => {
        if (!active || err?.name === 'AbortError') return
        setError(err?.message || 'Không tải được dữ liệu.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
      ctrl.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { data, loading, error, reload, setData }
}
