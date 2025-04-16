import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './authSlice'
import instrumentsReducer from './instrumentsSlice'
import { combineReducers } from '@reduxjs/toolkit'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'] // Solo persistir el auth
}

const rootReducer = combineReducers({
  auth: authReducer,
  instruments: instrumentsReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
})

export const persistor = persistStore(store)