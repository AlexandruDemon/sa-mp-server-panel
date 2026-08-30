import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Logs from './pages/Logs'
import ServerInfo from './pages/ServerInfo'
import Navigation from './components/Navigation'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))
  const [adminLevel, setAdminLevel] = useState(localStorage.getItem('adminLevel') || 1)

  const handleLogin = (token, level) => {
    localStorage.setItem('token', token)
    localStorage.setItem('adminLevel', level)
    setIsAuthenticated(true)
    setAdminLevel(level)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminLevel')
    setIsAuthenticated(false)
  }

  return (
    <Router>
      {isAuthenticated && <Navigation onLogout={handleLogout} />}
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/" /> : 
            <LoginPage onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/players" 
          element={isAuthenticated ? <Players adminLevel={adminLevel} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/logs" 
          element={isAuthenticated ? <Logs /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/server-info" 
          element={isAuthenticated ? <ServerInfo /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  )
}

export default App
