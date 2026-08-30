import { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/ServerInfo.css'

export default function ServerInfo() {
  const [serverInfo, setServerInfo] = useState(null)
  const [commands, setCommands] = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serverRes, commandsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/server/info', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/commands', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])

        setServerInfo(serverRes.data)
        setCommands(commandsRes.data)
      } catch (error) {
        console.error('Eroare la încărcarea informațiilor:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token])

  if (loading) {
    return <div className="server-info-container"><p>Se încarcă...</p></div>
  }

  return (
    <div className="server-info-container">
      <h1>Informații Server</h1>

      <div className="server-details">
        <h2>Detalii Server</h2>
        {serverInfo ? (
          <div className="info-grid">
            <div className="info-card">
              <h3>Nume Server</h3>
              <p>{serverInfo.server_name || 'N/A'}</p>
            </div>
            <div className="info-card">
              <h3>Gamemode</h3>
              <p>{serverInfo.gamemode || 'N/A'}</p>
            </div>
            <div className="info-card">
              <h3>Limba</h3>
              <p>{serverInfo.language || 'N/A'}</p>
            </div>
            <div className="info-card">
              <h3>Status</h3>
              <p className={`status ${serverInfo.status}`}>{serverInfo.status || 'N/A'}</p>
            </div>
            <div className="info-card">
              <h3>Max Jucători</h3>
              <p>{serverInfo.max_players || 'N/A'}</p>
            </div>
            <div className="info-card">
              <h3>Jucători Curenti</h3>
              <p>{serverInfo.current_players || 0}</p>
            </div>
          </div>
        ) : (
          <p>Nu au fost găsite informații</p>
        )}
      </div>

      <div className="commands-section">
        <h2>Comenzi Disponibile</h2>
        <table className="commands-table">
          <thead>
            <tr>
              <th>Comanda</th>
              <th>Descriere</th>
              <th>Utilizare</th>
              <th>Level Admin</th>
            </tr>
          </thead>
          <tbody>
            {commands.map((cmd) => (
              <tr key={cmd.id}>
                <td><code>{cmd.name}</code></td>
                <td>{cmd.description}</td>
                <td><code>{cmd.usage}</code></td>
                <td><span className="level-badge">Level {cmd.admin_level}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
