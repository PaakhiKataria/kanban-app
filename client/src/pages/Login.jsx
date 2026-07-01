import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function MockBoard() {
  return (
    <div style={styles.mockBoard}>
      {[
        { title: 'To Do', color: '#6366f1', cards: ['Design login page', 'Write API docs'] },
        { title: 'In Progress', color: '#f59e0b', cards: ['Build auth system'] },
        { title: 'Done', color: '#10b981', cards: ['Project setup', 'Create wireframes'] }
      ].map((col, i) => (
        <div key={i} style={styles.mockColumn}>
          <div style={styles.mockColHeader}>
            <span style={{ ...styles.mockDot, backgroundColor: col.color }}></span>
            <span style={styles.mockColTitle}>{col.title}</span>
            <span style={styles.mockCount}>{col.cards.length}</span>
          </div>
          {col.cards.map((card, j) => (
            <div key={j} style={styles.mockCard}>{card}</div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          {/* Logo */}
          <div style={styles.logo} onClick={() => navigate('/')}>
            🗂️ KanbanApp
          </div>

          {/* Text */}
          <div style={styles.leftText}>
            <h1 style={styles.leftTitle}>Welcome Back!</h1>
            <p style={styles.leftSubtitle}>
              Your tasks are waiting.<br />Let's get things done.
            </p>
          </div>

          {/* Features */}
          <div style={styles.features}>
            {[
              { icon: '⚡', text: 'Real-time collaboration with your team' },
              { icon: '🖱️', text: 'Drag & drop cards between columns' },
              { icon: '📋', text: 'Track every action with activity logs' }
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* Mock Board */}
          <MockBoard />
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          {/* Header */}
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Sign In</h2>
            <p style={styles.formSubtitle}>Enter your credentials to continue</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              style={styles.submitBtn}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine}></div>
          </div>

          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/register" style={styles.switchLink}>
              Create one free →
            </Link>
          </p>

          <p style={styles.backLink} onClick={() => navigate('/')}>
            ← Back to home
          </p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh'
  },
  leftPanel: {
    flex: 1,
    backgroundColor: '#4f46e5',
    backgroundImage: `
      radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.8) 0%, transparent 60%),
      radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.6) 0%, transparent 50%)
    `,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    position: 'relative',
    overflow: 'hidden'
  },
  leftContent: {
    maxWidth: '480px',
    width: '100%'
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '48px',
    cursor: 'pointer'
  },
  leftText: { marginBottom: '32px' },
  leftTitle: {
    fontSize: '42px',
    fontWeight: '800',
    color: 'white',
    marginBottom: '12px',
    lineHeight: 1.2
  },
  leftSubtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.7
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginBottom: '36px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  featureIcon: {
    fontSize: '20px',
    width: '36px',
    height: '36px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '14px'
  },
  mockBoard: {
    display: 'flex',
    gap: '10px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '16px',
    borderRadius: '14px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  mockColumn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '10px',
    flex: 1
  },
  mockColHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '8px'
  },
  mockDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  mockColTitle: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: 'white',
    flex: 1
  },
  mockCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '1px 6px',
    fontSize: '10px',
    color: 'white'
  },
  mockCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: '6px',
    padding: '7px 9px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '6px',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  rightPanel: {
    width: '480px',
    minWidth: '480px',
    backgroundColor: '#f8f9ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px'
  },
  formCard: {
    width: '100%',
    maxWidth: '380px'
  },
  formHeader: { marginBottom: '32px' },
  formTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1a2e',
    marginBottom: '8px'
  },
  formSubtitle: { fontSize: '14px', color: '#999' },
  errorBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '20px'
  },
  fieldGroup: { marginBottom: '20px' },
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
    transition: 'border-color 0.2s',
    color: '#333'
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.35)'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e0e0e0'
  },
  dividerText: { fontSize: '13px', color: '#999' },
  switchText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px'
  },
  switchLink: {
    color: '#4f46e5',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  backLink: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#999',
    cursor: 'pointer',
    display: 'block'
  }
}

export default Login