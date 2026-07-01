import { useNavigate } from 'react-router-dom'

function Landing() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>🗂️ KanbanApp</div>
        <div style={styles.navButtons}>
          <button style={styles.loginBtn} onClick={() => navigate('/login')}>Login</button>
          <button style={styles.registerBtn} onClick={() => navigate('/register')}>Get Started Free</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <span style={styles.badge}>✨ Real-time Collaboration</span>
          <h1 style={styles.heroTitle}>
            Organize Work.<br />
            <span style={styles.highlight}>Ship Faster.</span>
          </h1>
          <p style={styles.heroSubtitle}>
            KanbanApp is a real-time collaborative project management tool.
            Visualize your workflow, track progress, and get things done —
            together with your team.
          </p>
          <div style={styles.heroButtons}>
            <button style={styles.ctaBtn} onClick={() => navigate('/register')}>
              Start for Free →
            </button>
            <button style={styles.demoBtn} onClick={() => navigate('/login')}>
              Login to Dashboard
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div style={styles.heroVisual}>
          <div style={styles.mockBoard}>
            {[
              { title: 'To Do', color: '#6366f1', cards: ['Design UI mockups', 'Write API docs'] },
              { title: 'In Progress', color: '#f59e0b', cards: ['Build auth system', 'Setup database'] },
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
        </div>
      </section>

      {/* What is Kanban Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>What is Kanban?</h2>
        <p style={styles.sectionText}>
          Kanban is a visual workflow management method that helps teams
          visualize work, limit work-in-progress, and maximize efficiency.
          Originally developed by Toyota in the 1940s, it has become one of
          the most popular agile frameworks used by software teams worldwide.
        </p>
        <div style={styles.kanbanSteps}>
          {[
            { icon: '👁️', title: 'Visualize Work', desc: 'See all your tasks on a board. Know exactly what is being worked on and what is next.' },
            { icon: '🔄', title: 'Limit WIP', desc: 'Limit work in progress to reduce multitasking and help your team focus on completing tasks.' },
            { icon: '🚀', title: 'Ship Faster', desc: 'Identify bottlenecks early and continuously improve your team\'s delivery speed.' }
          ].map((step, i) => (
            <div key={i} style={styles.stepCard}>
              <span style={styles.stepIcon}>{step.icon}</span>
              <h3 style={styles.stepTitle}>{step.title}</h3>
              <p style={styles.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ ...styles.section, backgroundColor: '#f8f9ff' }}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.steps}>
          {[
            { num: '1', title: 'Create a Board', desc: 'Start by creating a board for your project — like "Website Redesign" or "Sprint 1".' },
            { num: '2', title: 'Add Columns', desc: 'Create columns to represent stages of your workflow — To Do, In Progress, Review, Done.' },
            { num: '3', title: 'Add Cards', desc: 'Add cards for each task. Include a description, due date, and assignee.' },
            { num: '4', title: 'Drag & Drop', desc: 'Move cards between columns as work progresses. Your team sees updates in real-time.' }
          ].map((step, i) => (
            <div key={i} style={styles.howStep}>
              <div style={styles.stepNum}>{step.num}</div>
              <div>
                <h3 style={styles.howTitle}>{step.title}</h3>
                <p style={styles.howDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Everything You Need</h2>
        <div style={styles.featuresGrid}>
          {[
            { icon: '⚡', title: 'Real-time Sync', desc: 'Changes appear instantly for all team members — no refresh needed.' },
            { icon: '🔒', title: 'Secure Auth', desc: 'JWT-based authentication keeps your boards private and secure.' },
            { icon: '🗂️', title: 'Multiple Boards', desc: 'Create unlimited boards for different projects or teams.' },
            { icon: '🖱️', title: 'Drag & Drop', desc: 'Intuitive drag and drop to move cards between columns effortlessly.' },
            { icon: '📅', title: 'Due Dates', desc: 'Set due dates on cards so nothing slips through the cracks.' },
            { icon: '📋', title: 'Activity Log', desc: 'Track every action — who moved what and when — with a full activity history.' }
          ].map((f, i) => (
            <div key={i} style={styles.featureCard}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Ready to get organized?</h2>
        <p style={styles.ctaSubtitle}>Join thousands of teams already using KanbanApp to ship faster.</p>
        <button style={styles.ctaBtnLarge} onClick={() => navigate('/register')}>
          Create Free Account →
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span>🗂️ KanbanApp</span>
        <span style={styles.footerText}>Built with React, Node.js, PostgreSQL & Socket.io</span>
      </footer>
    </div>
  )
}

const styles = {
  container: { fontFamily: "'Segoe UI', sans-serif", color: '#333' },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 64px',
    height: '64px',
    backgroundColor: 'white',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: { fontSize: '20px', fontWeight: 'bold', color: '#4f46e5' },
  navButtons: { display: 'flex', gap: '12px' },
  loginBtn: {
    padding: '8px 20px',
    backgroundColor: 'transparent',
    color: '#4f46e5',
    border: '1px solid #4f46e5',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  registerBtn: {
    padding: '8px 20px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '80px 64px',
    backgroundColor: '#fafafa',
    gap: '48px',
    flexWrap: 'wrap'
  },
  heroContent: { maxWidth: '520px' },
  badge: {
    display: 'inline-block',
    backgroundColor: '#ede9fe',
    color: '#4f46e5',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
    marginBottom: '20px'
  },
  heroTitle: { fontSize: '48px', fontWeight: '800', lineHeight: 1.2, marginBottom: '20px' },
  highlight: { color: '#4f46e5' },
  heroSubtitle: { fontSize: '17px', color: '#666', lineHeight: 1.7, marginBottom: '32px' },
  heroButtons: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  ctaBtn: {
    padding: '14px 28px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  demoBtn: {
    padding: '14px 28px',
    backgroundColor: 'white',
    color: '#4f46e5',
    border: '1px solid #4f46e5',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  heroVisual: { flex: 1, minWidth: '320px' },
  mockBoard: {
    display: 'flex',
    gap: '12px',
    backgroundColor: '#e8eaf6',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
  },
  mockColumn: {
    backgroundColor: '#f0f2f5',
    borderRadius: '10px',
    padding: '12px',
    flex: 1,
    minWidth: '130px'
  },
  mockColHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px'
  },
  mockDot: { width: '10px', height: '10px', borderRadius: '50%' },
  mockColTitle: { fontSize: '12px', fontWeight: 'bold', flex: 1 },
  mockCount: {
    backgroundColor: '#ddd',
    borderRadius: '10px',
    padding: '1px 6px',
    fontSize: '11px'
  },
  mockCard: {
    backgroundColor: 'white',
    borderRadius: '6px',
    padding: '8px 10px',
    fontSize: '11px',
    marginBottom: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
  },
  section: {
    padding: '80px 64px',
    backgroundColor: 'white'
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: '16px'
  },
  sectionText: {
    fontSize: '16px',
    color: '#666',
    lineHeight: 1.8,
    textAlign: 'center',
    maxWidth: '700px',
    margin: '0 auto 48px'
  },
  kanbanSteps: {
    display: 'flex',
    gap: '24px',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  stepCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: '12px',
    padding: '28px',
    maxWidth: '280px',
    textAlign: 'center',
    flex: 1
  },
  stepIcon: { fontSize: '40px', display: 'block', marginBottom: '16px' },
  stepTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' },
  stepDesc: { fontSize: '14px', color: '#666', lineHeight: 1.7 },
  steps: { maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' },
  howStep: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  stepNum: {
    width: '48px',
    height: '48px',
    minWidth: '48px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  howTitle: { fontSize: '18px', fontWeight: 'bold', marginBottom: '6px' },
  howDesc: { fontSize: '15px', color: '#666', lineHeight: 1.7 },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '24px',
    marginTop: '48px'
  },
  featureCard: {
    backgroundColor: '#f8f9ff',
    borderRadius: '12px',
    padding: '24px',
    border: '1px solid #e8e8f0'
  },
  featureIcon: { fontSize: '32px', display: 'block', marginBottom: '12px' },
  featureTitle: { fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' },
  featureDesc: { fontSize: '14px', color: '#666', lineHeight: 1.6 },
  ctaSection: {
    backgroundColor: '#4f46e5',
    padding: '80px 64px',
    textAlign: 'center'
  },
  ctaTitle: { fontSize: '36px', fontWeight: '800', color: 'white', marginBottom: '16px' },
  ctaSubtitle: { fontSize: '18px', color: 'rgba(255,255,255,0.8)', marginBottom: '32px' },
  ctaBtnLarge: {
    padding: '16px 36px',
    backgroundColor: 'white',
    color: '#4f46e5',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 64px',
    backgroundColor: '#1a1a2e',
    color: 'white',
    fontSize: '14px'
  },
  footerText: { color: 'rgba(255,255,255,0.5)' }
}

export default Landing