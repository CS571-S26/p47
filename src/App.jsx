import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import MapsPage from './pages/MapsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import TimelinePage from './pages/TimelinePage.jsx'
import AddConcertPage from './pages/AddConcertPage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'
import ConcertDetailPage from './pages/ConcertDetailPage.jsx'
import { ConcertsProvider } from './contexts/ConcertsProvider.jsx'
import './App.css'

function App() {
  return (
    <ConcertsProvider>
      <NavBar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<TimelinePage />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/add-concert" element={<AddConcertPage />} />
          <Route path="/concerts/:id" element={<ConcertDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />
        </Routes>
      </main>
    </ConcertsProvider>
  )
}

export default App
