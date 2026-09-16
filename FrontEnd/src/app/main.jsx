import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AccountProvider } from '../features/accounts/AccountContext.jsx'

createRoot(document.getElementById('root')).render(
  <AccountProvider>

  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
  </AccountProvider>
)
