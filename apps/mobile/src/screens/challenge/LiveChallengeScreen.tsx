import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

interface Props {
  challengeId: string;
  challengeTitle: string;
  poolAmount: number;
  opponentName: string;
  onEnd: () => void;
}

export function LiveChallengeScreen({ challengeId, challengeTitle, poolAmount, opponentName, onEnd }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Timer
    timerRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    // Simulate viewer growth
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    setViewerCount(Math.floor(Math.random() * 10) + 5);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(viewerInterval);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      {/* Camera placeholder - will use expo-camera */}
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.cameraText}>📷 Câmera Ao Vivo</Text>
        <Text style={styles.cameraSubtext}>expo-camera será integrado aqui</Text>
      </View>

      {/* Live badge */}
      <View style={styles.liveBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>AO VIVO</Text>
      </View>

      {/* Viewer count */}
      <View style={styles.viewerBadge}>
        <Text style={styles.viewerText}>👀 {viewerCount}</Text>
      </View>

      {/* Opponent PiP */}
      <View style={styles.opponentPip}>
        <Text style={styles.pipInitial}>
          {opponentName.charAt(0).toUpperCase()}
        </Text>
        <Text style={styles.pipName}>{opponentName}</Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.controls}>
        <Text style={styles.timer}>{formatTime(elapsed)}</Text>
        <Text style={styles.challengeName}>
          {challengeTitle} • R${poolAmount} pool
        </Text>

        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnIcon}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnIcon}>🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnEnd]} onPress={onEnd}>
            <Text style={styles.btnIcon}>⏹️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnIcon}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  cameraPlaceholder: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#111',
  },
  cameraText: { fontSize: 24, color: colors.textSecondary },
  cameraSubtext: { fontSize: 12, color: colors.textMuted, marginTop: 8 },
  liveBadge: {
    position: 'absolute', top: 60, left: 20,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.live, paddingVertical: 5, paddingHorizontal: 12,
    borderRadius: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'white' },
  liveText: { color: 'white', fontSize: 12, fontWeight: '700' },
  viewerBadge: {
    position: 'absolute', top: 60, right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 5, paddingHorizontal: 10,
    borderRadius: 6,
  },
  viewerText: { color: 'white', fontSize: 12 },
  opponentPip: {
    position: 'absolute', top: 100, right: 15,
    width: 90, height: 120, borderRadius: 12,
    backgroundColor: '#222', borderWidth: 2, borderColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
  },
  pipInitial: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  pipName: { fontSize: 10, color: colors.textSecondary, marginTop: 4 },
  controls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingTop: 50, paddingBottom: 40, paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  timer: { fontSize: 36, fontWeight: '900', color: colors.green, textAlign: 'center' },
  challengeName: { fontSize: 14, color: colors.sage, textAlign: 'center', marginTop: 5, marginBottom: 18 },
  btnRow: { flexDirection: 'row', justifyContent: 'center', gap: 15 },
  btn: {
    width: 54, height: 54, borderRadius: 27,
    backgroundColor: '#333', alignItems: 'center', justifyContent: 'center',
  },
  btnEnd: { backgroundColor: colors.live },
  btnIcon: { fontSize: 20 },
});
