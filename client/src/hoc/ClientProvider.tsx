'use client'

import store from '@/store/store'
import React, { ReactNode} from 'react'
import { Provider } from 'react-redux'
import persistStore from 'redux-persist/es/persistStore'
import { PersistGate } from 'redux-persist/integration/react'

const persistor = persistStore(store)

const ClientProviders = ({children}: {children:ReactNode}) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  )
}

export default ClientProviders