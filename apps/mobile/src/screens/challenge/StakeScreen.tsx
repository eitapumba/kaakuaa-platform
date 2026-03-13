import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { SPLIT } from '../../utils/constants';

const STAKE_OPTIONS = [
  { amount: 20, tier: 'Bronze' },
  { amount: 50, tier: 'Bronze' },
  { amount: 200, tier: 'Silver' },
  { amount: 500, tier: 'Gold' },
  { amount: 2000, tier: 'Diamond' },
];

const CATEGORY_INFO: Record<string, { emoji: string; label: string }> = {
  sports: { emoji: '🏋️', label: 'Sports' },
  esports: { emoji: '🎮', label: 'E-Sports' },
  personal_evolution: { emoji: '🧠', label: 'Evolução Pessoal' },
  regeneration: { emoji: '🌿', label: 'Regeneração' },
  rap_battle: { emoji: '🎤', label: 'Rap Battle' },
  culinary: { emoji: '🍳', label: 'Culinária' },
  acting: { emoji: '🎬', label: 'Atuação' },
  visual_arts: { emoji: '🎨', label: 'Artes Visuais' },
  crazy_race: { emoji: '🏎️', label: 'Corrida Maluca' },
};

interface Props {
  category: string;
  onlineCount: number;
  onSearch: (stakeAmount: number, preferLive: boolean) => void;
  onBack: () => void;
}

export function StakeScreen({ category, onlineCount, onSearch, onBack }: Props) {
  const [selectedStake, setSelectedStake] = useState(200);
  const [preferLive, setPreferLive] = useState(true);
  const info = CATEGORY_INFO[category] || { emoji: '⚔️', label: category };

  const poolTotal = selectedStake * 2;
  const winnerReceives = poolTotal * SPLIT.WINNER_NET;
  const fundAmount = poolTotal * SPLIT.FUND;
  const vitaBonus = Math.floor(selectedStake * 0.75);

  const handleSelectStake = (amount: number) => {
    setSelectedStake(amount);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSearch(selectedStake, preferLive);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>

        {/* Category Header */}
        <View style={styles.catHeader}>
          <Text style={styles.catEmoji}>{info.emoji}</Text>
          <Text style={styles.catLabel}>{info.label}</Text>
          <Text style={styles.catOnline}>{onlineCount} jogadores buscando agora</Text>
        </View>

        {/* Stake Selection */}
        <Text style={styles.sectionLabel}>Quanto quer apostar?</Text>
        <View style={styles.stakeRow}>
          {STAKE_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.amount}
              style={[styles.stakeOpt, selectedStake === opt.amount && styles.stakeOptActive]}
              onPress={() => handleSelectStake(opt.amount)}
            >
              <Text style={[styles.stakeAmount, selectedStake === opt.amount && styles.stakeAmountActive]}>
                {opt.amount >= 1000 ? `R$${opt.amount / 1000}k` : `R$${opt.amount}`}
              </Text>
              <Text style={styles.stakeTier}>{opt.tier}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live Toggle */}
        <View style={styles.liveToggle}>
          <View>
            <Text style={styles.liveTitle}>📺 Desafio ao vivo</Text>
            <Text style={styles.liveSub}>Câmera liga quando match acontece</Text>
          </View>
          <Switch
            value={preferLive}
            onValueChange={setPreferLive}
            trackColor={{ false: '#333', true: colors.green }}
            thumbColor="white"
          />
        </View>

        {/* Payout Preview */}
        <View style={styles.payoutCard}>
          <Text style={styles.payoutTitle}>Se você vencer:</Text>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>Pool total</Text>
            <Text style={styles.payoutValue}>R$ {poolTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>Você recebe (59.5%)</Text>
            <Text style={[styles.payoutValue, styles.payoutGreen]}>R$ {winnerReceives.toFixed(2)}</Text>
          </View>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>Fundo Regeneração (30%)</Text>
            <Text style={styles.payoutValue}>R$ {fundAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.payoutRow}>
            <Text style={styles.payoutLabel}>VITA Bonus</Text>
            <Text style={[styles.payoutValue, styles.payoutGreen]}>+{vitaBonus} VITA</Text>
          </View>
        </View>

        {/* Search Button */}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>
            🔍 Buscar Desafiante — R${selectedStake}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingTop: 60 },
  backBtn: { color: colors.textSecondary, fontSize: 15, marginBottom: 20 },
  catHeader: { alignItems: 'center', marginBottom: 30 },
  catEmoji: { fontSize: 48 },
  catLabel: { fontSize: 24, fontWeight: '800', color: colors.stone, marginTop: 8 },
  catOnline: { fontSize: 13, color: colors.textSecondary, marginTop: 5 },
  sectionLabel: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 12 },
  stakeRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 },
  stakeOpt: {
    paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12,
    borderWidth: 2, borderColor: colors.borderLight, alignItems: 'center', minWidth: 70,
  },
  stakeOptActive: { borderColor: colors.green, backgroundColor: colors.bgHighlight },
  stakeAmount: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  stakeAmountActive: { color: colors.green },
  stakeTier: { fontSize: 10, color: colors.textMuted, marginTop: 3 },
  liveToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.bgCard, padding: 16, borderRadius: 14, marginBottom: 15,
  },
  liveTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  liveSub: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  payoutCard: { backgroundColor: colors.bgCard, borderRadius: 14, padding: 16, marginBottom: 25 },
  payoutTitle: { fontSize: 13, color: colors.textSecondary, marginBottom: 10 },
  payoutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  payoutLabel: { fontSize: 13, color: colors.textMuted },
  payoutValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '600' },
  payoutGreen: { color: colors.green },
  searchBtn: {
    backgroundColor: colors.green, padding: 18, borderRadius: 16, alignItems: 'center',
  },
  searchBtnText: { color: 'white', fontSize: 17, fontWeight: '800' },
});
