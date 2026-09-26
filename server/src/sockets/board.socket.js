module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // client apni identity bhejega connect hote hi
    socket.on('register-user', (userId) => {
      socket.join(`user:${userId}`)
      console.log(`Socket ${socket.id} registered as user:${userId}`)
    })

    socket.on('join-board', (boardId) => {
      socket.join(boardId)
    })

    socket.on('new-stroke', ({ boardId, stroke }) => {
      socket.to(boardId).emit('new-stroke', stroke)
    })

    socket.on('clear-board', (boardId) => {
      socket.to(boardId).emit('clear-board')
    })

    socket.on('undo-board', (change) => {
      socket.to(change.boardId).emit('undo-board', change)
    })

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)
    })
  })
}