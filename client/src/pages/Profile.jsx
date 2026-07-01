import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Profile() {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameSuccess, setNameSuccess] = useState('')
  const [nameError, setNameError] = useState('')
  const [passSuccess, setPassSuccess] = useState('')
  const [passError, setPassError] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile')
      setProfile(res.data)
      setName(res.data.name)
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdateName = async () => {
    if (!name.trim()) return
    setSavingName(true)
    setNameError('')
    setNameSuccess('')
    try {
      const res = await api.put('/auth/profile', { name })
      setProfile(res.data)
      // Update auth context
      const token = localStorage.getItem('token')
      login(res.data, token)
      setNameSuccess('Name updated successfully!')
      setTimeout(() => setNameSuccess(''), 3000)
    } catch (err) {
      setNameError(err.response?.data?.message || 'Failed to update name')
    }
    setSavingName(false)
  }

  const handleUpdatePassword = async () => {
    setPassError('')
    setPassSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setPassError('Please fill in all fields')
    }
    if (newPassword !== confirmPassword) {
      return setPassError('New passwords do not match')
    }
    if (newPassword.length < 6) {
      return setPassError('Password must be at least 6 characters')
    }

    setSavingPass(true)
    try {
      await api.put('/auth/password', { currentPassword, newPassword })
      setPassSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPassSuccess(''), 3000)
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to update password')
    }
    setSavingPass(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      return
    }
    setDeletingAccount(true)
    try {
      await api.delete('/auth/account')
      logout()
      navigate('/')
    } catch (err) {
      console.error(err)
    }
    setDeletingAccount(false)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getJoinedDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
  }

  if (!profile) return (
    <div style={styles.loading}>
      <div style={styles.loadingSpinner}>⏳</div>
      <p>Loading profile...</p>
    </div>
  )

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <span style={styles.back} onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </span>
          <div style={styles.navDivider}></div>
          <span style={styles.navTitle}>My Profile</span>
        </div>
        <div style={styles.navRight}>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Left — Avatar & Info */}
        <div style={styles.leftPanel}>
          {/* Avatar */}
          <div style={styles.avatarCard}>
            <div style={styles.avatar}>
              <span style={styles.avatarText}>{getInitials(profile.name)}</span>
            </div>
            <h2 style={styles.profileName}>{profile.name}</h2>
            <p style={styles.profileEmail}>{profile.email}</p>

            <div style={styles.infoBadges}>
              <div style={styles.badge}>
                <span style={styles.badgeIcon}>📅</span>
                <span style={styles.badgeText}>
                  Joined {getJoinedDate(profile.created_at)}
                </span>
              </div>
              <div style={styles.badge}>
                <span style={styles.badgeIcon}>✅</span>
                <span style={styles.badgeText}>Account Active</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={styles.statsCard}>
            <h3 style={styles.cardTitle}>🗂️ Quick Info</h3>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Username</span>
              <span style={styles.statVal}>{profile.name}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Email</span>
              <span style={styles.statVal}>{profile.email}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statKey}>Member since</span>
              <span style={styles.statVal}>{getJoinedDate(profile.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Right — Edit Forms */}
        <div style={styles.rightPanel}>
          {/* Update Name */}
          <div style={styles.formCard}>
            <div style={styles.formCardHeader}>
              <h3 style={styles.cardTitle}>✏️ Update Name</h3>
              <p style={styles.cardSubtitle}>Change how your name appears across the app</p>
            </div>

            {nameSuccess && <div style={styles.successBox}>{nameSuccess}</div>}
            {nameError && <div style={styles.errorBox}>{nameError}</div>}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <button
              style={styles.saveBtn}
              onClick={handleUpdateName}
              disabled={savingName}
            >
              {savingName ? 'Saving...' : 'Save Name'}
            </button>
          </div>

          {/* Update Password */}
          <div style={styles.formCard}>
            <div style={styles.formCardHeader}>
              <h3 style={styles.cardTitle}>🔒 Change Password</h3>
              <p style={styles.cardSubtitle}>Make sure your account stays secure</p>
            </div>

            {passSuccess && <div style={styles.successBox}>{passSuccess}</div>}
            {passError && <div style={styles.errorBox}>{passError}</div>}

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Current Password</label>
              <input
                style={styles.input}
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>New Password</label>
              <input
                style={styles.input}
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                style={styles.input}
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                onKeyDown={e => e.key === 'Enter' && handleUpdatePassword()}
              />
            </div>

            {/* Password strength indicator */}
            {newPassword && (
              <div style={styles.strengthBar}>
                <div style={styles.strengthLabel}>Password strength:</div>
                <div style={styles.strengthTrack}>
                  <div style={{
                    ...styles.strengthFill,
                    width: newPassword.length < 6 ? '33%' :
                           newPassword.length < 10 ? '66%' : '100%',
                    backgroundColor: newPassword.length < 6 ? '#ef4444' :
                                     newPassword.length < 10 ? '#f59e0b' : '#10b981'
                  }}></div>
                </div>
                <span style={{
                  fontSize: '12px',
                  color: newPassword.length < 6 ? '#ef4444' :
                         newPassword.length < 10 ? '#f59e0b' : '#10b981',
                  fontWeight: 'bold'
                }}>
                  {newPassword.length < 6 ? 'Weak' :
                   newPassword.length < 10 ? 'Medium' : 'Strong'}
                </span>
              </div>
            )}

            <button
              style={styles.saveBtn}
              onClick={handleUpdatePassword}
              disabled={savingPass}
            >
              {savingPass ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          {/* Danger Zone */}
          <div style={{ ...styles.formCard, border: '1px solid #fee2e2' }}>
            <div style={styles.formCardHeader}>
              <h3 style={{ ...styles.cardTitle, color: '#ef4444' }}>⚠️ Danger Zone</h3>
              <p style={styles.cardSubtitle}>Irreversible actions — proceed with caution</p>
            </div>

            <div style={styles.dangerRow}>
              <div>
                <p style={styles.dangerTitle}>Sign Out</p>
                <p style={styles.dangerDesc}>Sign out of your current session</p>
              </div>
              <button style={styles.dangerBtn} onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </div>

            <div style={styles.dangerDivider}></div>

            <div style={styles.dangerRow}>
              <div>
                <p style={styles.dangerTitle}>Delete Account</p>
                <p style={styles.dangerDesc}>Permanently delete your account and all boards</p>
              </div>
              <button
                style={styles.deleteAccountBtn}
                onClick={() => setShowDeleteConfirm(true)}
              >
                🗑️ Delete Account
              </button>
            </div>

            {/* Confirmation Dialog */}
            {showDeleteConfirm && (
              <div style={styles.confirmBox}>
                <p style={styles.confirmTitle}>⚠️ Are you absolutely sure?</p>
                <p style={styles.confirmDesc}>
                  This will permanently delete your account, all your boards, columns, and cards.
                  <strong> This cannot be undone.</strong>
                </p>
                <p style={styles.confirmInstruction}>
                  Type <strong>DELETE</strong> to confirm:
                </p>
                <input
                  style={styles.confirmInput}
                  type="text"
                  placeholder="Type DELETE here"
                  value={deleteConfirmText}
                  onChange={e => setDeleteConfirmText(e.target.value)}
                />
                <div style={styles.confirmActions}>
                  <button
                    style={{
                      ...styles.confirmDeleteBtn,
                      opacity: deleteConfirmText === 'DELETE' ? 1 : 0.5,
                      cursor: deleteConfirmText === 'DELETE' ? 'pointer' : 'not-allowed'
                    }}
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                  >
                    {deletingAccount ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                  <button
                    style={styles.confirmCancelBtn}
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeleteConfirmText('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8f9ff' },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
    color: '#999'
  },
  loadingSpinner: { fontSize: '48px' },
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
  navDivider: {
    width: '1px',
    height: '20px',
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  navTitle: { color: 'white', fontSize: '18px', fontWeight: '700' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
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
  content: {
    display: 'flex',
    gap: '24px',
    padding: '32px',
    maxWidth: '1100px',
    margin: '0 auto',
    alignItems: 'flex-start'
  },
  leftPanel: {
    width: '280px',
    minWidth: '280px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  avatarCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '28px 20px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8f0'
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 4px 16px rgba(79,70,229,0.3)'
  },
  avatarText: {
    fontSize: '28px',
    fontWeight: '800',
    color: 'white'
  },
  profileName: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: '4px'
  },
  profileEmail: {
    fontSize: '14px',
    color: '#999',
    marginBottom: '20px'
  },
  infoBadges: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  badge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#f8f9ff',
    borderRadius: '8px',
    padding: '8px 12px',
    border: '1px solid #e8e8f0'
  },
  badgeIcon: { fontSize: '14px' },
  badgeText: { fontSize: '12px', color: '#666' },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8f0'
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  statKey: { fontSize: '13px', color: '#999' },
  statVal: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
    maxWidth: '150px',
    textAlign: 'right',
    wordBreak: 'break-all'
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    border: '1px solid #e8e8f0'
  },
  formCardHeader: { marginBottom: '20px' },
  cardTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '4px'
  },
  cardSubtitle: { fontSize: '13px', color: '#999' },
  successBox: {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#16a34a',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px'
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '16px'
  },
  fieldGroup: { marginBottom: '16px' },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#444',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: 'white',
    color: '#333'
  },
  saveBtn: {
    padding: '11px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(79,70,229,0.25)'
  },
  strengthBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '16px'
  },
  strengthLabel: { fontSize: '12px', color: '#999', whiteSpace: 'nowrap' },
  strengthTrack: {
    flex: 1,
    height: '6px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  strengthFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s, background-color 0.3s'
  },
  dangerBtn: {
    padding: '11px 24px',
    backgroundColor: 'white',
    color: '#ef4444',
    border: '1.5px solid #ef4444',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  dangerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0'
  },
  dangerTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px'
  },
  dangerDesc: {
    fontSize: '12px',
    color: '#999'
  },
  dangerDivider: {
    height: '1px',
    backgroundColor: '#fee2e2',
    margin: '4px 0'
  },
  dangerBtn: {
    padding: '9px 18px',
    backgroundColor: 'white',
    color: '#ef4444',
    border: '1.5px solid #ef4444',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  deleteAccountBtn: {
    padding: '9px 18px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  confirmBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '20px',
    marginTop: '16px'
  },
  confirmTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#ef4444',
    marginBottom: '8px'
  },
  confirmDesc: {
    fontSize: '13px',
    color: '#666',
    lineHeight: 1.6,
    marginBottom: '16px'
  },
  confirmInstruction: {
    fontSize: '13px',
    color: '#444',
    marginBottom: '8px'
  },
  confirmInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #fca5a5',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    marginBottom: '12px',
    backgroundColor: 'white'
  },
  confirmActions: {
    display: 'flex',
    gap: '10px'
  },
  confirmDeleteBtn: {
    padding: '10px 20px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  confirmCancelBtn: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#666',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer'
  }
}

export default Profile