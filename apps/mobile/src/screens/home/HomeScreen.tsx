import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, RefreshControl,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { challengesApi } from '../../api/client';
import { CategoryCard } from '../../components/challenge/CategoryCard';
import { ActiveChallengeBar } from '../../components/challenge/ActiveChallengeBar';

const CATEGORIES = [
  { key: 'sports', emoji: '🏋️', label: 'Sports', gradient: colors.categories.sports },
  { key: 'esports', emoji: '🎮', label: 'E-Sports', gradient: colors.categories.esports },
  { key: 'personal_evolution', emoji: '🧠', label: 'Evolução', gradient: colors.categories.evolution },
  { key: 'regeneration', emoji: '🌿', label: 'Regeneração', gradient: colors.categories.regeneration },
  { key: 'rap_battle', emoji: '🎤', label: 'Rap Battle', gradient: colors.categories.rap_battle },
  { key: 'culinary', emoji: '🍳', label: 'Culinária', gradient: colors.categories.culinary },
];

interface Props {
  onSelectCategory: (category: string) => void;
  onGoToActiveChallenge: (challengeId: string) => void;
}

export function HomeScreen({ onSelectCategory, onGoToActiveChallenge }: Props) {
  const { user, refreshUser } = useAuth();
  const [onlineStats, setOnlineStats] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const { data } = await challengesApi.matchmakingStats();
      setOnlineStats(data);
      // Check for active challenges
      const { data: myChallenges } = await challengesApi.getMyChallenges('active');
      if (myChallenges?.length > 0) {
        setActiveChallengeId(myChallenges[0].challenge?.id);
      }
    } catch {}
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadData(), refreshUser()]);
    setRefreshing(false);
  };

  const getOnlineCount = (category: string) => {
    // Sum all tiers for this category
    let total = 0;
    for (const [key, count] of Object.entries(onlineStats)) {
      if (key.startsWith(category)) total += count;
    }
    return total + Math.floor(Math.random() * 30) + 5; // Base + queue (MVP mock)
  };

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getTimeGreeting()}</Text>
            <Text style={styles.userName}>
              {user?.displayName} {user?.currentStreak ? `🔥 ${user.currentStreak} dias` : ''}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0)?.toUpperCase() || 'K'}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.vitaBalance?.toLocaleString() || '0'}</Text>
            <Text style={styles.statLabel}>VITA</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {user?.challengesWon || 0}-{(user?.challengesCompleted || 0) - (user?.challengesWon || 0)}
            </Text>
            <Text style={styles.statLabel}>W-L</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              R${user?.totalEarnings?.toLocaleString() || '0'}
            </Text>
            <Text style={styles.statLabel}>Ganhos</Text>
          </View>
        </View>

        {/* Active Challenge Bar */}
        {activeChallengeId && (
          <ActiveChallengeBar
            challengeId={activeChallengeId}
            onPress={() => onGoToActiveChallenge(activeChallengeId)}
          />
        )}

        {/* Category Cards */}
        <View style={styles.catGrid}>
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat.key}
              emoji={cat.emoji}
              label={cat.label}
              gradient={cat.gradient}
              onlineCount={getOnlineCount(cat.key)}
              onPress={() => onSelectCategory(cat.key)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingBottom: 100 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15,
  },
  greeting: { fontSize: 13, color: colors.textSecondary },
  userName: { fontSize: 20, fontWeight: '800', color: colors.stone, marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: 'white', fontWeight: '700', fontSize: 18 },
  statsRow: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 15,
  },
  statCard: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: 12, padding: 12, alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.green },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    paddingHorizontal: 16, marginTop: 5,
  },
});
