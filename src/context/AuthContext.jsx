import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client.js'

const AuthContext = createContext(null)

/** Trang mac dinh sau khi dang nhap, tuy vai tro. */
export const HOME_BY_ROLE = {
  admin: '/admin/dashboard',
  teacher: '/giao-vien',
  student: '/lop-hoc',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await api.me()
      setUser(data.user ?? null)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const login = useCallback(async (username, password) => {
    const data = await api.login(username, password)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    // Server dang nhap luon sau khi tao tai khoan nen khong can goi login nua
    const data = await api.register(payload)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    await api.changePassword(currentPassword, newPassword)
    // Server huy moi phien sau khi doi mat khau -> trang thai client phai theo
    setUser(null)
  }, [])

  const value = useMemo(() => {
    const role = user?.role ?? null
    return {
      user,
      role,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: role === 'admin',
      isTeacher: role === 'teacher',
      isStudent: role === 'student',
      hasRole: (...roles) => Boolean(role) && roles.includes(role),
      homePath: role ? (HOME_BY_ROLE[role] ?? '/') : '/',
      login,
      register,
      logout,
      changePassword,
      refresh,
    }
  }, [user, loading, login, register, logout, changePassword, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phai duoc dung ben trong <AuthProvider>')
  return ctx
}
