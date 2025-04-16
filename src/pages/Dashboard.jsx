// src/pages/Dashboard.jsx (versión final)
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setInstruments, setFavorites } from "../store/instrumentsSlice";
import InstrumentCard from "../components/InstrumentCard";
import axios from "axios";
import LoadingSpinner from "../components/LoadingSpinner";

const API = "http://127.0.0.1:8000";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { list: instruments, favorites } = useSelector(
    (state) => state.instruments
  );
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        await fetchPublicData();

        if (token) {
          try {
            await fetchPrivateData();
          } catch (err) {
            console.error("Error loading favorites:", err);
            // Opcional: puedes mostrar un mensaje al usuario
          }
        }
      } catch (err) {
        setError("Error al cargar datos. Intente recargar la página.");
      } finally {
        setLoading(false);
      }
    };

    // Solo cargar datos si no estamos en estado de rehidratación
    if (!isAuthLoading) {
      loadData();
      const interval = setInterval(fetchPublicData, 300000);
      return () => clearInterval(interval);
    }
  }, [token, dispatch, isAuthLoading]);

  // Función para cargar datos públicos (instrumentos)
  const fetchPublicData = async () => {
    try {
      const symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA"];
      const requests = symbols.map((symbol) =>
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
    }
  };

  // Función para cargar datos privados (favoritos)
  const fetchPrivateData = async () => {
    try {
      const favoritesRes = await axios.get(`${API}/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(setFavorites(favoritesRes.data.map((f) => f.symbol)));
    } catch (err) {
      console.error("Error fetching favorites:", err);
      // Si el error es 401 (no autorizado), podrías hacer logout
      if (err.response?.status === 401) {
        dispatch(logout());
      }
    }
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
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Resumen del Mercado
        </h1>

        {/* Sección de Favoritos (solo para usuarios logueados) */}
        {token && favorites.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Tus Favoritos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instruments
                .filter((instrument) => favorites.includes(instrument.symbol))
                .map((instrument) => (
                  <InstrumentCard
                    key={instrument.symbol}
                    instrument={instrument}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Todos los Instrumentos */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-700">
            Instrumentos Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instruments.map((instrument) => (
              <InstrumentCard
                key={instrument.symbol}
                instrument={instrument}
                showActions={!!token} // Mostrar acciones solo si está logueado
              />
            ))}
          </div>
        </div>

        {instruments.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No se encontraron instrumentos para mostrar
          </div>
        )}
      </div>
    </div>
  );
}
