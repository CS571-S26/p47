import { Route, Routes } from 'react-router-dom'
import { useEffect, useState } from 'react'
import NavBar from './components/NavBar.jsx'
import MapsPage from './pages/MapsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import TimelinePage from './pages/TimelinePage.jsx'
import AddConcertPage from './pages/AddConcertPage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import { AuthProvider } from './contexts/AuthProvider.jsx'
import ConcertDetailPage from './pages/ConcertDetailPage.jsx'
import { ConcertsProvider } from './contexts/ConcertsProvider.jsx'
import { useAuth } from './contexts/authContext.js'

import './App.css'

function AppShell({ theme, setTheme }) {
  const { user } = useAuth()
  const concertsKey = user?.uid ?? 'guest'

  return (
    <ConcertsProvider key={concertsKey}>
      <NavBar theme={theme} setTheme={setTheme} />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<TimelinePage />} />
          <Route path="/maps" element={<MapsPage theme={theme} />} />
          <Route path="/add-concert" element={<AddConcertPage />} />
          <Route path="/concerts/:id" element={<ConcertDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
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
      <AppShell theme={theme} setTheme={setTheme} />
    </AuthProvider>
  )
}

export default App
