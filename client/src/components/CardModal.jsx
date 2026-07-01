import { useState, useEffect } from 'react'
import api from '../services/api'

const PRESET_LABELS = [
  { text: 'Bug', color: '#ef4444' },
  { text: 'Feature', color: '#4f46e5' },
  { text: 'Urgent', color: '#f97316' },
  { text: 'Design', color: '#ec4899' },
  { text: 'Backend', color: '#8b5cf6' },
  { text: 'Frontend', color: '#06b6d4' },
  { text: 'Testing', color: '#10b981' },
  { text: 'Docs', color: '#f59e0b' },
]

function CardModal({ card, columnName, onClose, onUpdate }) {
  const [title, setTitle] = useState(card.title)
  const [description, setDescription] = useState(card.description || '')
  const [dueDate, setDueDate] = useState(card.due_date ? card.due_date.split('T')[0] : '')
  const [labels, setLabels] = useState(card.labels || [])
  const [checklist, setChecklist] = useState(card.checklist || [])
  const [newCheckItem, setNewCheckItem] = useState('')
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  const completedCount = checklist.filter(i => i.completed).length
  const totalCount = checklist.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put(`/cards/${card.id}`, {
        title,
        description,
        assignee_id: card.assignee_id,
        due_date: dueDate || null
      })
      onUpdate({ ...res.data, labels, checklist })
      onClose()
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }

  const addLabel = async (preset) => {
    const already = labels.find(l => l.text === preset.text)
    if (already) return
    try {
      const res = await api.post('/labels', {
        card_id: card.id,
        text: preset.text,
        color: preset.color
      })
      const updatedLabels = [...labels, res.data]
      setLabels(updatedLabels)
      onUpdate({ ...card, labels: updatedLabels, checklist })
    } catch (err) {
      console.error(err)
    }
  }

  const removeLabel = async (labelId) => {
    try {
      await api.delete(`/labels/${labelId}`)
      const updatedLabels = labels.filter(l => l.id !== labelId)
      setLabels(updatedLabels)
      onUpdate({ ...card, labels: updatedLabels, checklist })
    } catch (err) {
      console.error(err)
    }
  }

  const addCheckItem = async () => {
    if (!newCheckItem.trim()) return
    try {
      const res = await api.post('/checklist', {
        card_id: card.id,
        text: newCheckItem,
        position: checklist.length
      })
      const updatedChecklist = [...checklist, res.data]
      setChecklist(updatedChecklist)
      onUpdate({ ...card, labels, checklist: updatedChecklist })
      setNewCheckItem('')
    } catch (err) {
      console.error(err)
    }
  }

  const toggleCheckItem = async (item) => {
    try {
      const res = await api.patch(`/checklist/${item.id}`, {
        completed: !item.completed
      })
      const updatedChecklist = checklist.map(i =>
        i.id === item.id ? res.data : i
      )
      setChecklist(updatedChecklist)
      onUpdate({ ...card, labels, checklist: updatedChecklist })
    } catch (err) {
      console.error(err)
    }
  }

  const deleteCheckItem = async (itemId) => {
    try {
      await api.delete(`/checklist/${itemId}`)
      const updatedChecklist = checklist.filter(i => i.id !== itemId)
      setChecklist(updatedChecklist)
      onUpdate({ ...card, labels, checklist: updatedChecklist })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.columnTag}>📋 {columnName}</div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'details' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('details')}
          >📝 Details</button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'labels' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('labels')}
          >🏷️ Labels {labels.length > 0 && `(${labels.length})`}</button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'checklist' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('checklist')}
          >✅ Checklist {totalCount > 0 && `(${completedCount}/${totalCount})`}</button>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div>
            <div style={styles.section}>
              <label style={styles.label}>Card Title</label>
              <input
                style={styles.titleInput}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div style={styles.section}>
              <label style={styles.label}>📝 Description</label>
              <textarea
                style={styles.textarea}
                placeholder="Add a description..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
              />
            </div>
            <div style={styles.section}>
              <label style={styles.label}>📅 Due Date</label>
              <input
                style={styles.dateInput}
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
            <div style={styles.actions}>
              <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            </div>
          </div>
        )}

        {/* Labels Tab */}
        {activeTab === 'labels' && (
          <div>
            {labels.length > 0 && (
              <div style={styles.section}>
                <label style={styles.label}>Current Labels</label>
                <div style={styles.currentLabels}>
                  {labels.map(label => (
                    <div
                      key={label.id}
                      style={{
                        ...styles.labelChip,
                        backgroundColor: label.color + '22',
                        border: `1.5px solid ${label.color}66`
                      }}
                    >
                      <span style={{ color: label.color, fontWeight: '700', fontSize: '13px' }}>
                        {label.text}
                      </span>
                      <button style={styles.removeLabelBtn} onClick={() => removeLabel(label.id)}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={styles.section}>
              <label style={styles.label}>Add Labels</label>
              <div style={styles.presetLabels}>
                {PRESET_LABELS.map((preset, i) => {
                  const isAdded = labels.find(l => l.text === preset.text)
                  return (
                    <button
                      key={i}
                      style={{
                        ...styles.presetLabel,
                        backgroundColor: preset.color + '22',
                        border: `1.5px solid ${preset.color}`,
                        color: preset.color,
                        opacity: isAdded ? 0.4 : 1,
                        cursor: isAdded ? 'not-allowed' : 'pointer'
                      }}
                      onClick={() => addLabel(preset)}
                      disabled={!!isAdded}
                    >
                      {isAdded ? '✓ ' : '+ '}{preset.text}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div>
            {/* Progress Bar */}
            {totalCount > 0 && (
              <div style={styles.section}>
                <div style={styles.progressHeader}>
                  <label style={styles.label}>Progress</label>
                  <span style={styles.progressPercent}>{progress}%</span>
                </div>
                <div style={styles.progressTrack}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? '#10b981' : '#4f46e5'
                  }}></div>
                </div>
                <p style={styles.progressLabel}>
                  {completedCount} of {totalCount} tasks completed
                </p>
              </div>
            )}

            {/* Checklist Items */}
            <div style={styles.section}>
              <label style={styles.label}>Tasks</label>
              {checklist.length === 0 ? (
                <div style={styles.emptyChecklist}>
                  <p>📋 No tasks yet — add one below!</p>
                </div>
              ) : (
                <div style={styles.checklistItems}>
                  {checklist.map(item => (
                    <div key={item.id} style={styles.checklistItem}>
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleCheckItem(item)}
                        style={styles.checkbox}
                      />
                      <span style={{
                        ...styles.checklistText,
                        textDecoration: item.completed ? 'line-through' : 'none',
                        color: item.completed ? '#aaa' : '#333'
                      }}>
                        {item.text}
                      </span>
                      <button
                        style={styles.deleteCheckBtn}
                        onClick={() => deleteCheckItem(item.id)}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Item */}
            <div style={styles.addCheckItem}>
              <input
                style={styles.checkInput}
                type="text"
                placeholder="Add a task..."
                value={newCheckItem}
                onChange={e => setNewCheckItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCheckItem()}
              />
              <button style={styles.addCheckBtn} onClick={addCheckItem}>
                + Add
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '28px',
    width: '100%',
    maxWidth: '520px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  columnTag: {
    backgroundColor: '#f0f2ff',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    color: '#4f46e5',
    fontWeight: '600'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#999'
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '20px',
    backgroundColor: '#f8f9ff',
    padding: '4px',
    borderRadius: '10px'
  },
  tab: {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#999',
    fontWeight: '600'
  },
  activeTab: {
    backgroundColor: 'white',
    color: '#4f46e5',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
  },
  section: { marginBottom: '20px' },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#555',
    marginBottom: '8px'
  },
  titleInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '16px',
    fontWeight: 'bold',
    boxSizing: 'border-box',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing: 'border-box',
    outline: 'none'
  },
  dateInput: {
    padding: '10px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    outline: 'none'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px'
  },
  saveBtn: {
    padding: '10px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer'
  },
  cancelBtn: {
    padding: '10px 24px',
    backgroundColor: '#eee',
    color: '#333',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  currentLabels: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  labelChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    borderRadius: '20px'
  },
  removeLabelBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#999',
    fontSize: '12px',
    padding: '0'
  },
  presetLabels: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  presetLabel: {
    padding: '7px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  progressPercent: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#4f46e5'
  },
  progressTrack: {
    height: '8px',
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '6px'
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  progressLabel: {
    fontSize: '12px',
    color: '#999'
  },
  emptyChecklist: {
    textAlign: 'center',
    color: '#bbb',
    fontSize: '14px',
    padding: '20px 0'
  },
  checklistItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: '#f8f9ff',
    borderRadius: '8px',
    border: '1px solid #e8e8f0'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: '#4f46e5'
  },
  checklistText: {
    flex: 1,
    fontSize: '14px',
    lineHeight: 1.4
  },
  deleteCheckBtn: {
    background: 'none',
    border: 'none',
    color: '#ddd',
    cursor: 'pointer',
    fontSize: '12px'
  },
  addCheckItem: {
    display: 'flex',
    gap: '8px'
  },
  checkInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    outline: 'none'
  },
  addCheckBtn: {
    padding: '10px 16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer'
  }
}

export default CardModal