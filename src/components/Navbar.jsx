import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'

export default function Navbar() {
  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Trading Platform</Link>
        
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Hola, {user.email}</span>
            <button 
              onClick={() => dispatch(logout())}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white">Login</Link>
            <Link to="/register" className="text-gray-300 hover:text-white">Register</Link>
          </div>
        )}
      </div>
    </nav>
  )
}