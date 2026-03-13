import React from 'react';
import { Text, StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 44) / 2;

interface Props {
  emoji: string;
  label: string;
  gradient: string[];
  onlineCount: number;
  onPress: () => void;
}

export function CategoryCard({ emoji, label, gradient, onlineCount, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <LinearGradient
        colors={gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.onlineRow}>
          <View style={styles.dot} />
          <Text style={styles.onlineText}>{onlineCount} online</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 120,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
  },
  emoji: { fontSize: 32, marginBottom: 6 },
  label: { fontSize: 15, fontWeight: '700', color: 'white' },
  onlineRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  onlineText: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
});
