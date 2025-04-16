// src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../store/authSlice'
import axios from 'axios'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Registrar usuario
      await axios.post('http://localhost:8000/register', {
        email,
        password
      })

      // Auto-login después del registro
      const loginRes = await axios.post('http://localhost:8000/login', 
        `username=${email}&password=${password}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )

      dispatch(setCredentials({
        user: { email },
        token: loginRes.data.access_token
      }))
      
      navigate('/')
    } catch (err) {
      if (err.response) {
        setError(err.response.data.detail || 'Error en el registro')
      } else {
        setError('Error de conexión con el servidor')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Registro de Usuario</h2>
        
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            minLength="6"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Registrando...' : 'Registrarme'}
        </button>

        <p className="mt-4 text-center text-gray-600">
          ¿Ya tienes cuenta? {' '}
          <Link to="/login" className="text-blue-500 hover:underline">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  )
}