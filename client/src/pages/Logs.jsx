import { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/Logs.css'

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/logs', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLogs(response.data)
    } catch (error) {
      console.error('Eroare la încărcarea log-urilor:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.action === filter)

  const actionColors = {
    kick: '#ff6b6b',
    ban: '#ff0000',
    mute: '#ffa500',
    warn: '#ffeb3b',
    give: '#4caf50'
  }

  if (loading) {
    return <div className="logs-container"><p>Se încarcă log-urile...</p></div>
  }

  return (
    <div className="logs-container">
      <h1>Log-uri Acțiuni</h1>

      <div className="filter-section">
        <label>Filtrare acțiuni:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Toate acțiunile</option>
          <option value="kick">Kick</option>
          <option value="ban">Ban</option>
          <option value="mute">Mute</option>
          <option value="warn">Avertisment</option>
          <option value="give">Dă bani</option>
        </select>
      </div>

      <div className="logs-list">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log, index) => (
            <div key={index} className="log-item" style={{ borderLeftColor: actionColors[log.action] }}>
              <div className="log-header">
                <span className="log-action" style={{ backgroundColor: actionColors[log.action] }}>
                  {log.action.toUpperCase()}
                </span>
                <span className="log-date">
                  {new Date(log.created_at).toLocaleString('ro-RO')}
                </span>
              </div>
              <div className="log-details">
                <p><strong>Admin ID:</strong> {log.admin_id || 'N/A'}</p>
                <p><strong>Jucător ID:</strong> {log.player_id || 'N/A'}</p>
                <p><strong>Motiv:</strong> {log.reason || 'Fără motiv'}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-logs">Nu s-au găsit log-uri</div>
        )}
      </div>
    </div>
  )
}
