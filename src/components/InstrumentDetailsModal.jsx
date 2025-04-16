const InstrumentDetailsModal = ({ instrument, isFavorite, onToggleFavorite, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {instrument.name} ({instrument.symbol})
              </h2>
              <p className="text-gray-600">{instrument.type}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Precio</h3>
              <p className="text-3xl font-bold">
                {instrument.price}
                <span className={`ml-2 text-sm ${instrument.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {instrument.change >= 0 ? '+' : ''}{instrument.change} ({instrument.changePercent}%)
                </span>
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {new Date(instrument.lastUpdated).toLocaleString()}
              </p>
            </div>
  
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Rango del día</h3>
              <div className="space-y-1">
                <p><span className="text-gray-600">Máximo:</span> {instrument.dayHigh}</p>
                <p><span className="text-gray-600">Mínimo:</span> {instrument.dayLow}</p>
                <p><span className="text-gray-600">Apertura:</span> {instrument.open}</p>
                <p><span className="text-gray-600">Cierre previo:</span> {instrument.previousClose}</p>
              </div>
            </div>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Volumen</h3>
              <p className="text-xl font-semibold">{instrument.volume}</p>
              <p className="text-gray-500 text-sm mt-1">Operaciones recientes</p>
            </div>
  
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Rango anual</h3>
              <p><span className="text-gray-600">Máximo:</span> {instrument.yearHigh}</p>
              <p><span className="text-gray-600">Mínimo:</span> {instrument.yearLow}</p>
            </div>
          </div>
  
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onToggleFavorite(instrument.symbol)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isFavorite ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
            >
              {isFavorite ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Quitar de favoritos
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Añadir a favoritos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  export default InstrumentDetailsModal;