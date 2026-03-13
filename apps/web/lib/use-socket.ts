'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000'

interface MatchData {
  challengeId: string
  opponent: {
    id: string
    displayName: string
    stats: {
      rank: string
      won: number
      completed: number
      winRate: number
      streak: number
    }
  }
  matchedAt: string
}

interface SearchingData {
  category: string
  tier: string
  stakeAmount: number
  queuePosition: number
  estimatedWait: number
}

interface ChallengeStartedData {
  challengeId: string
  startedAt: string
}

interface ChallengeCompletedData {
  challengeId: string
  winnerId: string
  isWinner: boolean
  payout: any
  completedAt: string
}

export function useSocket(userId: string | undefined) {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [searchingData, setSearchingData] = useState<SearchingData | null>(null)
  const [challengeStarted, setChallengeStarted] = useState<ChallengeStartedData | null>(null)
  const [challengeCompleted, setChallengeCompleted] = useState<ChallengeCompletedData | null>(null)

  useEffect(() => {
    if (!userId) return

    const socket = io(`${WS_URL}/challenges`, {
      auth: { userId },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      console.log('[WS] Conectado ao servidor de desafios')
    })

    socket.on('disconnect', () => {
      setConnected(false)
      console.log('[WS] Desconectado')
    })

    socket.on('challenge.matched', (data: MatchData) => {
      console.log('[WS] Match encontrado!', data)
      setMatchData(data)
      setSearchingData(null)
    })

    socket.on('matchmaking.searching', (data: SearchingData) => {
      console.log('[WS] Buscando...', data)
      setSearchingData(data)
    })

    socket.on('matchmaking.cancelled', () => {
      console.log('[WS] Busca cancelada')
      setSearchingData(null)
    })

    socket.on('challenge.started', (data: ChallengeStartedData) => {
      console.log('[WS] Desafio iniciado!', data)
      setChallengeStarted(data)
    })

    socket.on('challenge.completed', (data: ChallengeCompletedData) => {
      console.log('[WS] Desafio concluído!', data)
      setChallengeCompleted(data)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId])

  const clearMatch = useCallback(() => {
    setMatchData(null)
    setChallengeStarted(null)
    setChallengeCompleted(null)
  }, [])

  return {
    socket: socketRef.current,
    connected,
    matchData,
    searchingData,
    challengeStarted,
    challengeCompleted,
    clearMatch,
  }
}
