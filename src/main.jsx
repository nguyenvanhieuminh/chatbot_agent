import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { ProgressProvider } from './context/ProgressContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ContentProvider } from './context/ContentContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ContentProvider>
          <ProgressProvider>
            {/* HashRouter: deep-link van hoat dong khi deploy tinh (GitHub Pages, o cung...) */}
            <HashRouter>
              <App />
            </HashRouter>
          </ProgressProvider>
        </ContentProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
