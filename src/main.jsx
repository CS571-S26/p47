import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'leaflet/dist/leaflet.css'
import './leaflet-overrides.css'

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>
)
