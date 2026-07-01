import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import api from '../services/api'

const COLORS = [
  '#fff740', '#ff7eb9', '#ff6b6b',
  '#7afcff', '#98fb98', '#dda0f7',
  '#ffa07a', '#b0e0e6',
]

const PIN_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6']
const ROTATIONS = [-3, -1, 2, -2, 1, 3, -1.5, 2.5]

function BoardCard({ board, onDelete, onClick, onRename, color, pinColor, rotation }) {
  const [hovered, setHovered] = useState(false)
  const [editing, setEditing] = useState(false)
  const [newName, setNewName] = useState(board.name)

  const handleRename = (e) => {
    e.stopPropagation()
    if (newName.trim() && newName !== board.name) {
      onRename(board.id, newName.trim())
    }
    setEditing(false)
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    setNewName(board.name)
    setEditing(true)
  }

  return (
    <div
      style={{
        position: 'relative',
        cursor: 'pointer',
        paddingTop: '24px',
        width: '200px',
        transform: hovered && !editing
          ? 'translateY(-8px) rotate(0deg)'
          : `rotate(${rotation}deg)`,
        transition: 'transform 0.25s ease, filter 0.25s ease',
        filter: hovered
          ? 'drop-shadow(0 16px 24px rgba(0,0,0,0.25))'
          : 'drop-shadow(4px 4px 8px rgba(0,0,0,0.15))'
      }}
      onClick={editing ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Pin */}
      <div style={styles.pin}>
        <div style={{ ...styles.pinHead, backgroundColor: pinColor, border: `2px solid ${pinColor}cc` }}></div>
        <div style={styles.pinNeedle}></div>
      </div>

      {/* Tape */}
      <div style={styles.tape}></div>

      {/* Sticky Note */}
      <div style={{ ...styles.note, backgroundColor: color }}>
        <div style={styles.noteContent}>
          {editing ? (
            <div onClick={e => e.stopPropagation()}>
              <input
                style={styles.editInput}
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRename(e)
                  if (e.key === 'Escape') setEditing(false)
                }}
                autoFocus
              />
              <div style={styles.editActions}>
                <button style={styles.saveEditBtn} onClick={handleRename}>✓</button>
                <button style={styles.cancelEditBtn} onClick={e => { e.stopPropagation(); setEditing(false) }}>✕</button>
              </div>
            </div>
          ) : (
            <div style={styles.titleRow}>
              <h3 style={styles.noteTitle}>{board.name}</h3>
              {hovered && (
                <button style={styles.editBtn} onClick={handleEditClick}>✏️</button>
              )}
            </div>
          )}
          <p style={styles.noteDate}>
            📅 {new Date(board.created_at).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
          <div style={styles.noteLines}>
            <div style={styles.line}></div>
            <div style={styles.line}></div>
            <div style={styles.line}></div>
          </div>
        </div>
        <div style={styles.noteFooter}>
          <span style={styles.openText}>
            {hovered && !editing ? 'Open board →' : 'Click to open →'}
          </span>
          <button
            style={styles.deleteNoteBtn}
            onClick={(e) => { e.stopPropagation(); onDelete(board.id) }}
          >🗑️</button>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [boards, setBoards] = useState([])
  const [newBoardName, setNewBoardName] = useState('')
  const [showInput, setShowInput] = useState(false)
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      const res = await api.get('/boards')
      setBoards(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const createBoard = async () => {
    if (!newBoardName.trim()) return
    try {
      const res = await api.post('/boards', { name: newBoardName })
      setBoards([...boards, res.data])
      setNewBoardName('')
      setShowInput(false)
    } catch (err) {
      console.error(err)
    }
  }

  const deleteBoard = async (id) => {
    try {
      await api.delete(`/boards/${id}`)
      setBoards(boards.filter(b => b.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const renameBoard = async (id, newName) => {
    try {
      await api.put(`/boards/${id}`, { name: newName })
      setBoards(boards.map(b => b.id === id ? { ...b, name: newName } : b))
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      transition: 'background-color 0.3s'
    }}>
      {/* Navbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding: '0 32px',
        height: '64px',
        boxShadow: '0 2px 12px rgba(79,70,229,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>
            🗂️ KanbanApp
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => navigate('/profile')}
          >
            👤 {user?.name}
          </button>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: 'white',
              color: '#4f46e5',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer'
            }}
            onClick={handleLogout}
          >Logout</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: '32px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
              📌 My Boards
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              {boards.length} board{boards.length !== 1 ? 's' : ''} pinned
            </p>
          </div>
          <button
            style={{
              padding: '12px 24px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
            }}
            onClick={() => setShowInput(true)}
          >+ New Board</button>
        </div>

        {/* Cork Board */}
        <div style={{
          background: theme === 'dark'
            ? `repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(99,102,241,0.08) 27px, rgba(99,102,241,0.08) 28px),
               repeating-linear-gradient(90deg, transparent, transparent 27px, rgba(99,102,241,0.08) 27px, rgba(99,102,241,0.08) 28px),
               var(--bg-cork)`
            : `repeating-linear-gradient(0deg, transparent, transparent 27px, rgba(79,70,229,0.04) 27px, rgba(79,70,229,0.04) 28px),
               repeating-linear-gradient(90deg, transparent, transparent 27px, rgba(79,70,229,0.04) 27px, rgba(79,70,229,0.04) 28px),
               var(--bg-cork)`,
          borderRadius: '16px',
          padding: '48px 40px',
          border: `2px solid var(--border-color)`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '48px 40px',
          minHeight: '400px',
          alignItems: 'flex-start',
          boxShadow: 'inset 0 2px 8px rgba(79,70,229,0.06)'
        }}>

          {showInput && (
            <div style={{ position: 'relative', paddingTop: '24px', width: '200px' }}>
              <div style={styles.pin}>
                <div style={{ ...styles.pinHead, backgroundColor: '#4f46e5' }}></div>
                <div style={styles.pinNeedle}></div>
              </div>
              <div style={styles.tape}></div>
              <div style={{ ...styles.note, backgroundColor: '#fff740', minHeight: '180px' }}>
                <div style={styles.noteContent}>
                  <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#444', marginBottom: '10px', paddingTop: '8px' }}>
                    ✏️ Board name:
                  </p>
                  <input
                    style={styles.noteInput}
                    type="text"
                    placeholder="Enter name..."
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createBoard()}
                    autoFocus
                  />
                </div>
                <div style={styles.noteFooter}>
                  <button style={styles.saveBtn} onClick={createBoard}>📌 Pin it!</button>
                  <button style={styles.cancelNoteBtn} onClick={() => { setShowInput(false); setNewBoardName('') }}>✕</button>
                </div>
              </div>
            </div>
          )}

          {boards.length === 0 && !showInput ? (
            <div style={{ textAlign: 'center', width: '100%', marginTop: '60px' }}>
              <p style={{ fontSize: '64px', marginBottom: '16px' }}>📌</p>
              <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '8px' }}>
                No boards pinned yet!
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                Click "+ New Board" to pin your first board
              </p>
            </div>
          ) : (
            boards.map((board, index) => (
              <BoardCard
                key={board.id}
                board={board}
                color={COLORS[index % COLORS.length]}
                pinColor={PIN_COLORS[index % PIN_COLORS.length]}
                rotation={ROTATIONS[index % ROTATIONS.length]}
                onDelete={deleteBoard}
                onRename={renameBoard}
                onClick={() => navigate(`/board/${board.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  pin: {
    position: 'absolute',
    top: '0px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10
  },
  pinHead: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
  },
  pinNeedle: {
    width: '2px',
    height: '22px',
    backgroundColor: '#bbb'
  },
  tape: {
    position: 'absolute',
    top: '14px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '64px',
    height: '18px',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: '2px',
    zIndex: 5
  },
  note: {
    borderRadius: '3px',
    padding: '22px 16px 14px',
    minHeight: '190px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  noteContent: { flex: 1, paddingTop: '8px' },
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '4px',
    marginBottom: '6px'
  },
  noteTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#222',
    wordBreak: 'break-word',
    lineHeight: 1.3
  },
  editBtn: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0',
    opacity: 0.7,
    flexShrink: 0
  },
  editInput: {
    width: '100%',
    padding: '6px 8px',
    border: 'none',
    borderBottom: '2px solid rgba(0,0,0,0.3)',
    backgroundColor: 'transparent',
    fontSize: '15px',
    fontWeight: '800',
    outline: 'none',
    color: '#222',
    boxSizing: 'border-box',
    marginBottom: '8px'
  },
  editActions: { display: 'flex', gap: '6px', marginBottom: '8px' },
  saveEditBtn: {
    padding: '4px 12px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelEditBtn: {
    padding: '4px 10px',
    backgroundColor: 'transparent',
    color: '#666',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer'
  },
  noteDate: { fontSize: '11px', color: '#555', marginBottom: '14px' },
  noteLines: { display: 'flex', flexDirection: 'column', gap: '7px' },
  line: { height: '1px', backgroundColor: 'rgba(0,0,0,0.12)', borderRadius: '1px' },
  noteFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '14px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(0,0,0,0.08)'
  },
  openText: { fontSize: '11px', color: '#444', fontStyle: 'italic', fontWeight: '600' },
  deleteNoteBtn: { background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', opacity: 0.5 },
  noteInput: {
    width: '100%',
    padding: '8px 4px',
    border: 'none',
    borderBottom: '2px solid rgba(0,0,0,0.25)',
    backgroundColor: 'transparent',
    fontSize: '15px',
    fontWeight: 'bold',
    outline: 'none',
    color: '#333',
    boxSizing: 'border-box'
  },
  saveBtn: {
    padding: '6px 14px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  cancelNoteBtn: {
    padding: '6px 10px',
    backgroundColor: 'transparent',
    color: '#666',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer'
  }
}

export default Dashboard