const BASE = '/api'

export class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors ?? []
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(BASE + path, {
      method,
      signal,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('Không kết nối được tới máy chủ. Máy chủ API đã chạy chưa?')
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : null

  if (!res.ok) {
    throw new ApiError(payload?.error || `Lỗi ${res.status}`, {
      status: res.status,
      errors: payload?.errors,
    })
  }
  return payload
}

export const api = {
  /* --------------------------- Cong khai --------------------------- */
  getContent: (signal) => request('/content', { signal }),
  getProfessional: (category) => request(category ? `/professional/${category}` : '/professional'),
  getBlog: (category) => request(category ? `/blog/category/${category}` : '/blog'),

  /* --------------------------- Dang nhap --------------------------- */
  me: () => request('/auth/me'),
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),

  /* --------------------------- Tien do --------------------------- */
  getProgress: () => request('/progress'),
  saveProgress: (lessonId, data) =>
    request(`/progress/${encodeURIComponent(lessonId)}`, { method: 'PUT', body: data }),
  clearProgress: (lessonId) =>
    request(`/progress/${encodeURIComponent(lessonId)}`, { method: 'DELETE' }),
  mergeProgress: (data) => request('/progress/merge', { method: 'POST', body: data }),

  /* -------------------------- Giao vien -------------------------- */
  teacherClasses: () => request('/teacher/classes'),
  teacherCreateClass: (data) => request('/teacher/classes', { method: 'POST', body: data }),
  teacherClass: (id) => request(`/teacher/classes/${encodeURIComponent(id)}`),
  teacherUpdateClass: (id, data) =>
    request(`/teacher/classes/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
  teacherDeleteClass: (id) =>
    request(`/teacher/classes/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  teacherRotateCode: (id) =>
    request(`/teacher/classes/${encodeURIComponent(id)}/rotate-code`, { method: 'POST' }),
  teacherRemoveMember: (classId, userId) =>
    request(`/teacher/classes/${encodeURIComponent(classId)}/members/${userId}`, { method: 'DELETE' }),
  teacherDashboard: (id) => request(`/teacher/classes/${encodeURIComponent(id)}/dashboard`),
  teacherCreateAssignment: (classId, data) =>
    request(`/teacher/classes/${encodeURIComponent(classId)}/assignments`, { method: 'POST', body: data }),
  teacherUpdateAssignment: (id, data) =>
    request(`/teacher/assignments/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
  teacherDeleteAssignment: (id) =>
    request(`/teacher/assignments/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  teacherSubmissions: (id) => request(`/teacher/assignments/${encodeURIComponent(id)}/submissions`),
  teacherGrade: (submissionId, data) =>
    request(`/teacher/submissions/${encodeURIComponent(submissionId)}/grade`, { method: 'PATCH', body: data }),

  /* --------------------------- Hoc sinh --------------------------- */
  studentClasses: () => request('/student/classes'),
  studentJoinClass: (code) => request('/student/classes/join', { method: 'POST', body: { code } }),
  studentLeaveClass: (id) =>
    request(`/student/classes/${encodeURIComponent(id)}/leave`, { method: 'DELETE' }),
  studentAssignments: () => request('/student/assignments'),
  studentAssignment: (id) => request(`/student/assignments/${encodeURIComponent(id)}`),
  studentSubmit: (id, answers) =>
    request(`/student/assignments/${encodeURIComponent(id)}/submit`, { method: 'POST', body: { answers } }),

  /* ---------------------------- Admin ---------------------------- */
  adminMeta: () => request('/admin/meta'),
  adminStats: () => request('/admin/stats'),
  adminAudit: () => request('/admin/audit'),

  listLessons: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null),
    ).toString()
    return request(`/admin/lessons${qs ? `?${qs}` : ''}`)
  },
  getLesson: (id) => request(`/admin/lessons/${encodeURIComponent(id)}`),
  createLesson: (data) => request('/admin/lessons', { method: 'POST', body: data }),
  updateLesson: (id, data) => request(`/admin/lessons/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
  setLessonStatus: (id, status) =>
    request(`/admin/lessons/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } }),
  deleteLesson: (id) => request(`/admin/lessons/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  importLessons: (lessons, overwrite) =>
    request('/admin/lessons/import', { method: 'POST', body: { lessons, overwrite } }),
  exportLessons: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null),
    ).toString()
    return request(`/admin/lessons-export${qs ? `?${qs}` : ''}`)
  },

  listChapters: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null),
    ).toString()
    return request(`/admin/chapters${qs ? `?${qs}` : ''}`)
  },
  getChapter: (id) => request(`/admin/chapters/${encodeURIComponent(id)}`),
  createChapter: (data) => request('/admin/chapters', { method: 'POST', body: data }),
  updateChapter: (id, data) =>
    request(`/admin/chapters/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
  deleteChapter: (id) =>
    request(`/admin/chapters/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  reorderChapters: (items) =>
    request('/admin/chapters/reorder', { method: 'PATCH', body: { items } }),
  createOutline: (subjectId, grade, outline, dryRun = false) =>
    request('/admin/chapters/outline', {
      method: 'POST',
      body: { subjectId, grade, outline, dryRun },
    }),

  listSubjects: () => request('/admin/subjects'),
  createSubject: (data) => request('/admin/subjects', { method: 'POST', body: data }),
  updateSubject: (id, data) => request(`/admin/subjects/${encodeURIComponent(id)}`, { method: 'PUT', body: data }),
  deleteSubject: (id) => request(`/admin/subjects/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
