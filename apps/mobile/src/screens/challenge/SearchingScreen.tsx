import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing,
} from 'react-native';
import { colors } from '../../theme/colors';

const CATEGORY_EMOJI: Record<string, string> = {
  sports: '🏋️', esports: '🎮', personal_evolution: '🧠',
  regeneration: '🌿', rap_battle: '🎤', culinary: '🍳',
};

interface Props {
  category: string;
  stakeAmount: number;
  tier: string;
  estimatedWait: number;
  queuePosition: number;
  onCancel: () => void;
}

export function SearchingScreen({ category, stakeAmount, tier, estimatedWait, queuePosition, onCancel }: Props) {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, []);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const emoji = CATEGORY_EMOJI[category] || '⚔️';

  return (
    <View style={styles.container}>
      {/* Spinning ring */}
      <Animated.View style={[styles.ring, { transform: [{ rotate: spinInterpolate }] }]}>
        <View style={styles.ringInner}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      </Animated.View>

      <Text style={styles.title}>Buscando desafiante...</Text>
      <Text style={styles.subtitle}>
        {category.replace('_', ' ')} • {tier} • R${stakeAmount}
      </Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>~{estimatedWait}s</Text>
          <Text style={styles.statLabel}>Estimativa</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{queuePosition}</Text>
          <Text style={styles.statLabel}>Na fila</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancelar busca</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center', padding: 30,
  },
  ring: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 4, borderColor: colors.border,
    borderTopColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 25,
  },
  ringInner: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 42 },
  title: { fontSize: 20, fontWeight: '700', color: colors.stone, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 30 },
  statsRow: { flexDirection: 'row', gap: 30, marginBottom: 40 },
  stat: { alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800', color: colors.green },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  cancelBtn: {
    paddingVertical: 14, paddingHorizontal: 30,
    borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12,
  },
  cancelText: { color: colors.textSecondary, fontSize: 15 },
});
