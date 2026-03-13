import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

export function InvestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 Investimentos</Text>
      <Text style={styles.subtitle}>Invista em players e receba retornos</Text>

      <View style={styles.card}>
        <Text style={styles.cardEmoji}>🚀</Text>
        <Text style={styles.cardTitle}>Crowdfunding 2.0</Text>
        <Text style={styles.cardDesc}>
          Invista VITA ou R$ em jogadores que você acredita.{'\n'}
          Receba % das vitórias, royalties de conteúdo e acesso a experiências exclusivas.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Como funciona</Text>
        <View style={styles.step}>
          <Text style={styles.stepNum}>1</Text>
          <Text style={styles.stepText}>Escolha um player pra investir</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNum}>2</Text>
          <Text style={styles.stepText}>Defina o valor e duração do contrato</Text>
        </View>
        <View style={styles.step}>
          <Text style={styles.stepNum}>3</Text>
          <Text style={styles.stepText}>Receba retornos automáticos a cada vitória</Text>
        </View>
      </View>

      <Text style={styles.emptyText}>
        Em breve: ranking de players investíveis
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingTop: 60 },
  header: { fontSize: 22, fontWeight: '800', color: colors.stone, paddingHorizontal: 20 },
  subtitle: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: 20, marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: colors.bgCard, borderRadius: 16, padding: 20,
    marginHorizontal: 20, marginBottom: 15,
  },
  cardEmoji: { fontSize: 32, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 10 },
  cardDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  stepNum: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: colors.green,
    color: 'white', fontSize: 14, fontWeight: '700', textAlign: 'center', lineHeight: 28,
  },
  stepText: { fontSize: 14, color: colors.textSecondary, flex: 1 },
  emptyText: { color: colors.textMuted, textAlign: 'center', padding: 30, fontSize: 14 },
});
