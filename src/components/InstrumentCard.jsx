import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { HeartIcon } from '@heroicons/react/24/solid'
import { toggleFavorite } from '../store/instrumentsSlice'
import axios from 'axios'
import LoadingSpinner from './LoadingSpinner'

export default function InstrumentCard({ 
  instrument, 
  showActions = true,
  onClick,
  isFavorite: propIsFavorite,
  onToggleFavorite: propOnToggleFavorite
}) {
  const dispatch = useDispatch()
  const { token } = useSelector(state => state.auth)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState('')

  // Determinar si es favorito (puede venir por props o del store)
  const internalIsFavorite = useSelector(state => 
    state.instruments.favorites.includes(instrument.symbol)
  )
  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : internalIsFavorite

  const handleFavorite = async (e) => {
    e?.stopPropagation() // Evitar propagación si viene de un click
    
    if (!token || isUpdating) return
    
    setIsUpdating(true)
    setError('')

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      // Llamada API para actualizar favoritos en backend
      await axios.post(
        'http://localhost:8000/favorites/toggle', 
        { symbol: instrument.symbol },
        config
      )

      // Si el componente recibe el handler por props, usarlo
      if (propOnToggleFavorite) {
        propOnToggleFavorite(instrument.symbol)
      } else {
        // Si no, usar el dispatch directo
        dispatch(toggleFavorite(instrument.symbol))
      }
      
    } catch (err) {
      setError('Error al actualizar favoritos. Intente nuevamente.')
      console.error('Error actualizando favoritos:', err.response?.data || err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div 
      className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow relative cursor-pointer"
      onClick={handleCardClick}
    >
      {showActions && token && (
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
        <p className="text-gray-600">{instrument.name}</p>
        <p className="text-lg font-medium">${instrument.price}</p>
        <p className={`text-sm ${instrument.change_percent?.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
          {instrument.change} ({instrument.change_percent})
        </p>
      </div>

      {!token && showActions && (
        <div className="mt-4 text-sm text-blue-500">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              window.location = '/login'
            }}
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