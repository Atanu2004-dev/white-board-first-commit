import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router'
import { getPendingInvites, respondToInvite } from '../services/invite.api'
import { useAuth } from '../../auth/hooks/useAuth'

const SOCKET_URL = 'http://localhost:3000'

const Notifications = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [invites, setInvites] = useState([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!user?.id) return undefined

    let isMounted = true
    const socket = io(SOCKET_URL)

    const loadInvites = async () => {
      const pendingInvites = await getPendingInvites()
      if (isMounted && Array.isArray(pendingInvites)) {
        setInvites(pendingInvites)
      }
    }

    const handleNewInvite = (invite) => {
      setInvites((currentInvites) => [invite, ...currentInvites])
    }

    socket.on('connect', () => {
      socket.emit('register-user', user.id)
    })
    socket.on('new-invite', handleNewInvite)
    loadInvites()

    return () => {
      isMounted = false
      socket.off('new-invite', handleNewInvite)
      socket.disconnect()
    }
  }, [user?.id])

  const handleResponse = async (invite, action) => {
    await respondToInvite(invite._id, action)
    setInvites((currentInvites) => currentInvites.filter((currentInvite) => currentInvite._id !== invite._id))

    if (action === 'accept') {
      const boardId = invite.board?._id || invite.board
      navigate(`/board/${boardId}`)
    }
  }

  return (
    <div className="notifications">
      <button
        className="button notification-button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={`Notifications${invites.length ? `, ${invites.length} pending invites` : ''}`}
        aria-expanded={isOpen}
      >
        Notifications
        {invites.length > 0 && <span className="notification-count">{invites.length}</span>}
      </button>

      {isOpen && (
        <div className="notification-panel" role="dialog" aria-label="Notifications">
          <h2>Notifications</h2>
          {invites.length === 0 ? (
            <p>No pending invites.</p>
          ) : (
            invites.map((invite) => (
              <div className="notification-item" key={invite._id}>
                <p>
                  {invite.invitedBy?.username || invite.invitedBy?.email || 'Someone'} invited you to{' '}
                  {invite.board?.title || 'a board'}.
                </p>
                <div className="notification-actions">
                  <button className="button primary-button" onClick={() => handleResponse(invite, 'accept')}>
                    Accept
                  </button>
                  <button className="button" onClick={() => handleResponse(invite, 'reject')}>
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Notifications
