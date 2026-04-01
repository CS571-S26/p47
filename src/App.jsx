import { Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import MapsPage from './pages/MapsPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import TimelinePage from './pages/TimelinePage.jsx'
import AddConcertPage from './pages/TimelinePage.jsx'
import './App.css'

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<TimelinePage />} />
        <Route path="/maps" element={<MapsPage />} />
        <Route path="/add-concert" element={<AddConcertPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </>
  )
}

export default App
