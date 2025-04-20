import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registra los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const InstrumentDetailsModal = ({
  instrument,
  isFavorite,
  onToggleFavorite,
  onClose,
}) => {
  const getFieldValue = (instrument, fieldNames) => {
    for (const field of fieldNames) {
      if (instrument[field] !== undefined) {
        return instrument[field];
      }
    }
    return null;
  };

  // Función helper para manejar números de forma segura
  const safeNumber = (value, defaultValue = 0) => {
    if (value === null || value === undefined) return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Función para formatear números con decimales fijos
  const formatNumber = (value, decimals = 2, fallback = "N/A") => {
    const num = safeNumber(value, null);
    return num !== null ? num.toFixed(decimals) : fallback;
  };

  const price = getFieldValue(instrument, ["price", "05. price"]);
  const change = getFieldValue(instrument, ["change", "09. change"]);
  const changePercent = getFieldValue(instrument, [
    "change_percent",
    "10. change percent",
  ]);
  const open = getFieldValue(instrument, ["open", "02. open"]);
  const high = getFieldValue(instrument, ["high", "03. high", "high_24h"]);
  const low = getFieldValue(instrument, ["low", "04. low", "low_24h"]);
  const volume = getFieldValue(instrument, [
    "volume",
    "06. volume",
    "total_volume",
  ]);

  // Mueve todas las operaciones de datos dentro del componente
  const historicalData = instrument.historicalData?.daily || [];
  const latestDayData = historicalData[historicalData.length - 1] || {};
  const firstDayData = historicalData[0] || {};

  // Configuración del gráfico
  const chartData = {
    labels: historicalData.map((item) => item.date),
    datasets: [
      {
        label: "Precio de Cierre",
        data: historicalData.map((item) =>
          safeNumber(item.close || item.price)
        ),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value) {
            return `$${value}`;
          },
        },
      },
    },
  };

  // Cálculo de rangos (maneja casos donde no hay datos históricos)
  const yearlyHigh =
    historicalData.length > 0
      ? Math.max(
          ...historicalData.map((item) => safeNumber(item.high || item.price))
        )
      : null;

  const yearlyLow =
    historicalData.length > 0
      ? Math.min(
          ...historicalData.map((item) => safeNumber(item.low || item.price))
        )
      : null;

  // Calcula el cambio porcentual de forma segura
  const calculateChange = () => {
    // Primero intentar con datos de Alpha Vantage directos
    if (instrument.change && instrument.change_percent) {
      return {
        change: formatNumber(instrument.change),
        changePercent: instrument.change_percent,
      };
    }

    // Lógica original para datos históricos
    const close = safeNumber(latestDayData.close || instrument.price, null);
    const open = safeNumber(firstDayData.open, null);

    if (close === null || open === null || open === 0) {
      return { change: "N/A", changePercent: "N/A" };
    }

    const change = close - open;
    const changePercent = ((change / open) * 100).toFixed(2) + "%";

    return {
      change: formatNumber(change),
      changePercent,
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {instrument.name} ({instrument.symbol})
              </h2>
              <p className="text-gray-600 capitalize">
                {instrument.source?.toLowerCase() || ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Sección de gráfico */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">
              Rendimiento Histórico ({historicalData.length} días)
            </h3>
            {historicalData.length > 0 ? (
              <Line data={chartData} options={options} height={100} />
            ) : (
              <p className="text-gray-500 text-center py-4">
                Datos históricos no disponibles
              </p>
            )}
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Precio Actual */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">
                Precio Actual
              </h3>
              <p className="text-3xl font-bold">
                ${formatNumber(price, 2, "N/A")}
                {change && changePercent && (
                  <span
                    className={`ml-2 text-sm ${
                      changePercent.startsWith("-")
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {change.startsWith("-") ? change : `+${change}`} (
                    {changePercent})
                  </span>
                )}
              </p>
            </div>

            {/* Rango del Día */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">
                Rango del Día
              </h3>
              <div className="space-y-1">
                <p>
                  <span className="text-gray-600">Apertura:</span> $
                  {formatNumber(open)}
                </p>
                <p>
                  <span className="text-gray-600">Máximo:</span> $
                  {formatNumber(high)}
                </p>
                <p>
                  <span className="text-gray-600">Mínimo:</span> $
                  {formatNumber(low)}
                </p>
                <p>
                  <span className="text-gray-600">Volumen:</span>{" "}
                  {volume ? Number(volume).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>

            {/* Volumen y Capitalización */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">
                Volumen y Capitalización
              </h3>
              <div className="space-y-1">
                <p>
                  <span className="text-gray-600">Volumen (24h):</span>{" "}
                  {instrument.volume
                    ? Number(instrument.volume).toLocaleString()
                    : instrument.total_volume
                    ? Number(instrument.total_volume).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <span className="text-gray-600">Capitalización:</span>{" "}
                  {instrument.market_cap
                    ? `$${Number(instrument.market_cap).toLocaleString()}`
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Rango Histórico */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">
                Rango Histórico ({historicalData.length} días)
              </h3>
              <div className="space-y-1">
                <p>
                  <span className="text-gray-600">Máximo:</span> $
                  {formatNumber(yearlyHigh || instrument.yearHigh)}
                </p>
                <p>
                  <span className="text-gray-600">Mínimo:</span> $
                  {formatNumber(yearlyLow || instrument.yearLow)}
                </p>
                {firstDayData.open && latestDayData.close && (
                  <p>
                    <span className="text-gray-600">Variación:</span>{" "}
                    {changePercent}%
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Botón de favoritos */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onToggleFavorite(instrument.symbol)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isFavorite
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {isFavorite ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Quitar de favoritos
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
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
};

export default InstrumentDetailsModal;
