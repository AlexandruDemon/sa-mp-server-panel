import { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const [serverInfo, setServerInfo] = useState(null)
  const [playersCount, setPlayersCount] = useState(0)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serverRes, playersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/server/info', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/players', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        setServerInfo(serverRes.data)
        setPlayersCount(playersRes.data.length)

        const bannedPlayers = playersRes.data.filter(p => p.banned).length
        const mutedPlayers = playersRes.data.filter(p => p.muted).length

        setStats({
          totalPlayers: playersRes.data.length,
          banned: bannedPlayers,
          muted: mutedPlayers,
          online: playersRes.data.length
        })
      } catch (error) {
        console.error('Eroare la încărcarea datelor:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) {
    return <div className="dashboard-container"><p>Se încarcă...</p></div>
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Jucători Online</h3>
          <p className="stat-value">{stats.online}</p>
        </div>
        
        <div className="stat-card">
          <h3>Jucători Batuți</h3>
          <p className="stat-value">{stats.banned}</p>
        </div>
        
        <div className="stat-card">
          <h3>Jucători Pe Mute</h3>
          <p className="stat-value">{stats.muted}</p>
        </div>

        <div className="stat-card">
          <h3>Total Jucători</h3>
          <p className="stat-value">{stats.totalPlayers}</p>
        </div>
      </div>

      <div className="server-info-section">
        <h2>Informații Server</h2>
        {serverInfo ? (
          <div className="info-grid">
            <div className="info-item">
              <label>Nume Server:</label>
              <p>{serverInfo.server_name || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Gamemode:</label>
              <p>{serverInfo.gamemode || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Limba:</label>
              <p>{serverInfo.language || 'N/A'}</p>
            </div>
            <div className="info-item">
              <label>Status:</label>
              <p className={`status ${serverInfo.status}`}>{serverInfo.status || 'N/A'}</p>
            </div>
          </div>
        ) : (
          <p>Nu au fost găsite informații despre server</p>
        )}
      </div>
    </div>
  )
}
