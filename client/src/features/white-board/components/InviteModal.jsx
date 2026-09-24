import { useRef, useEffect, useState} from 'react'
import { sendInvite } from '../services/invite.api'
import '../Invitemodal.css'


/**
 * @name InviteModal
 * @description Lets a board owner invite a collaborator by email.
 * @param {string} boardId - the board this invite is for
 * @param {boolean} isOpen - whether the modal is visible
 * @param {() => void} onClose - called to close the modal (backdrop click, cancel, or after success)
 */
const InviteModal = ({ boardId, isOpen, onClose }) => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'sending' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('sending')
    setErrorMessage('')

    try {
      await sendInvite(boardId, email.trim())
      setStatus('success')
      setEmail('')
      setTimeout(() => {
        setStatus('idle')
        onClose()
      }, 1200)
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err.response?.data?.message || 'Could not send the invite. Please try again.'
      )
    }
  }

  const handleClose = () => {
    if (status === 'sending') return // don't let the modal close mid-request
    setEmail('')
    setStatus('idle')
    setErrorMessage('')
    onClose()
  }

  return (
    <div>
      <div
        className="invite-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="invite-modal-header">
          <h2 id="invite-modal-title">Invite a collaborator</h2>
          <button
            className="invite-modal-close"
            onClick={handleClose}
            aria-label="Close"
            disabled={status === 'sending'}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="invite-modal-form">
          <label htmlFor="invite-email">Email address</label>
          <input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teammate@example.com"
            autoFocus
            required
            disabled={status === 'sending' || status === 'success'}
          />

          {status === 'error' && (
            <p className="invite-modal-message error" role="alert">
              {errorMessage}
            </p>
          )}
          {status === 'success' && (
            <p className="invite-modal-message success" role="status">
              Invite sent.
            </p>
          )}

          <div className="invite-modal-actions">
            <button
              type="button"
              className="button"
              onClick={handleClose}
              disabled={status === 'sending'}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button primary-button"
              disabled={status === 'sending' || status === 'success'}
            >
              {status === 'sending' ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>     
    </div>
  )
}

export default InviteModal
