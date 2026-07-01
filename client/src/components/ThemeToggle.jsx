import { useTheme } from '../context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 12px',
        backgroundColor: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: '8px',
        fontSize: '16px',
        cursor: 'pointer',
        color: 'white',
        transition: 'all 0.2s'
      }}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

export default ThemeToggle