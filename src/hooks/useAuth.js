import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import axios from 'axios'

export const useAuth = () => {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)

  // Auto-login con token almacenado
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const res = await axios.get('http://localhost:8000/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(setCredentials({ user: res.data, token }))
      } catch (err) {
        console.error('Token verification failed:', err)
        dispatch(logout())
      }
    }
    if (token) verifyToken()
  }, [])

  const login = async (email, password) => {
    // ... (implementación similar al componente Login)
  }

  const register = async (email, password) => {
    // ... (implementación de registro)
  }

  return { login, register, logout }
}