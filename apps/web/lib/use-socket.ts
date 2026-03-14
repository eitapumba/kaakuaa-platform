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

interface VoteUpdate {
  challengeId: string
  votes: Record<string, number>
  totalVotes: number
}

export function useSocket(userId: string | undefined) {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [matchData, setMatchData] = useState<MatchData | null>(null)
  const [searchingData, setSearchingData] = useState<SearchingData | null>(null)
  const [challengeStarted, setChallengeStarted] = useState<ChallengeStartedData | null>(null)
  const [challengeCompleted, setChallengeCompleted] = useState<ChallengeCompletedData | null>(null)
  const [voteUpdate, setVoteUpdate] = useState<VoteUpdate | null>(null)

  // WebRTC event callbacks (set by the component)
  const webrtcCallbacksRef = useRef<{
    onOffer?: (data: any) => void
    onAnswer?: (data: any) => void
    onIceCandidate?: (data: any) => void
    onPeerReady?: (data: any) => void
  }>({})

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

    // Matchmaking events
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

    // Voting events
    socket.on('challenge.vote-update', (data: VoteUpdate) => {
      setVoteUpdate(data)
    })

    // WebRTC signaling events
    socket.on('webrtc.offer', (data: any) => {
      console.log('[WebRTC] Received offer from', data.fromUserId)
      webrtcCallbacksRef.current.onOffer?.(data)
    })

    socket.on('webrtc.answer', (data: any) => {
      console.log('[WebRTC] Received answer from', data.fromUserId)
      webrtcCallbacksRef.current.onAnswer?.(data)
    })

    socket.on('webrtc.ice-candidate', (data: any) => {
      webrtcCallbacksRef.current.onIceCandidate?.(data)
    })

    socket.on('webrtc.peer-ready', (data: any) => {
      console.log('[WebRTC] Peer ready:', data.userId)
      webrtcCallbacksRef.current.onPeerReady?.(data)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId])

  // WebRTC signaling methods
  const sendOffer = useCallback((challengeId: string, targetUserId: string, sdp: any) => {
    socketRef.current?.emit('webrtc.offer', { challengeId, targetUserId, sdp })
  }, [])

  const sendAnswer = useCallback((challengeId: string, targetUserId: string, sdp: any) => {
    socketRef.current?.emit('webrtc.answer', { challengeId, targetUserId, sdp })
  }, [])

  const sendIceCandidate = useCallback((challengeId: string, targetUserId: string, candidate: any) => {
    socketRef.current?.emit('webrtc.ice-candidate', { challengeId, targetUserId, candidate })
  }, [])

  const sendReady = useCallback((challengeId: string) => {
    socketRef.current?.emit('webrtc.ready', { challengeId })
  }, [])

  // Voting
  const sendVote = useCallback((challengeId: string, votedForUserId: string) => {
    socketRef.current?.emit('challenge.vote', { challengeId, votedForUserId })
  }, [])

  // Watch a challenge
  const watchChallenge = useCallback((challengeId: string) => {
    socketRef.current?.emit('challenge.watch', { challengeId })
  }, [])

  // Submit frame for AI
  const submitFrame = useCallback((challengeId: string, frameData: string, metadata?: any) => {
    socketRef.current?.emit('challenge.submit-frame', { challengeId, frameData, metadata })
  }, [])

  const setWebRTCCallbacks = useCallback((callbacks: {
    onOffer?: (data: any) => void
    onAnswer?: (data: any) => void
    onIceCandidate?: (data: any) => void
    onPeerReady?: (data: any) => void
  }) => {
    webrtcCallbacksRef.current = callbacks
  }, [])

  const clearMatch = useCallback(() => {
    setMatchData(null)
    setChallengeStarted(null)
    setChallengeCompleted(null)
    setVoteUpdate(null)
  }, [])

  return {
    socket: socketRef.current,
    connected,
    matchData,
    searchingData,
    challengeStarted,
    challengeCompleted,
    voteUpdate,
    clearMatch,
    // WebRTC
    sendOffer,
    sendAnswer,
    sendIceCandidate,
    sendReady,
    setWebRTCCallbacks,
    // Voting
    sendVote,
    watchChallenge,
    // AI
    submitFrame,
  }
}
