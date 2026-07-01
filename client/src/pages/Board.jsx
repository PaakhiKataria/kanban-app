import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { getSocket, useSocket } from '../hooks/useSocket'
import CardModal from '../components/CardModal'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const COLUMN_COLORS = [
  '#4f46e5', // indigo
  '#f59e0b', // amber
  '#10b981', // green
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ec4899', // pink
]

function SortableCard({ card, onDelete, columnId, onCardClick, accentColor, searchQuery }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: `card-${card.id}` })

  const [hovered, setHovered] = useState(false)

  const isMatch = searchQuery &&
    (card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    card.description?.toLowerCase().includes(searchQuery.toLowerCase()))

  const isHidden = searchQuery && !isMatch

  const highlightText = (text, query) => {
    if (!query) return text
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} style={styles.highlight}>{part}</mark>
        : part
    )
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : isHidden ? 0.2 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...styles.card,
        ...style,
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: isMatch
          ? `0 0 0 2px ${accentColor}, 0 4px 12px rgba(0,0,0,0.12)`
          : hovered
          ? '0 4px 12px rgba(0,0,0,0.12)'
          : '0 1px 4px rgba(0,0,0,0.06)',
        transform: `${CSS.Transform.toString(transform) || ''} ${hovered ? 'translateY(-2px)' : ''}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.dragHandle} {...attributes} {...listeners}>⠿</div>
      <div style={styles.cardContent} onClick={() => onCardClick(card, columnId)}>
        {card.labels && card.labels.length > 0 && (
          <div style={styles.cardLabels}>
            {card.labels.map(label => (
              <span
                key={label.id}
                style={{
                  ...styles.cardLabel,
                  backgroundColor: label.color + '33',
                  color: label.color,
                  border: `1px solid ${label.color}66`
                }}
              >
                {label.text}
              </span>
            ))}
          </div>
        )}
        <span style={styles.cardTitle}>
          {highlightText(card.title, searchQuery)}
        </span>
        {card.due_date && (
          <span style={{
            ...styles.dueDate,
            color: new Date(card.due_date) < new Date() ? '#ef4444' : '#f59e0b'
          }}>
            📅 {new Date(card.due_date).toLocaleDateString()}
          </span>
        )}
        {card.description && (
          <span style={styles.hasDesc}>📝 Has description</span>
        )}
        {card.checklist && card.checklist.length > 0 && (
          <div style={styles.checklistProgress}>
            <div style={styles.checklistProgressBar}>
              <div style={{
                ...styles.checklistProgressFill,
                width: `${(card.checklist.filter(i => i.completed).length / card.checklist.length) * 100}%`,
                backgroundColor: card.checklist.every(i => i.completed) ? '#10b981' : '#4f46e5'
              }}></div>
            </div>
            <span style={styles.checklistProgressText}>
              {card.checklist.filter(i => i.completed).length}/{card.checklist.length}
            </span>
          </div>
        )}
      </div>
      <button
        style={styles.deleteCardBtn}
        onClick={() => onDelete(card.id, columnId)}
      >✕</button>
    </div>
  )
}

function DroppableColumn({ column, children }) {
  const { setNodeRef } = useDroppable({ id: column.id })
  return (
    <div ref={setNodeRef} style={{ minHeight: '60px' }}>
      {children}
    </div>
  )
}

function Board() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [board, setBoard] = useState(null)
  const [columns, setColumns] = useState([])
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [showColumnInput, setShowColumnInput] = useState(false)
  const [newCardTitles, setNewCardTitles] = useState({})
  const [showCardInput, setShowCardInput] = useState({})
  const [activeCard, setActiveCard] = useState(null)
  const [activeCardColumnId, setActiveCardColumnId] = useState(null)
  const [selectedCard, setSelectedCard] = useState(null)
  const [selectedColumnName, setSelectedColumnName] = useState('')
  const [activityLog, setActivityLog] = useState([])
  const [showLog, setShowLog] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [searchQuery, setSearchQuery] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  useSocket(id, {
    onCardMoved: ({ cardId, fromColumnId, toColumnId }) => {
      setColumns(prev => {
        const fromCol = prev.find(c => c.id === fromColumnId)
        if (!fromCol) return prev
        const card = fromCol.cards.find(c => c.id === cardId)
        if (!card) return prev
        return prev.map(col => {
          if (col.id === fromColumnId) {
            return { ...col, cards: col.cards.filter(c => c.id !== cardId) }
          }
          if (col.id === toColumnId) {
            return { ...col, cards: [...col.cards, card] }
          }
          return col
        })
      })
    },
    onCardCreated: ({ card, columnId }) => {
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.some(c => c.id === card.id)
                ? col.cards
                : [...col.cards, card]
            }
          : col
      ))
    },
    onCardUpdated: ({ card }) => {
      setColumns(prev => prev.map(col => ({
        ...col,
        cards: col.cards.map(c => c.id === card.id ? card : c)
     })))
    },
    onCardDeleted: ({ cardId, columnId }) => {
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { ...col, cards: col.cards.filter(c => c.id !== cardId) }
          : col
      ))
    },
    onColumnCreated: ({ column }) => {
      setColumns(prev => [...prev, { ...column, cards: [] }])
    },
    onColumnDeleted: ({ columnId }) => {
      setColumns(prev => prev.filter(c => c.id !== columnId))
    },
    onActivityLog: ({ log }) => {
      setActivityLog(prev => [log, ...prev].slice(0, 20))
    }
  })

  useEffect(() => {
    fetchBoard()
    fetchColumns()
    fetchActivityLog()
  }, [id])

  const fetchBoard = async () => {
    try {
      const res = await api.get(`/boards/${id}`)
      setBoard(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchColumns = async () => {
    try {
      const res = await api.get(`/columns/${id}`)
      const columnsWithCards = await Promise.all(
        res.data.map(async (col) => {
          const cards = await api.get(`/cards/${col.id}`)
          const cardsWithExtras = await Promise.all(
            cards.data.map(async (card) => {
              const labels = await api.get(`/labels/${card.id}`)
              const checklist = await api.get(`/checklist/${card.id}`)
              return { ...card, labels: labels.data, checklist: checklist.data }
            })
          )
          return { ...col, cards: cardsWithExtras }
        })
      )
      setColumns(columnsWithCards)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchActivityLog = async () => {
    try {
      const res = await api.get(`/boards/${id}/activity`)
      setActivityLog(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const addActivity = async (action) => {
    try {
      const res = await api.post(`/boards/${id}/activity`, { action })
      const log = res.data
      setActivityLog(prev => [log, ...prev].slice(0, 20))
      getSocket().emit('activity_log', { boardId: id, log })
    } catch (err) {
      console.error(err)
    }
  }

  const createColumn = async () => {
    if (!newColumnTitle.trim()) return
    try {
      const res = await api.post('/columns', {
        board_id: id,
        title: newColumnTitle,
        position: columns.length + 1
      })
      setColumns([...columns, { ...res.data, cards: [] }])
      setNewColumnTitle('')
      setShowColumnInput(false)
      getSocket().emit('column_created', { boardId: id, column: res.data })
      addActivity(`${user.name} created column "${newColumnTitle}"`)
    } catch (err) {
      console.error(err)
    }
  }

  const deleteColumn = async (columnId) => {
    const col = columns.find(c => c.id === columnId)
    try {
      await api.delete(`/columns/${columnId}`)
      setColumns(columns.filter(c => c.id !== columnId))
      getSocket().emit('column_deleted', { boardId: id, columnId })
      addActivity(`${user.name} deleted column "${col?.title}"`)
    } catch (err) {
      console.error(err)
    }
  }

  const createCard = async (columnId) => {
    const title = newCardTitles[columnId]
    if (!title?.trim()) return
    try {
      const column = columns.find(c => c.id === columnId)
      const res = await api.post('/cards', {
        column_id: columnId,
        title,
        description: '',
        position: column.cards.length + 1,
        assignee_id: null,
        due_date: null
      })
      setColumns(columns.map(c =>
        c.id === columnId ? { ...c, cards: [...c.cards, res.data] } : c
      ))
      setNewCardTitles({ ...newCardTitles, [columnId]: '' })
      setShowCardInput({ ...showCardInput, [columnId]: false })
      getSocket().emit('card_created', { boardId: id, card: res.data, columnId })
      addActivity(`${user.name} added card "${title}" to "${column?.title}"`)
    } catch (err) {
      console.error(err)
    }
  }

  const deleteCard = async (cardId, columnId) => {
    const col = columns.find(c => c.id === columnId)
    const card = col?.cards.find(c => c.id === cardId)
    try {
      await api.delete(`/cards/${cardId}`)
      setColumns(columns.map(c =>
        c.id === columnId
          ? { ...c, cards: c.cards.filter(card => card.id !== cardId) }
          : c
      ))
      getSocket().emit('card_deleted', { boardId: id, cardId, columnId })
      addActivity(`${user.name} deleted card "${card?.title}"`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCardClick = (card, columnId) => {
    const column = columns.find(c => c.id === columnId)
    setSelectedCard(card)
    setSelectedColumnName(column?.title || '')
  }

  const handleCardUpdate = (updatedCard) => {
    setColumns(prev => prev.map(col => ({
      ...col,
      cards: col.cards.map(c => c.id === updatedCard.id ? updatedCard : c)
    })))
    getSocket().emit('card_updated', { boardId: id, card: updatedCard })
    addActivity(`${user.name} updated card "${updatedCard.title}"`)
  }

  const findColumnByCardId = (cardId) => {
    return columns.find(col =>
      col.cards.some(card => `card-${card.id}` === cardId)
    )
  }

  const handleDragStart = (event) => {
    const { active } = event
    const column = findColumnByCardId(active.id)
    if (column) {
      const card = column.cards.find(c => `card-${c.id}` === active.id)
      setActiveCard(card)
      setActiveCardColumnId(column.id)
    }
  }

  const handleDragOver = (event) => {
    const { active, over } = event
    if (!over) return

    const activeColumn = findColumnByCardId(active.id)
    const overColumn =
      findColumnByCardId(over.id) ||
      columns.find(col => col.id === over.id || String(col.id) === String(over.id))

    if (!activeColumn || !overColumn) return
    if (activeColumn.id === overColumn.id) return

    setColumns(prev => {
      const activeCardData = activeColumn.cards.find(
        c => `card-${c.id}` === active.id
      )
      if (!activeCardData) return prev
      return prev.map(col => {
        if (col.id === activeColumn.id) {
          return { ...col, cards: col.cards.filter(c => `card-${c.id}` !== active.id) }
        }
        if (col.id === overColumn.id) {
          return { ...col, cards: [...col.cards, activeCardData] }
        }
        return col
      })
    })
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event
    setActiveCard(null)
    if (!over) return

    const cardId = parseInt(active.id.replace('card-', ''))
    const fromColumnId = activeCardColumnId

    const toColumn =
      findColumnByCardId(over.id) ||
      columns.find(col => col.id === over.id || String(col.id) === String(over.id))

    const toColumnId = toColumn ? toColumn.id : fromColumnId

    if (fromColumnId === toColumnId) {
      const col = columns.find(c => c.id === fromColumnId)
      if (col) {
        const oldIndex = col.cards.findIndex(c => c.id === cardId)
        const newIndex = col.cards.findIndex(c => `card-${c.id}` === over.id)
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          setColumns(prev => prev.map(c => {
            if (c.id === fromColumnId) {
              return { ...c, cards: arrayMove(c.cards, oldIndex, newIndex) }
            }
            return c
          }))
        }
      }
    }

    try {
      await api.patch(`/cards/${cardId}/move`, {
        column_id: toColumnId,
        position: 1
      })
      getSocket().emit('card_moved', {
        boardId: id,
        cardId,
        fromColumnId,
        toColumnId
      })

      if (fromColumnId !== toColumnId) {
        const fromCol = columns.find(c => c.id === fromColumnId)
        const toCol = columns.find(c => c.id === toColumnId)
        const card = fromCol?.cards.find(c => c.id === cardId) ||
          toCol?.cards.find(c => c.id === cardId)
        addActivity(
          `${user.name} moved "${card?.title}" from "${fromCol?.title}" to "${toCol?.title}"`
        )
      }
    } catch (err) {
      console.error(err)
    }

    setActiveCardColumnId(null)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.back} onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </span>
          <div style={styles.divider}></div>
          <h2 style={styles.boardTitle}>🗂️ {board?.name}</h2>
        </div>
        <div style={styles.navRight}>
          <button
            style={styles.activityBtn}
            onClick={() => setShowLog(!showLog)}
          >
            📋 Activity
            {activityLog.length > 0 && (
              <span style={styles.activityBadge}>{activityLog.length}</span>
            )}
          </button>
          <span style={styles.welcome}>Hi, {user?.name}!</span>
          <button
            style={styles.profileBtn}
            onClick={() => navigate('/profile')}
          >
            👤 {user?.name}
          </button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Board Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <span style={styles.statNum}>{columns.length}</span>
          <span style={styles.statLabel}>Columns</span>
        </div>
        <div style={styles.statDivider}></div>
        <div style={styles.stat}>
          <span style={styles.statNum}>
            {columns.reduce((acc, col) => acc + col.cards.length, 0)}
          </span>
          <span style={styles.statLabel}>Total Cards</span>
        </div>
        <div style={styles.statDivider}></div>
        <div style={styles.stat}>
          <span style={styles.statNum}>
            {columns.reduce((acc, col) =>
              acc + col.cards.filter(c => c.due_date && new Date(c.due_date) < new Date()).length, 0
            )}
          </span>
          <span style={{ ...styles.statLabel, color: '#ef4444' }}>Overdue</span>
        </div>

        {/* Search */}
        <div style={styles.searchContainer}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              style={styles.clearSearch}
              onClick={() => setSearchQuery('')}
            >✕</button>
          )}
        </div>

        {/* Zoom Controls */}
        <div style={styles.zoomControls}>
          <button
            style={styles.zoomBtn}
            onClick={() => setZoom(z => Math.max(50, z - 10))}
            title="Zoom Out"
          >−</button>
          <span style={styles.zoomLabel}>{zoom}%</span>
          <button
            style={styles.zoomBtn}
            onClick={() => setZoom(z => Math.min(150, z + 10))}
            title="Zoom In"
          >+</button>
          <button
            style={styles.zoomResetBtn}
            onClick={() => setZoom(100)}
            title="Reset Zoom"
          >Reset</button>
        </div>
      </div>

      {searchQuery && (
          <div style={styles.searchResults}>
            {columns.reduce((acc, col) =>
              acc + col.cards.filter(c =>
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.description?.toLowerCase().includes(searchQuery.toLowerCase())
              ).length, 0
            )} results found
          </div>
        )}

      <div style={styles.mainContent}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div style={{
            ...styles.columnsContainer,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / zoom}%`,
            minHeight: `${10000 / zoom}%`
          }}>
            {columns.map((column, index) => {
              const accentColor = COLUMN_COLORS[index % COLUMN_COLORS.length]
              return (
                <div key={column.id} style={styles.columnWrapper}>
                  <div style={{ ...styles.column, borderTop: `4px solid ${accentColor}` }}>
                    {/* Column Header */}
                    <div style={styles.columnHeader}>
                      <div style={styles.columnHeaderLeft}>
                        <span style={{ ...styles.columnDot, backgroundColor: accentColor }}></span>
                        <h3 style={styles.columnTitle}>{column.title}</h3>
                      </div>
                      <div style={styles.columnHeaderRight}>
                        <span style={{ ...styles.cardCountBadge, backgroundColor: accentColor + '22', color: accentColor }}>
                          {column.cards.length}
                        </span>
                        <button
                          style={styles.deleteColBtn}
                          onClick={() => deleteColumn(column.id)}
                        >✕</button>
                      </div>
                    </div>

                    {/* Cards */}
                    <SortableContext
                      items={column.cards.map(c => `card-${c.id}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <DroppableColumn column={column}>
                        <div style={styles.cardsContainer}>
                          {column.cards.length === 0 ? (
                            <div style={styles.emptyColumn}>
                              <span style={styles.emptyColumnIcon}>📭</span>
                              <span style={styles.emptyColumnText}>No cards yet</span>
                            </div>
                          ) : (
                            column.cards.map(card => (
                              <SortableCard
                                key={card.id}
                                card={card}
                                columnId={column.id}
                                onDelete={deleteCard}
                                onCardClick={handleCardClick}
                                accentColor={accentColor}
                                searchQuery={searchQuery}
                              />
                            ))
                          )}
                        </div>
                      </DroppableColumn>
                    </SortableContext>

                    {/* Add Card */}
                    {showCardInput[column.id] ? (
                      <div style={styles.addCardForm}>
                        <input
                          style={styles.cardInput}
                          type="text"
                          placeholder="Card title..."
                          value={newCardTitles[column.id] || ''}
                          onChange={(e) => setNewCardTitles({
                            ...newCardTitles,
                            [column.id]: e.target.value
                          })}
                          onKeyDown={(e) => e.key === 'Enter' && createCard(column.id)}
                          autoFocus
                        />
                        <div style={styles.cardActions}>
                          <button
                            style={{ ...styles.addBtn, backgroundColor: accentColor }}
                            onClick={() => createCard(column.id)}
                          >Add</button>
                          <button
                            style={styles.cancelBtn}
                            onClick={() => setShowCardInput({ ...showCardInput, [column.id]: false })}
                          >Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        style={styles.addCardBtn}
                        onClick={() => setShowCardInput({ ...showCardInput, [column.id]: true })}
                      >+ Add Card</button>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Add Column */}
            <div style={styles.addColumnContainer}>
              {showColumnInput ? (
                <div style={styles.newColumnCard}>
                  <p style={styles.newColumnLabel}>Column name</p>
                  <input
                    style={styles.columnInput}
                    type="text"
                    placeholder="e.g. In Review..."
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && createColumn()}
                    autoFocus
                  />
                  <div style={styles.cardActions}>
                    <button style={styles.addBtn} onClick={createColumn}>Add Column</button>
                    <button
                      style={styles.cancelBtn}
                      onClick={() => setShowColumnInput(false)}
                    >Cancel</button>
                  </div>
                </div>
              ) : (
                <button
                  style={styles.addColumnBtn}
                  onClick={() => setShowColumnInput(true)}
                >
                  <span style={styles.addColumnPlus}>+</span>
                  Add Column
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeCard ? (
              <div style={{ ...styles.card, borderLeft: '4px solid #4f46e5', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <div style={styles.dragHandle}>⠿</div>
                <span style={styles.cardTitle}>{activeCard.title}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Activity Sidebar */}
        {showLog && (
          <div style={styles.activitySidebar}>
            <div style={styles.activityHeader}>
              <h3 style={styles.activityTitle}>📋 Activity</h3>
              <button style={styles.closeLogBtn} onClick={() => setShowLog(false)}>✕</button>
            </div>
            <div style={styles.activityList}>
              {activityLog.length === 0 ? (
                <div style={styles.noActivity}>
                  <p>🎉</p>
                  <p>No activity yet</p>
                </div>
              ) : (
                activityLog.map((log, index) => (
                  <div key={index} style={styles.activityItem}>
                    <div style={styles.activityDot}></div>
                    <div>
                      <p style={styles.activityAction}>{log.action}</p>
                      <span style={styles.activityTime}>{formatTime(log.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          columnName={selectedColumnName}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
        />
      )}
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8f9ff' },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    padding: '0 32px',
    height: '64px',
    boxShadow: '0 2px 12px rgba(79,70,229,0.3)'
  },
  navLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
  back: {
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  divider: {
    width: '1px',
    height: '20px',
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  boardTitle: { color: 'white', fontSize: '18px', fontWeight: '700' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome: { color: 'rgba(255,255,255,0.85)', fontSize: '14px' },
  activityBtn: {
    padding: '7px 14px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    position: 'relative'
  },
  activityBadge: {
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '10px',
    padding: '1px 6px',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: 'white',
    color: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer'
  },
  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    padding: '12px 32px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e8e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
  },
  stat: { display: 'flex', alignItems: 'center', gap: '8px' },
  statNum: { fontSize: '18px', fontWeight: '800', color: '#1a1a2e' },
  statLabel: { fontSize: '13px', color: '#999' },
  statDivider: { width: '1px', height: '24px', backgroundColor: '#e8e8f0' },
  mainContent: {
    display: 'flex',
    height: 'calc(100vh - 112px)',
    overflow: 'hidden'
  },
  columnsContainer: {
    display: 'flex',
    gap: '16px',
    padding: '24px',
    overflowX: 'auto',
    alignItems: 'flex-start',
    flex: 1
  },
  columnWrapper: { display: 'flex', flexDirection: 'column' },
  column: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    width: '280px',
    minWidth: '280px',
    maxHeight: 'calc(100vh - 160px)',
    overflowY: 'auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8f0'
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px'
  },
  columnHeaderLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  columnDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%'
  },
  columnTitle: { fontSize: '15px', fontWeight: '700', color: '#1a1a2e' },
  columnHeaderRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  cardCountBadge: {
    borderRadius: '12px',
    padding: '2px 10px',
    fontSize: '12px',
    fontWeight: '700'
  },
  deleteColBtn: {
    background: 'none',
    border: 'none',
    color: '#ccc',
    fontSize: '14px',
    cursor: 'pointer'
  },
  cardsContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
  emptyColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 0',
    gap: '6px'
  },
  emptyColumnIcon: { fontSize: '28px' },
  emptyColumnText: { fontSize: '13px', color: '#bbb', fontStyle: 'italic' },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '12px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    border: '1px solid #f0f0f0',
    transition: 'box-shadow 0.2s, transform 0.2s'
  },
  dragHandle: {
    color: '#ccc',
    cursor: 'grab',
    fontSize: '16px',
    userSelect: 'none',
    paddingTop: '1px'
  },
  cardContent: {
    flex: 1,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  cardTitle: { fontSize: '14px', color: '#1a1a2e', fontWeight: '500', lineHeight: 1.4 },
  dueDate: { fontSize: '11px', fontWeight: '600' },
  hasDesc: { fontSize: '11px', color: '#aaa' },
  deleteCardBtn: {
    background: 'none',
    border: 'none',
    color: '#ddd',
    fontSize: '12px',
    cursor: 'pointer',
    paddingTop: '2px'
  },
  addCardForm: { marginTop: '10px' },
  cardInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    marginBottom: '8px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  cardActions: { display: 'flex', gap: '8px' },
  addBtn: {
    padding: '7px 16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '7px',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'pointer'
  },
  cancelBtn: {
    padding: '7px 14px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '7px',
    fontSize: '13px',
    cursor: 'pointer'
  },
  addCardBtn: {
    marginTop: '10px',
    width: '100%',
    padding: '9px',
    backgroundColor: 'transparent',
    border: '1.5px dashed #e0e0e0',
    color: '#aaa',
    textAlign: 'center',
    fontSize: '13px',
    cursor: 'pointer',
    borderRadius: '8px',
    fontWeight: '500',
    transition: 'border-color 0.2s, color 0.2s'
  },
  addColumnContainer: { minWidth: '280px' },
  newColumnCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8f0'
  },
  newColumnLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '10px'
  },
  columnInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    marginBottom: '10px',
    boxSizing: 'border-box',
    outline: 'none'
  },
  addColumnBtn: {
    padding: '14px 16px',
    backgroundColor: 'white',
    border: '2px dashed #c7d2fe',
    borderRadius: '12px',
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  },
  addColumnPlus: {
    fontSize: '20px',
    fontWeight: '300'
  },
  activitySidebar: {
    width: '300px',
    minWidth: '300px',
    backgroundColor: 'white',
    borderLeft: '1px solid #e8e8f0',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.04)'
  },
  activityHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    borderBottom: '1px solid #f0f0f0',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'
  },
  activityTitle: { fontSize: '15px', color: 'white', fontWeight: '700' },
  closeLogBtn: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    color: 'white',
    borderRadius: '6px',
    padding: '4px 8px'
  },
  activityList: {
    overflowY: 'auto',
    flex: 1,
    padding: '12px'
  },
  activityItem: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    padding: '10px 12px',
    borderRadius: '8px',
    marginBottom: '6px',
    backgroundColor: '#f8f9ff',
    border: '1px solid #e8e8f0'
  },
  activityDot: {
    width: '8px',
    height: '8px',
    minWidth: '8px',
    backgroundColor: '#4f46e5',
    borderRadius: '50%',
    marginTop: '5px'
  },
  activityAction: {
    fontSize: '13px',
    color: '#333',
    margin: 0,
    marginBottom: '4px',
    lineHeight: 1.4
  },
  activityTime: { fontSize: '11px', color: '#bbb' },
  noActivity: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: '14px',
    marginTop: '40px'
  },
  zoomControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  zoomBtn: {
    width: '32px',
    height: '32px',
    backgroundColor: '#f0f2ff',
    color: '#4f46e5',
    border: '1.5px solid #c7d2fe',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1
  },
  zoomLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#4f46e5',
    minWidth: '40px',
    textAlign: 'center'
  },
  zoomResetBtn: {
    padding: '6px 12px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  profileBtn: {
    padding: '8px 16px',
    backgroundColor: '#f0f2ff',
    color: '#4f46e5',
    border: '1.5px solid #c7d2fe',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0f2ff',
    border: '1.5px solid #c7d2fe',
    borderRadius: '10px',
    padding: '6px 12px',
    gap: '8px',
    marginLeft: 'auto',
    width: '240px'
  },
  searchIcon: { fontSize: '14px' },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    outline: 'none',
    flex: 1,
    color: '#333'
  },
  clearSearch: {
    background: 'none',
    border: 'none',
    color: '#999',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '0'
  },
  searchResults: {
    fontSize: '13px',
    color: '#4f46e5',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  highlight: {
    backgroundColor: '#fef08a',
    color: '#333',
    borderRadius: '3px',
    padding: '0 2px'
  },
  cardLabels: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    marginBottom: '6px'
  },
  cardLabel: {
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: '700'
  },
  checklistProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px'
  },
  checklistProgressBar: {
    flex: 1,
    height: '4px',
    backgroundColor: '#f0f0f0',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  checklistProgressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease'
  },
  checklistProgressText: {
    fontSize: '11px',
    color: '#999',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  }
}

export default Board