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

  // Determinar si es favorito
  const internalIsFavorite = useSelector(state => 
    state.instruments.favorites.includes(instrument.symbol)
  )
  const isFavorite = propIsFavorite !== undefined ? propIsFavorite : internalIsFavorite

  // Manejar formato de precios y cambios
  const formatPrice = (price) => {
    if (!price) return 'N/A'
    return parseFloat(price).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatChange = (change, percent) => {
    if (!change || !percent) return 'N/A'
    
    const isPositive = parseFloat(change) >= 0
    const changeSymbol = isPositive ? '+' : ''
    
    return (
      <span className={`${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {changeSymbol}{parseFloat(change).toFixed(2)} ({percent})
      </span>
    )
  }

  const handleFavorite = async (e) => {
    e?.stopPropagation()
    if (!token || isUpdating) return
    
    setIsUpdating(true)
    setError('')

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

      // Usamos el método adecuado según si es favorito o no
      if (isFavorite) {
        await axios.delete(
          `http://localhost:8000/favorites/${instrument.symbol}`,
          config
        )
      } else {
        await axios.post(
          'http://localhost:8000/favorites', 
          { symbol: instrument.symbol },
          config
        )
      }

      // Actualizamos el estado local
      if (propOnToggleFavorite) {
        propOnToggleFavorite(instrument.symbol)
      } else {
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
        <p className="text-gray-600">{instrument.name || 'Nombre no disponible'}</p>
        <p className="text-lg font-medium">
          {formatPrice(instrument.price || instrument.close || instrument['05. price'])}
        </p>
        <p className="text-sm">
          {formatChange(
            instrument.change || instrument['09. change'],
            instrument.change_percent || instrument['10. change percent']
          )}
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