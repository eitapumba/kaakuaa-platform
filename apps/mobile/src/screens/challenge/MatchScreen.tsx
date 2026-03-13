import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

interface OpponentData {
  id: string;
  displayName: string;
  stats: {
    rank: string;
    won: number;
    completed: number;
    winRate: number;
    streak: number;
  };
}

interface Props {
  opponent: OpponentData;
  challengeId: string;
  onCountdownComplete: () => void;
}

export function MatchScreen({ opponent, challengeId, onCountdownComplete }: Props) {
  const { user } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // Countdown
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onCountdownComplete();
          return 0;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const userWinRate = user?.challengesCompleted
    ? Math.round(((user?.challengesWon || 0) / user.challengesCompleted) * 100)
    : 0;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Text style={styles.badge}>⚡ MATCH ENCONTRADO</Text>

      {/* Player 1 (You) */}
      <View style={styles.playerSection}>
        <View style={styles.playerCircle}>
          <Text style={styles.playerInitial}>
            {user?.displayName?.charAt(0)?.toUpperCase() || 'Y'}
          </Text>
        </View>
        <Text style={styles.playerName}>{user?.displayName}</Text>
        <Text style={styles.playerStats}>
          {user?.rank} • {user?.challengesWon || 0}-{(user?.challengesCompleted || 0) - (user?.challengesWon || 0)} ({userWinRate}%)
          {user?.currentStreak ? ` • 🔥${user.currentStreak}` : ''}
        </Text>
      </View>

      <Text style={styles.vs}>VS</Text>

      {/* Player 2 (Opponent) */}
      <View style={styles.playerSection}>
        <View style={[styles.playerCircle, styles.opponentCircle]}>
          <Text style={styles.playerInitial}>
            {opponent.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.playerName}>{opponent.displayName}</Text>
        <Text style={styles.playerStats}>
          {opponent.stats.rank} • {opponent.stats.won}-{opponent.stats.completed - opponent.stats.won} ({opponent.stats.winRate}%)
          {opponent.stats.streak ? ` • 🔥${opponent.stats.streak}` : ''}
        </Text>
      </View>

      {/* Countdown */}
      <Text style={styles.countdown}>{countdown > 0 ? `0${countdown}` : 'GO!'}</Text>
      <Text style={styles.countdownLabel}>
        {countdown > 0 ? 'Câmera liga em...' : 'Desafio iniciado!'}
      </Text>

      <Text style={styles.viewers}>👀 espectadores entrando</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center', padding: 30,
  },
  badge: {
    fontSize: 14, fontWeight: '800', color: colors.green,
    letterSpacing: 3, marginBottom: 25,
  },
  playerSection: { alignItems: 'center', marginVertical: 5 },
  playerCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 3, borderColor: colors.green,
    backgroundColor: colors.bgCard,
    alignItems: 'center', justifyContent: 'center',
  },
  opponentCircle: { borderColor: colors.stone },
  playerInitial: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  playerName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 8 },
  playerStats: { fontSize: 12, color: colors.textSecondary, marginTop: 3 },
  vs: { fontSize: 32, fontWeight: '900', color: colors.stone, marginVertical: 12 },
  countdown: { fontSize: 56, fontWeight: '900', color: colors.green, marginTop: 20 },
  countdownLabel: { fontSize: 13, color: colors.textSecondary },
  viewers: { fontSize: 12, color: colors.textMuted, marginTop: 15 },
});
