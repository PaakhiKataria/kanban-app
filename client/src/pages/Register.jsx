import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function MockBoard() {
  return (
    <div style={styles.mockBoard}>
      {[
        { title: 'To Do', color: '#6366f1', cards: ['Plan my project'] },
        { title: 'In Progress', color: '#f59e0b', cards: ['Build the app', 'Design UI'] },
        { title: 'Done', color: '#10b981', cards: ['Create account', 'Set up board'] }
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

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
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
      const res = await api.post('/auth/register', form)
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logo} onClick={() => navigate('/')}>
            🗂️ KanbanApp
          </div>

          <div style={styles.leftText}>
            <h1 style={styles.leftTitle}>Start Organizing Today!</h1>
            <p style={styles.leftSubtitle}>
              Join thousands of teams already shipping faster with KanbanApp.
            </p>
          </div>

          <div style={styles.features}>
            {[
              { icon: '🚀', text: 'Set up your first board in under 2 minutes' },
              { icon: '👥', text: 'Collaborate with your team in real-time' },
              { icon: '📅', text: 'Track deadlines with due dates on every card' }
            ].map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>

          <MockBoard />
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create Account</h2>
            <p style={styles.formSubtitle}>Free forever. No credit card required.</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                name="name"
                placeholder="Paakhi"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

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
                placeholder="Create a strong password"
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
              {loading ? 'Creating account...' : 'Create Free Account →'}
            </button>
          </form>

          <div style={styles.divider}>
            <div style={styles.dividerLine}></div>
            <span style={styles.dividerText}>or</span>
            <div style={styles.dividerLine}></div>
          </div>

          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.switchLink}>
              Sign in →
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
    backgroundColor: '#7c3aed',
    backgroundImage: `
      radial-gradient(circle at 20% 50%, rgba(124, 58, 237, 0.8) 0%, transparent 60%),
      radial-gradient(circle at 80% 20%, rgba(79, 70, 229, 0.6) 0%, transparent 50%)
    `,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    overflow: 'hidden'
  },
  leftContent: { maxWidth: '480px', width: '100%' },
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
  mockDot: { width: '8px', height: '8px', borderRadius: '50%' },
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
    color: '#333'
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#7c3aed',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 15px rgba(124, 58, 237, 0.35)'
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
    color: '#7c3aed',
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

export default Register