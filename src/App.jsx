import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import NavBar from './components/NavBar.jsx'
import MapsPage from './pages/MapsPage.jsx'
import TimelinePage from './pages/TimelinePage.jsx'
import AddConcertPage from './pages/AddConcertPage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { AuthProvider } from './contexts/AuthProvider.jsx'
import { SpotifyProvider } from './contexts/SpotifyProvider.jsx'
import ConcertDetailPage from './pages/ConcertDetailPage.jsx'
import EditConcertPage from './pages/EditConcertPage.jsx'
import { ConcertsProvider } from './contexts/ConcertsProvider.jsx'
import { useAuth } from './contexts/authContext.js'

import './App.css'

function documentTitleForPath(pathname) {
  const base = 'SetLog'
  if (pathname === '/') return `${base} — Timeline`
  if (pathname === '/maps') return `${base} — Map`
  if (pathname === '/add-concert') return `${base} — Log concert`
  if (pathname === '/user-profile') return `${base} — Profile`
  if (pathname === '/login') return `${base} — Log in`
  if (pathname === '/register') return `${base} — Register`
  if (pathname.startsWith('/concerts/') && pathname.endsWith('/edit')) {
    return `${base} — Edit concert`
  }
  if (pathname.startsWith('/concerts/')) return `${base} — Concert`
  return base
}

function AppShell({ theme, setTheme }) {
  const { user } = useAuth()
  const concertsKey = user?.uid ?? 'guest'
  const location = useLocation()

  useEffect(() => {
    document.title = documentTitleForPath(location.pathname)
  }, [location.pathname])

  return (
    <ConcertsProvider key={concertsKey}>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <NavBar theme={theme} setTheme={setTheme} />
      <main id="main-content" className="app-main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<TimelinePage />} />
          <Route path="/maps" element={<MapsPage theme={theme} />} />
          <Route path="/add-concert" element={<AddConcertPage />} />
          <Route path="/concerts/:id/edit" element={<EditConcertPage />} />
          <Route path="/concerts/:id" element={<ConcertDetailPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
    </ConcertsProvider>
  )
}

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <AuthProvider>
      <SpotifyProvider>
        <AppShell theme={theme} setTheme={setTheme} />
      </SpotifyProvider>
    </AuthProvider>
  )
}

export default App
