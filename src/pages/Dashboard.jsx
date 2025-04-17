// src/pages/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setInstruments,
  setFavorites,
  toggleFavorite,
  setSearchTerm,
  selectFilteredInstruments,
  selectFavorites,
} from "../store/instrumentsSlice";
import InstrumentCard from "../components/InstrumentCard";
import InstrumentDetailsModal from "../components/InstrumentDetailsModal";
import LoadingSpinner from "../components/LoadingSpinner";
import SearchBar from "../components/SearchBar";
import { logout } from "../store/authSlice";
import axios from "axios";

const API = "http://127.0.0.1:8000";
const SYMBOLS = [
  // Acciones
  'AAPL',    // Apple
  'MSFT',    // Microsoft
  'GOOGL',   // Alphabet (Google)
  'AMZN',    // Amazon
  'TSLA',    // Tesla
  'META',    // Meta (Facebook)
  'NVDA',    // NVIDIA
  'V',       // Visa
  'WMT',     // Walmart
  'JPM',     // JPMorgan Chase

  // 5 Criptomonedas (formato correcto para Alpha Vantage)

  'BTC',
  'ETH',
  'XRP',
  'SOL',
  'ADA',
  // 5 Pares Forex (formato correcto)
  "EURUSD", // Euro/Dólar
  "GBPUSD", // Libra/Dólar
  "USDJPY", // Dólar/Yen Japonés
  "AUDUSD", // Dólar Australiano/Dólar
];

export default function Dashboard() {
  const dispatch = useDispatch();
  const instruments = useSelector(selectFilteredInstruments);
  const favorites = useSelector(selectFavorites);
  const searchTerm = useSelector((state) => state.instruments.searchTerm);
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función para cargar datos públicos (instrumentos)
  const fetchPublicData = useCallback(async () => {
    try {
      const requests = SYMBOLS.map((symbol) =>
        axios
          .get(`${API}/instruments/${symbol}`)
          .then((res) => res.data)
          .catch((err) => {
            console.error(`Error fetching ${symbol}:`, err);
            return null;
          })
      );

      const results = await Promise.all(requests);
      const validInstruments = results.filter((item) => item !== null);

      if (validInstruments.length > 0) {
        dispatch(setInstruments(validInstruments));
      } else {
        setError("No se pudieron cargar los datos del mercado");
      }
    } catch (err) {
      setError("Error al cargar datos del mercado");
      console.error("Error fetching instruments:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

  // Función para cargar datos privados (favoritos)
  const fetchPrivateData = useCallback(async () => {
    try {
      const favoritesRes = await axios.get(`${API}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(setFavorites(favoritesRes.data.map((f) => f.symbol)));
    } catch (err) {
      console.error("Error fetching favorites:", err);
      if (err.response?.status === 401) {
        dispatch(logout());
      }
    }
  }, [token, dispatch]);

  // Función para refrescar datos manualmente
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPublicData();
  };

  // Efecto principal para cargar datos
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        await fetchPublicData();
        if (token) await fetchPrivateData();
      } catch (err) {
        setError("Error al cargar datos. Intente recargar la página.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(fetchPublicData, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, [token, fetchPublicData, fetchPrivateData]);

  // Filtrar instrumentos basados en el término de búsqueda
  const filteredInstruments = instruments.filter((instrument) => {
    const matchesSearch =
      instrument.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instrument.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleToggleFavorite = (symbol) => {
    dispatch(toggleFavorite(symbol));
  };

  if (loading) {
    return <LoadingSpinner message="Cargando datos del mercado..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 p-4 rounded-lg max-w-md text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Resumen del Mercado
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isRefreshing ? (
              "Actualizando..."
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Actualizar
              </>
            )}
          </button>
        </div>

        <SearchBar
          value={searchTerm}
          onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        />

        {/* Sección de Favoritos */}
        {token && favorites.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-700">
                Tus Favoritos
              </h2>
              <span className="text-sm text-gray-500">
                {favorites.length} favoritos
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredInstruments
                .filter((instrument) => favorites.includes(instrument.symbol))
                .map((instrument) => (
                  <InstrumentCard
                    key={instrument.symbol}
                    instrument={instrument}
                    isFavorite={true}
                    onToggleFavorite={(symbol) =>
                      dispatch(toggleFavorite(symbol))
                    }
                    onClick={() => setSelectedInstrument(instrument)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Todos los Instrumentos */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              {searchTerm
                ? `Resultados para "${searchTerm}"`
                : "Instrumentos Principales"}
            </h2>
            <span className="text-sm text-gray-500">
              Mostrando {filteredInstruments.length} de {instruments.length}{" "}
              instrumentos
            </span>
          </div>

          {filteredInstruments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredInstruments.map((instrument) => (
                <InstrumentCard
                  key={instrument.symbol}
                  instrument={instrument}
                  isFavorite={favorites.includes(instrument.symbol)}
                  onToggleFavorite={(symbol) =>
                    dispatch(toggleFavorite(symbol))
                  }
                  onClick={() => setSelectedInstrument(instrument)}
                  showActions={!!token}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No se encontraron instrumentos que coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </div>

        {/* Modal de detalles del instrumento */}
        {selectedInstrument && (
          <InstrumentDetailsModal
            instrument={selectedInstrument}
            isFavorite={favorites.includes(selectedInstrument.symbol)}
            onToggleFavorite={handleToggleFavorite}
            onClose={() => setSelectedInstrument(null)}
          />
        )}
      </div>
    </div>
  );
}
