const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const pool = require('./config/db')
const authRoutes = require('./routes/auth')
const boardRoutes = require('./routes/boards')
const columnRoutes = require('./routes/columns')
const cardRoutes = require('./routes/cards')
const registerSocketHandlers = require('./socket/index')

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
})

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/boards', boardRoutes)
app.use('/api/columns', columnRoutes)
app.use('/api/cards', cardRoutes)

const labelRoutes = require('./routes/labels')
app.use('/api/labels', labelRoutes)

const checklistRoutes = require('./routes/checklist')
app.use('/api/checklist', checklistRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Kanban API is running!' })
})

// Socket.io
registerSocketHandlers(io)

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})