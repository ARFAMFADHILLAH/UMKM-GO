import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { fetchMe, loginUser, logoutUser, registerUser, tokenStore } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    if (!tokenStore.get()) {
      setBooting(false)
      return
    }
    fetchMe()
      .then((res) => setUser(res.data))
      .catch(() => tokenStore.clear())
      .finally(() => setBooting(false))

    const onUnauthorized = () => setUser(null)
    window.addEventListener('lokalink:unauthorized', onUnauthorized)
    return () => window.removeEventListener('lokalink:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (payload) => {
    const res = await loginUser(payload)
    tokenStore.set(res.access_token)
    setUser(res.data)
    return res
  }, [])

  const register = useCallback(async (payload) => {
    const res = await registerUser(payload)
    tokenStore.set(res.access_token)
    setUser(res.data)
    return res
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } catch {
      // token mungkin sudah invalid; tetap bersihkan lokal
    }
    tokenStore.clear()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, booting, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}