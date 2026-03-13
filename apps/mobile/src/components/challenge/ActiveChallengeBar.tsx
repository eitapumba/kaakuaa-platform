import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  challengeId: string;
  onPress: () => void;
}

export function ActiveChallengeBar({ challengeId, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.bar} onPress={onPress}>
      <Text style={styles.left}>⚔️ Desafio ativo</Text>
      <Text style={styles.right}>ao vivo →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: 16, marginBottom: 15,
    padding: 14, borderRadius: 12,
    backgroundColor: colors.bgHighlight,
    borderWidth: 1, borderColor: colors.green,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  left: { color: colors.green, fontWeight: '700', fontSize: 14 },
  right: { color: colors.sage, fontSize: 13 },
});
