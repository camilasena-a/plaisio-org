import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { useThemeStore } from './store/useThemeStore.ts'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

// Aplicar tema na inicialização
const { isDark } = useThemeStore.getState();
if (isDark) {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
