import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WS_URL = __DEV__ ? 'http://localhost:4000/challenges' : 'https://api.kaakuaa.com/challenges';

interface MatchData {
  challengeId: string;
  opponent: {
    id: string;
    displayName: string;
    stats: {
      rank: string;
      won: number;
      completed: number;
      winRate: number;
      streak: number;
    };
  };
  matchedAt: string;
}

interface SearchingData {
  category: string;
  tier: string;
  stakeAmount: number;
  queuePosition: number;
  estimatedWait: number;
}

export function useSocket(userId: string | null) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [searchingData, setSearchingData] = useState<SearchingData | null>(null);
  const [challengeStarted, setChallengeStarted] = useState<string | null>(null);
  const [challengeCompleted, setChallengeCompleted] = useState<any>(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(WS_URL, {
      auth: { userId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    // Matchmaking events
    socket.on('matchmaking.searching', (data: SearchingData) => {
      setSearchingData(data);
      setMatchData(null);
    });

    socket.on('matchmaking.cancelled', () => {
      setSearchingData(null);
    });

    // Challenge events
    socket.on('challenge.matched', (data: MatchData) => {
      setMatchData(data);
      setSearchingData(null);
    });

    socket.on('challenge.started', (data: { challengeId: string }) => {
      setChallengeStarted(data.challengeId);
    });

    socket.on('challenge.completed', (data: any) => {
      setChallengeCompleted(data);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const watchChallenge = useCallback((challengeId: string) => {
    socketRef.current?.emit('challenge.watch', { challengeId });
  }, []);

  const resetMatch = useCallback(() => {
    setMatchData(null);
    setSearchingData(null);
    setChallengeStarted(null);
    setChallengeCompleted(null);
  }, []);

  return {
    connected,
    matchData,
    searchingData,
    challengeStarted,
    challengeCompleted,
    watchChallenge,
    resetMatch,
  };
}
