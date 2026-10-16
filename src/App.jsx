import { useCallback, useEffect, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import SearchModal from './components/SearchModal.jsx'
import Home from './pages/Home.jsx'
import Grades from './pages/Grades.jsx'
import GradeDetail from './pages/GradeDetail.jsx'
import Subjects from './pages/Subjects.jsx'
import SubjectDetail from './pages/SubjectDetail.jsx'
import Lesson from './pages/Lesson.jsx'
import FlashcardsPage from './pages/FlashcardsPage.jsx'
import QuizPage from './pages/QuizPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NotFound from './pages/NotFound.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Professional from './pages/Professional.jsx'
import BlogList from './pages/BlogList.jsx'
import TeacherClasses from './pages/TeacherClasses.jsx'
import TeacherClassDetail from './pages/TeacherClassDetail.jsx'
import TeacherAssignmentEditor from './pages/TeacherAssignmentEditor.jsx'
import TeacherSubmissions from './pages/TeacherSubmissions.jsx'
import StudentClasses from './pages/StudentClasses.jsx'
import StudentAssignments from './pages/StudentAssignments.jsx'
import TakeAssignment from './pages/TakeAssignment.jsx'
import AdminLayout from './components/AdminLayout.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminOutline from './pages/AdminOutline.jsx'
import AdminLessons from './pages/AdminLessons.jsx'
import AdminLessonEditor from './pages/AdminLessonEditor.jsx'
import AdminSubjects from './pages/AdminSubjects.jsx'
import AdminImportExport from './pages/AdminImportExport.jsx'
import AdminAccount from './pages/AdminAccount.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

/** Doi route -> cuon len dau trang. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

/**
 * Khung cho phan nguoi hoc: navbar + noi dung gioi han be ngang + footer.
 * Khu admin KHONG dung khung nay (no co sidebar rieng, chiem toan man hinh).
 */
function PublicShell({ onOpenSearch }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onOpenSearch={onOpenSearch} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-10">
        <Outlet />
      </main>
      <footer className="no-print border-t border-slate-200 py-8 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 text-sm text-slate-500">
          <p className="font-semibold text-slate-700 dark:text-slate-300">🛤️ PathVN</p>
          <p className="mt-1">
            Nền tảng học tập từ phổ thông đến chuyên môn · Lý thuyết, flashcards, trắc nghiệm và theo dõi tiến độ.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Nội dung mang tính tổng hợp, hỗ trợ ôn tập — đối chiếu với sách giáo khoa khi cần.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])

  // Ctrl/Cmd + K mo tim kiem
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <ScrollToTop />
      <SearchModal open={searchOpen} onClose={closeSearch} />

      <Routes>
        {/* ----------------------- Khu nguoi hoc ----------------------- */}
        <Route element={<PublicShell onOpenSearch={openSearch} />}>
          <Route path="/" element={<Home onOpenSearch={openSearch} />} />
          <Route path="/lop" element={<Grades />} />
          <Route path="/lop/:grade" element={<GradeDetail />} />
          <Route path="/lop/:grade/:subjectId" element={<GradeDetail />} />
          <Route path="/mon-hoc" element={<Subjects />} />
          <Route path="/mon-hoc/:subjectId" element={<SubjectDetail />} />
          <Route path="/bai-hoc/:lessonId" element={<Lesson />} />
          <Route path="/flashcard" element={<FlashcardsPage />} />
          <Route path="/trac-nghiem" element={<QuizPage />} />
          <Route path="/tien-do" element={<Dashboard />} />

          {/* Multi-content routes */}
          <Route path="/learn" element={<Professional />} />
          <Route path="/learn/:category" element={<Professional />} />
          <Route path="/blog" element={<BlogList />} />

          {/* Khu giao vien — dung chung khung navbar/footer voi nguoi hoc */}
          <Route element={<ProtectedRoute roles={['teacher', 'admin']} />}>
            <Route path="/giao-vien" element={<TeacherClasses />} />
            <Route path="/giao-vien/lop/:classId" element={<TeacherClassDetail />} />
            <Route path="/giao-vien/lop/:classId/de/moi" element={<TeacherAssignmentEditor />} />
            <Route path="/giao-vien/de/:assignmentId" element={<TeacherAssignmentEditor />} />
            <Route path="/giao-vien/de/:assignmentId/bai-nop" element={<TeacherSubmissions />} />
          </Route>

          {/* Khu hoc sinh */}
          <Route element={<ProtectedRoute roles={['student', 'admin']} />}>
            <Route path="/lop-hoc" element={<StudentClasses />} />
            <Route path="/bai-kiem-tra" element={<StudentAssignments />} />
            <Route path="/bai-kiem-tra/:assignmentId" element={<TakeAssignment />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ---------------------- Dang nhap / dang ky ---------------------- */}
        <Route path="/dang-nhap" element={<Login />} />
        <Route path="/dang-ky" element={<Register />} />
        {/* Duong dan cu, giu lai de link da luu khong bi 404 */}
        <Route path="/admin/login" element={<Navigate to="/dang-nhap" replace />} />

        {/* ------------------------- Khu admin ------------------------- */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="khung-noi-dung" element={<AdminOutline />} />
            <Route path="bai-hoc" element={<AdminLessons />} />
            <Route path="bai-hoc/moi" element={<AdminLessonEditor />} />
            <Route path="bai-hoc/:lessonId" element={<AdminLessonEditor />} />
            <Route path="mon-hoc" element={<AdminSubjects />} />
            <Route path="import-export" element={<AdminImportExport />} />
            <Route path="tai-khoan" element={<AdminAccount />} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}
