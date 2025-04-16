import { createSlice } from "@reduxjs/toolkit";

const instrumentsSlice = createSlice({
  name: "instruments",
  initialState: {
    list: [],
    favorites: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    lastUpdated: null,
    searchTerm: "",
    error: null,
  },
  reducers: {
    setInstruments: (state, action) => {
      state.list = action.payload;
      state.lastUpdated = new Date().toISOString();
      state.status = "succeeded";
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
    },
    toggleFavorite: (state, action) => {
      const symbol = action.payload;
      const index = state.favorites.indexOf(symbol);
      if (index >= 0) {
        // Remove from favorites
        state.favorites.splice(index, 1);
      } else {
        // Add to favorites
        state.favorites.push(symbol);
      }
    },
    updateInstrument: (state, action) => {
      const updatedInstrument = action.payload;
      const index = state.list.findIndex(
        (i) => i.symbol === updatedInstrument.symbol
      );
      if (index >= 0) {
        state.list[index] = { ...state.list[index], ...updatedInstrument };
      }
      state.lastUpdated = new Date().toISOString();
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.status = "failed";
    },
    resetInstruments: (state) => {
      state.list = [];
      state.favorites = [];
      state.status = "idle";
      state.lastUpdated = null;
      state.error = null;
    },
  },
});

// Exportamos las acciones
export const {
  setInstruments,
  setFavorites,
  toggleFavorite,
  updateInstrument,
  setSearchTerm,
  setStatus,
  setError,
  resetInstruments,
} = instrumentsSlice.actions;

// Selectores útiles
export const selectAllInstruments = (state) => state.instruments.list;
export const selectFavorites = (state) => state.instruments.favorites;
export const selectFilteredInstruments = (state) => {
  const { list, searchTerm } = state.instruments;

  // Si no hay término de búsqueda o la lista está vacía
  if (!searchTerm || !list || list.length === 0) return list;

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  return list.filter((instrument) => {
    // Verificar que el instrumento y sus propiedades existan
    if (!instrument) return false;

    const symbolMatch =
      instrument.symbol?.toLowerCase().includes(lowerCaseSearchTerm) || false;
    const nameMatch =
      instrument.name?.toLowerCase().includes(lowerCaseSearchTerm) || false;

    return symbolMatch || nameMatch;
  });
};
export const selectInstrumentBySymbol = (state, symbol) =>
  state.instruments.list.find((i) => i.symbol === symbol);
export const selectStatus = (state) => state.instruments.status;
export const selectLastUpdated = (state) => state.instruments.lastUpdated;
export const selectError = (state) => state.instruments.error;

export default instrumentsSlice.reducer;
