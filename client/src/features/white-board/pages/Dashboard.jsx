import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { getBoards, createBoard } from '../services/board.api'
import '../Dashboard.css'

const Dashboard = () => {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [creating, setCreating] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    async function fetchBoards() {
      try {
        const data = await getBoards()
        setBoards(data)
      } catch (err) {
        setError('Could not load your boards. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchBoards()
  }, [])

  const handleNewBoard = async () => {
    try {
      setCreating(true)
      const board = await createBoard('Untitled Board')
      navigate(`/board/${board._id}`)
    } catch (err) {
      setError('Could not create a new board. Please try again.')
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <main className="dashboard-container">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading your boards...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="dashboard-container">
        <div className="error-banner">{error}</div>
        <button className="button primary-button" onClick={handleNewBoard} disabled={creating}>
          {creating ? 'Creating...' : 'New Board'}
        </button>
      </main>
    )
  }

  return (
    <main className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Your Boards</h1>
          <p className="subtitle">
            {boards.length} board{boards.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="button primary-button" onClick={handleNewBoard} disabled={creating}>
          {creating ? 'Creating...' : 'New Board'}
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="empty-state-wrap">
          <div className="empty-state-icon">＋</div>
          <p className="empty-state">No boards yet — create your first one.</p>
          <button className="button primary-button" onClick={handleNewBoard} disabled={creating}>
            {creating ? 'Creating...' : 'New Board'}
          </button>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map((board) => (
            <div
              key={board._id}
              className="board-card"
              onClick={() => navigate(`/board/${board._id}`)}
            >
              <div className="board-card-thumb" />
              <div className="board-card-body">
                <h3>{board.title}</h3>
                <p>Edited {new Date(board.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default Dashboard