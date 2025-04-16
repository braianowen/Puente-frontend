import { createSlice } from '@reduxjs/toolkit'

const initialState = { 
  user: null, 
  token: null,
  isLoading: true // Para manejar la rehidratación
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
    },
    rehydrate: (state, action) => {
      if (action.payload?.token) {
        state.token = action.payload.token
      }
      state.isLoading = false
    }
  }
})

// Acción para rehidratar desde localStorage
export const rehydrateAuth = () => (dispatch) => {
  const token = localStorage.getItem('token')
  if (token) {
    dispatch(authSlice.actions.rehydrate({ token }))
  }
}

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer