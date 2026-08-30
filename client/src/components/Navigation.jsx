import { Link, useNavigate } from 'react-router-dom'
import '../styles/Navigation.css'

export default function Navigation({ onLogout }) {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Admin'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('adminLevel')
    localStorage.removeItem('username')
    onLogout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎮 SA-MP Admin Panel
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/players" className="nav-link">Jucători</Link>
          </li>
          <li className="nav-item">
            <Link to="/server-info" className="nav-link">Server Info</Link>
          </li>
          <li className="nav-item">
            <Link to="/logs" className="nav-link">Log-uri</Link>
          </li>
        </ul>

        <div className="nav-user">
          <span className="username">👤 {username}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Deconectare
          </button>
        </div>
      </div>
    </nav>
  )
}
