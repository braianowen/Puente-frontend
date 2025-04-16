import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HeartIcon } from '@heroicons/react/24/solid'
import { setFavorites } from '../store/instrumentsSlice'
import axios from 'axios'
import LoadingSpinner from './LoadingSpinner'

export default function InstrumentCard({ instrument, showActions = true }) {
  const dispatch = useDispatch()
  const { favorites } = useSelector(state => state.instruments)
  const { token } = useSelector(state => state.auth)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  const isFavorite = favorites.includes(instrument.symbol)

  const handleFavorite = async () => {
    if (!token || isUpdating) return
    
    setIsUpdating(true)
    setError('')

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      if (isFavorite) {
        await axios.delete(`http://localhost:8000/favorites/${instrument.symbol}`, config)
        dispatch(setFavorites(favorites.filter(s => s !== instrument.symbol)))
      } else {
        await axios.post('http://localhost:8000/favorites', { symbol: instrument.symbol }, config)
        dispatch(setFavorites([...favorites, instrument.symbol]))
      }
    } catch (err) {
      setError('Error al actualizar favoritos. Intente nuevamente.')
      console.error('Error actualizando favoritos:', err.response?.data || err.message)
      dispatch(setFavorites(favorites)) // Revertir cambios
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow relative">
      {showActions && (
        <button 
          onClick={handleFavorite}
          className="absolute top-4 right-4 hover:text-red-500 transition-colors disabled:opacity-50"
          title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          disabled={isUpdating}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          {isUpdating ? (
            <LoadingSpinner size="small" />
          ) : (
            <HeartIcon className={`w-6 h-6 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          )}
        </button>
      )}
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{instrument.symbol}</h3>
        <p className="text-gray-600">Precio: ${instrument.price}</p>
        <p className={`text-sm ${instrument.change_percent?.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {instrument.change} ({instrument.change_percent})
        </p>
      </div>

      {!showActions && (
        <div className="mt-4 text-sm text-blue-500">
          <button 
            onClick={() => window.location = '/login'}
            className="hover:underline"
          >
            Inicia sesión
          </button> para agregar a favoritos
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-500 animate-fade-in">
          {error}
        </div>
      )}
    </div>
  )
}