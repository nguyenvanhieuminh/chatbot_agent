import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import { usePersistentState, removeStore } from '../lib/storage.js'
import { useAuth } from './AuthContext.jsx'
import { api } from '../api/client.js'

/**
 * Luu toan bo du lieu hoc tap cua nguoi dung trong localStorage:
 *  - done:      { [lessonId]: ISOdate }         bai da hoc xong
 *  - favorites: { [lessonId]: true }            bai danh dau sao
 *  - notes:     { [lessonId]: string }          ghi chu ca nhan
 *  - quiz:      { [lessonId]: { score, total, at } }  ket qua quiz tot nhat
 *  - cards:     { [cardId]: 'known' | 'review' }      trang thai flashcard
 *  - streak:    { last: 'YYYY-MM-DD', count: n, days: [...] }
 *
 * DONG BO SERVER (hybrid):
 * Khach chua dang nhap dung localStorage y nhu truoc — vao la hoc duoc ngay,
 * khong bat dang ky. Khi da dang nhap thi `done` va `quiz` duoc day them len
 * server, vi dashboard cua giao vien doc tu bang `progress`.
 *
 * localStorage van la nguon hien thi (ghi lac quan) de UI khong phai cho mang;
 * loi mang chi lam mat dong bo tam thoi chu khong lam hong trang.
 * `favorites`/`notes`/`cards`/`streak` co tinh ca nhan nen KHONG day len server.
 */
const ProgressContext = createContext(null)

const EMPTY = {}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000)
}

export function ProgressProvider({ children }) {
  const [done, setDone] = usePersistentState('done', EMPTY)
  const [favorites, setFavorites] = usePersistentState('favorites', EMPTY)
  const [notes, setNotes] = usePersistentState('notes', EMPTY)
  const [quiz, setQuiz] = usePersistentState('quiz', EMPTY)
  const [cards, setCards] = usePersistentState('cards', EMPTY)
  const [streak, setStreak] = usePersistentState('streak', { last: null, count: 0, days: [] })

  const { user } = useAuth()
  const userId = user?.id ?? null

  /**
   * Doc trong callback de khong phai dua `done`/`quiz` vao deps cua effect
   * dong bo — neu dua vao, moi lan ghi tien do se kich hoat lai merge.
   */
  const localRef = useRef({ done, quiz })
  localRef.current = { done, quiz }

  /** Da merge cho user nao roi, tranh merge lai moi lan component re-render. */
  const syncedFor = useRef(null)

  /**
   * Ngay sau khi dang nhap: gop tien do dang co o may nay len server roi lay
   * ket qua da gop ve. Server khong bao gio ha diem tot nhat da co, nen thao
   * tac nay an toan khi chay lai.
   */
  useEffect(() => {
    if (!userId) {
      syncedFor.current = null
      return
    }
    if (syncedFor.current === userId) return
    syncedFor.current = userId

    let cancelled = false
    ;(async () => {
      try {
        const { done: d, quiz: q } = localRef.current
        const merged = Object.keys(d).length || Object.keys(q).length
          ? await api.mergeProgress({ done: d, quiz: q })
          : await api.getProgress()
        if (cancelled) return
        // Server da la hop cua ca hai phia -> dung lam trang thai hien tai
        setDone(merged.done ?? EMPTY)
        setQuiz(merged.quiz ?? EMPTY)
      } catch {
        // Mat mang thi cu dung du lieu localStorage, lan dang nhap sau thu lai
        syncedFor.current = null
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, setDone, setQuiz])

  /** Day tien do mot bai len server. Khong chan UI, loi mang thi bo qua. */
  const pushToServer = useCallback(
    (lessonId, data) => {
      if (!userId) return
      api.saveProgress(lessonId, data).catch(() => {})
    },
    [userId],
  )

  /** Ghi nhan co hoat dong hom nay -> cap nhat chuoi ngay hoc lien tiep. */
  const touchStreak = useCallback(() => {
    const d = today()
    setStreak((s) => {
      if (s.last === d) return s
      const gap = s.last ? daysBetween(s.last, d) : null
      const count = gap === 1 ? s.count + 1 : 1
      const days = [...new Set([...(s.days || []), d])].slice(-120)
      return { last: d, count, days }
    })
  }, [setStreak])

  const toggleDone = useCallback(
    (lessonId) => {
      touchStreak()
      // Quyet dinh NGOAI updater: React goi updater hai lan o StrictMode de
      // phat hien ham khong thuan, dat goi API ben trong se gui trung request.
      const wasDone = Boolean(done[lessonId])
      setDone((prev) => {
        const next = { ...prev }
        if (wasDone) delete next[lessonId]
        else next[lessonId] = new Date().toISOString()
        return next
      })
      // Bo danh dau thi phai xoa ca tren server, khong thi giao vien van thay
      // bai do la "da hoc"
      if (wasDone) {
        if (userId) api.clearProgress(lessonId).catch(() => {})
      } else {
        pushToServer(lessonId, { done: true })
      }
    },
    [done, setDone, touchStreak, pushToServer, userId],
  )

  const markDone = useCallback(
    (lessonId) => {
      touchStreak()
      setDone((prev) => (prev[lessonId] ? prev : { ...prev, [lessonId]: new Date().toISOString() }))
      pushToServer(lessonId, { done: true })
    },
    [setDone, touchStreak, pushToServer],
  )

  const toggleFavorite = useCallback(
    (lessonId) => {
      setFavorites((prev) => {
        const next = { ...prev }
        if (next[lessonId]) delete next[lessonId]
        else next[lessonId] = true
        return next
      })
    },
    [setFavorites],
  )

  const saveNote = useCallback(
    (lessonId, text) => {
      touchStreak()
      setNotes((prev) => {
        const next = { ...prev }
        if (!text || !text.trim()) delete next[lessonId]
        else next[lessonId] = text
        return next
      })
    },
    [setNotes, touchStreak],
  )

  const saveQuizResult = useCallback(
    (lessonId, score, total) => {
      touchStreak()
      setQuiz((prev) => {
        const old = prev[lessonId]
        const better = !old || score / total > old.score / old.total
        if (!better) return { ...prev, [lessonId]: { ...old, lastAt: new Date().toISOString() } }
        return {
          ...prev,
          [lessonId]: { score, total, at: new Date().toISOString(), lastAt: new Date().toISOString() },
        }
      })
      // Gui diem vua lam, khong phai diem tot nhat — server tu quyet dinh co
      // nang diem tot nhat len khong (xem ON CONFLICT o routes/progress.js)
      pushToServer(lessonId, { score, total })
    },
    [setQuiz, touchStreak, pushToServer],
  )

  const setCardState = useCallback(
    (cardId, state) => {
      touchStreak()
      setCards((prev) => {
        const next = { ...prev }
        if (!state) delete next[cardId]
        else next[cardId] = state
        return next
      })
    },
    [setCards, touchStreak],
  )

  const resetAll = useCallback(() => {
    ;['done', 'favorites', 'notes', 'quiz', 'cards', 'streak'].forEach(removeStore)
    setDone(EMPTY)
    setFavorites(EMPTY)
    setNotes(EMPTY)
    setQuiz(EMPTY)
    setCards(EMPTY)
    setStreak({ last: null, count: 0, days: [] })
  }, [setDone, setFavorites, setNotes, setQuiz, setCards, setStreak])

  const exportData = useCallback(
    () => ({ version: 1, exportedAt: new Date().toISOString(), done, favorites, notes, quiz, cards, streak }),
    [done, favorites, notes, quiz, cards, streak],
  )

  const importData = useCallback(
    (data) => {
      if (!data || typeof data !== 'object') throw new Error('Du lieu khong hop le')
      if (data.done) setDone(data.done)
      if (data.favorites) setFavorites(data.favorites)
      if (data.notes) setNotes(data.notes)
      if (data.quiz) setQuiz(data.quiz)
      if (data.cards) setCards(data.cards)
      if (data.streak) setStreak(data.streak)
    },
    [setDone, setFavorites, setNotes, setQuiz, setCards, setStreak],
  )

  const value = useMemo(
    () => ({
      done,
      favorites,
      notes,
      quiz,
      cards,
      streak,
      isDone: (id) => Boolean(done[id]),
      isFavorite: (id) => Boolean(favorites[id]),
      toggleDone,
      markDone,
      toggleFavorite,
      saveNote,
      saveQuizResult,
      setCardState,
      resetAll,
      exportData,
      importData,
    }),
    [
      done,
      favorites,
      notes,
      quiz,
      cards,
      streak,
      toggleDone,
      markDone,
      toggleFavorite,
      saveNote,
      saveQuizResult,
      setCardState,
      resetAll,
      exportData,
      importData,
    ],
  )

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress phai duoc dung ben trong <ProgressProvider>')
  return ctx
}
