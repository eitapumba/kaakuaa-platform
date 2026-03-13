import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar,
} from 'react-native';
import { colors } from '../../theme/colors';

const CATEGORIES = [
  { key: 'sports', emoji: '🏋️', label: 'Sports' },
  { key: 'esports', emoji: '🎮', label: 'E-Sports' },
  { key: 'personal_evolution', emoji: '🧠', label: 'Evolução' },
  { key: 'rap_battle', emoji: '🎤', label: 'Rap Battle' },
  { key: 'culinary', emoji: '🍳', label: 'Culinária' },
  { key: 'acting', emoji: '🎬', label: 'Atuação' },
  { key: 'regeneration', emoji: '🌿', label: 'Regeneração' },
];

const TIERS = [
  { key: 'bronze', label: 'Bronze', range: 'R$20-100' },
  { key: 'silver', label: 'Silver', range: 'R$100-500' },
  { key: 'gold', label: 'Gold', range: 'R$500+' },
];

interface Props {
  onComplete: (data: { interests: string[]; tier: string }) => void;
}

export function OnboardingScreen({ onComplete }: Props) {
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedTier, setSelectedTier] = useState('bronze');

  const toggleCat = (key: string) => {
    setSelectedCats(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>O que te move?</Text>
        <Text style={styles.subtitle}>
          Selecione seus interesses pra personalizar seu feed
        </Text>

        <View style={styles.catGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.catChip, selectedCats.includes(cat.key) && styles.catChipActive]}
              onPress={() => toggleCat(cat.key)}
            >
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={[styles.catLabel, selectedCats.includes(cat.key) && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.tierTitle}>Qual seu tier de entrada?</Text>

        <View style={styles.tierRow}>
          {TIERS.map(tier => (
            <TouchableOpacity
              key={tier.key}
              style={[styles.tierCard, selectedTier === tier.key && styles.tierCardActive]}
              onPress={() => setSelectedTier(tier.key)}
            >
              <Text style={[styles.tierLabel, selectedTier === tier.key && styles.tierLabelActive]}>
                {tier.label}
              </Text>
              <Text style={styles.tierRange}>{tier.range}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.btnContinue, selectedCats.length === 0 && styles.btnDisabled]}
          onPress={() => onComplete({ interests: selectedCats, tier: selectedTier })}
          disabled={selectedCats.length === 0}
        >
          <Text style={styles.btnContinueText}>Começar →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 30, paddingTop: 80 },
  title: { fontSize: 24, fontWeight: '800', color: colors.stone, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 25 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 12, paddingHorizontal: 18,
    borderRadius: 20, borderWidth: 1, borderColor: colors.borderLight,
  },
  catChipActive: { backgroundColor: colors.green, borderColor: colors.green },
  catEmoji: { fontSize: 18 },
  catLabel: { fontSize: 14, color: colors.textSecondary },
  catLabelActive: { color: 'white', fontWeight: '600' },
  tierTitle: { fontSize: 14, color: colors.sage, textAlign: 'center', marginTop: 30, marginBottom: 12 },
  tierRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  tierCard: {
    paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12,
    borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center', minWidth: 90,
  },
  tierCardActive: { borderColor: colors.green, backgroundColor: colors.bgHighlight },
  tierLabel: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  tierLabelActive: { color: colors.green },
  tierRange: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  btnContinue: {
    backgroundColor: colors.green, padding: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 30,
  },
  btnDisabled: { opacity: 0.4 },
  btnContinueText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
