import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000')
  }
  return socket
}

export const useSocket = (boardId, handlers) => {
  const handlersRef = useRef(handlers)

  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    const s = getSocket()

    s.emit('join_board', boardId)

    const onCardMoved = (data) => handlersRef.current.onCardMoved?.(data)
    const onCardCreated = (data) => handlersRef.current.onCardCreated?.(data)
    const onCardDeleted = (data) => handlersRef.current.onCardDeleted?.(data)
    const onColumnCreated = (data) => handlersRef.current.onColumnCreated?.(data)
    const onColumnDeleted = (data) => handlersRef.current.onColumnDeleted?.(data)
    const onCardUpdated = (data) => handlersRef.current.onCardUpdated?.(data)
    s.on('card_updated', onCardUpdated)

    s.on('card_moved', onCardMoved)
    s.on('card_created', onCardCreated)
    s.on('card_deleted', onCardDeleted)
    s.on('column_created', onColumnCreated)
    s.on('column_deleted', onColumnDeleted)

    return () => {
      s.emit('leave_board', boardId)
      s.off('card_moved', onCardMoved)
      s.off('card_created', onCardCreated)
      s.off('card_deleted', onCardDeleted)
      s.off('column_created', onColumnCreated)
      s.off('column_deleted', onColumnDeleted)
      s.off('card_updated', onCardUpdated)
    }
  }, [boardId])
}