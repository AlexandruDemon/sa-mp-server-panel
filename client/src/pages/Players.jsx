import { useEffect, useState } from 'react'
import axios from 'axios'
import PlayerActionsModal from '../components/PlayerActionsModal'
import '../styles/Players.css'

export default function Players({ adminLevel }) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/players', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPlayers(response.data)
    } catch (error) {
      console.error('Eroare la încărcarea jucătorilor:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPlayers = players.filter(player =>
    player.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.account_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return <div className="players-container"><p>Se încarcă jucătorii...</p></div>
  }

  return (
    <div className="players-container">
      <h1>Gestionare Jucători</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Caută după nick sau account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="players-table-wrapper">
        <table className="players-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nick</th>
              <th>Account</th>
              <th>IP Address</th>
              <th>Status</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <tr key={player.id} className={player.banned ? 'banned' : ''}>
                  <td>{player.id}</td>
                  <td>{player.nickname}</td>
                  <td>{player.account_name || '-'}</td>
                  <td>{player.ip_address || '-'}</td>
                  <td>
                    {player.banned && <span className="badge banned">Banat</span>}
                    {player.muted && <span className="badge muted">Mute</span>}
                    {!player.banned && !player.muted && <span className="badge online">Online</span>}
                  </td>
                  <td>
                    <button
                      className="btn-actions"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      Acțiuni
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-players">Nu s-au găsit jucători</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedPlayer && (
        <PlayerActionsModal
          player={selectedPlayer}
          adminLevel={adminLevel}
          onClose={() => setSelectedPlayer(null)}
          onActionComplete={() => {
            setSelectedPlayer(null)
            fetchPlayers()
          }}
          token={token}
        />
      )}
    </div>
  )
}
