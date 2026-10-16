import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'
import { palette } from '../lib/palette.js'
import { createSearchIndex } from '../lib/search.js'
import { TIERS, GRADES, tierOfGrade } from '../../shared/curriculum.js'

const ContentContext = createContext(null)

const EMPTY = { subjects: [], chapters: [], lessons: [] }

export function ContentProvider({ children }) {
  const [raw, setRaw] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getContent(signal)
      setRaw({
        subjects: data.subjects ?? [],
        chapters: data.chapters ?? [],
        lessons: data.lessons ?? [],
      })
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load])

  const value = useMemo(() => {
    // Gan mau (class Tailwind) tu khoa mau luu trong DB
    const subjects = raw.subjects.map((s) => {
      const p = palette(s.color)
      return { ...s, accent: p.accent, tint: p.tint, dot: p.dot }
    })
    const subjectById = new Map(subjects.map((s) => [s.id, s]))

    // Bai hoc duoc lam giau bang thong tin mon, de component dung truc tiep
    const allLessons = raw.lessons.map((l) => {
      const s = subjectById.get(l.subjectId)
      return {
        ...l,
        subjectName: s?.name ?? l.subjectId,
        subjectIcon: s?.icon ?? '📘',
        subjectShort: s?.short ?? l.subjectId,
        tint: s?.tint ?? palette('indigo').tint,
        accent: s?.accent ?? palette('indigo').accent,
        dot: s?.dot ?? palette('indigo').dot,
      }
    })
    const lessonById = new Map(allLessons.map((l) => [l.id, l]))

    const allCards = allLessons.flatMap((l) =>
      (l.flashcards ?? []).map((c, i) => ({
        ...c,
        id: `${l.id}#${i}`,
        lessonId: l.id,
        lessonTitle: l.title,
        subjectId: l.subjectId,
        subjectName: l.subjectName,
        grade: l.grade,
      })),
    )

    /** Bai hoc cua mot mon, gioi han trong mot khoi lop (neu co). */
    const lessonsOf = (subjectId, grade = null) =>
      allLessons.filter(
        (l) => l.subjectId === subjectId && (grade == null || l.grade === Number(grade)),
      )

    /* ------------------------- Muc luc theo chuong ------------------------- */

    const chapterById = new Map(raw.chapters.map((c) => [c.id, c]))

    /** Chuong cua mot mon trong mot khoi lop, kem bai hoc — dung lam muc luc. */
    const chaptersOf = (subjectId, grade) => {
      const g = Number(grade)
      return raw.chapters
        .filter((c) => c.subjectId === subjectId && c.grade === g)
        .map((c) => ({
          ...c,
          lessons: allLessons.filter((l) => l.chapterId === c.id),
        }))
    }

    /** Bai hoc chua gan chuong nao — hien o cuoi muc luc de khong bi mat. */
    const looseLessonsOf = (subjectId, grade) => {
      const g = Number(grade)
      return allLessons.filter(
        (l) => l.subjectId === subjectId && l.grade === g && !l.chapterId,
      )
    }

    /** Cac mon co trong mot khoi lop, kem so bai da co. */
    const subjectsOfGrade = (grade) => {
      const g = Number(grade)
      return subjects
        .filter((s) => (s.grades ?? []).includes(g))
        .map((s) => {
          const lessons = lessonsOf(s.id, g)
          return { ...s, grade: g, lessons, lessonCount: lessons.length }
        })
    }

    /** Bai truoc / bai sau trong cung mon + cung lop. */
    const getNeighbors = (lessonId) => {
      const lesson = lessonById.get(lessonId)
      if (!lesson) return { prev: null, next: null }
      const siblings = lessonsOf(lesson.subjectId, lesson.grade)
      const idx = siblings.findIndex((l) => l.id === lessonId)
      return {
        prev: idx > 0 ? siblings[idx - 1] : null,
        next: idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null,
      }
    }

    const gradeStats = GRADES.map((g) => ({
      grade: g,
      tier: tierOfGrade(g),
      subjectCount: subjects.filter((s) => (s.grades ?? []).includes(g)).length,
      lessonCount: allLessons.filter((l) => l.grade === g).length,
    }))

    return {
      loading,
      error,
      reload: () => load(),
      tiers: TIERS,
      grades: GRADES,
      gradeStats,
      subjects,
      allLessons,
      allCards,
      stats: {
        subjects: subjects.length,
        lessons: allLessons.length,
        cards: allCards.length,
        questions: allLessons.reduce((sum, l) => sum + (l.quiz?.length ?? 0), 0),
        grades: GRADES.length,
      },
      getSubject: (id) => subjectById.get(id) ?? null,
      getLesson: (id) => lessonById.get(id) ?? null,
      getChapter: (id) => chapterById.get(id) ?? null,
      lessonsOf,
      chaptersOf,
      looseLessonsOf,
      subjectsOfGrade,
      getNeighbors,
      search: createSearchIndex(allLessons),
    }
  }, [raw, loading, error, load])

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent() {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent phai duoc dung ben trong <ContentProvider>')
  return ctx
}
