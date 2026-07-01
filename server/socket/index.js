module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)
    socket.on('card_updated', (data) => {
  socket.to(`board_${data.boardId}`).emit('card_updated', data)
})
    // Join a board room
    socket.on('join_board', (boardId) => {
      socket.join(`board_${boardId}`)
      console.log(`User ${socket.id} joined board_${boardId}`)
    })

    // Leave a board room
    socket.on('leave_board', (boardId) => {
      socket.leave(`board_${boardId}`)
      console.log(`User ${socket.id} left board_${boardId}`)
    })

    // Card moved
    socket.on('card_moved', (data) => {
      socket.to(`board_${data.boardId}`).emit('card_moved', data)
    })

    // Card created
    socket.on('card_created', (data) => {
      socket.to(`board_${data.boardId}`).emit('card_created', data)
    })

    // Card deleted
    socket.on('card_deleted', (data) => {
      socket.to(`board_${data.boardId}`).emit('card_deleted', data)
    })

    // Column created
    socket.on('column_created', (data) => {
      socket.to(`board_${data.boardId}`).emit('column_created', data)
    })

    // Column deleted
    socket.on('column_deleted', (data) => {
      socket.to(`board_${data.boardId}`).emit('column_deleted', data)
    })

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })

    socket.on('activity_log', (data) => {
      socket.to(`board_${data.boardId}`).emit('activity_log', data)
    })
  })
}