import { useState } from 'react'
import axios from 'axios'
import '../styles/PlayerActionsModal.css'

export default function PlayerActionsModal({ player, adminLevel, onClose, onActionComplete, token }) {
  const [action, setAction] = useState('kick')
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('1')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAction = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const payload = {
        reason: reason || 'Fără motiv',
        duration: parseInt(duration)
      }

      await axios.post(
        `http://localhost:5000/api/players/${player.id}/${action}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setMessage(`✅ Jucătorul a fost ${action}at cu succes!`)
      setTimeout(() => {
        onActionComplete()
      }, 1500)
    } catch (error) {
      setMessage(`❌ Eroare: ${error.response?.data?.message || 'Acțiune nereușită'}` )
    } finally {
      setLoading(false)
    }
  }

  const canBan = adminLevel >= 2
  const canMute = adminLevel >= 1
  const canKick = adminLevel >= 1

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Acțiuni pentru {player.nickname}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleAction}>
          <div className="form-group">
            <label>Selectează acțiune:</label>
            <select value={action} onChange={(e) => setAction(e.target.value)}>
              {canKick && <option value="kick">Kick</option>}
              {canBan && <option value="ban">Ban</option>}
              {canMute && <option value="mute">Mute</option>}
            </select>
          </div>

          <div className="form-group">
            <label>Motiv:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Introdu motivul acțiunii (opțional)"
              rows="3"
            />
          </div>

          {(action === 'ban' || action === 'mute') && (
            <div className="form-group">
              <label>Durată ({action === 'ban' ? 'ore' : 'minute'}):</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
              />
            </div>
          )}

          {message && (
            <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Anulează
            </button>
            <button type="submit" className="btn-confirm" disabled={loading}>
              {loading ? 'Se procesează...' : 'Confirmă Acțiune'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
