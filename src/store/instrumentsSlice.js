import { createSlice } from '@reduxjs/toolkit'

const instrumentsSlice = createSlice({
  name: 'instruments',
  initialState: {
    list: [],
    favorites: [],
    status: 'idle'
  },
  reducers: {
    setInstruments: (state, action) => {
      state.list = action.payload
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload
    },
    updatePrice: (state, action) => {
      const { symbol, price } = action.payload
      const instrument = state.list.find(i => i.symbol === symbol)
      if (instrument) instrument.price = price
    }
  }
})

export const { setInstruments, setFavorites, updatePrice } = instrumentsSlice.actions
export default instrumentsSlice.reducer