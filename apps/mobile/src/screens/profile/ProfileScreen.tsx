import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export function ProfileScreen() {
  const { user, logout } = useAuth();

  const winRate = user?.challengesCompleted
    ? Math.round(((user?.challengesWon || 0) / user.challengesCompleted) * 100)
    : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Avatar & Name */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.displayName?.charAt(0)?.toUpperCase() || 'K'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.rank}>🎖️ {user?.rank || 'Recruta'}</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user?.challengesCompleted || 0}</Text>
          <Text style={styles.statLabel}>Desafios</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user?.challengesWon || 0}</Text>
          <Text style={styles.statLabel}>Vitórias</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{user?.currentStreak || 0}🔥</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      {/* VITA Balance */}
      <View style={styles.vitaCard}>
        <Text style={styles.vitaLabel}>Saldo VITA</Text>
        <Text style={styles.vitaBalance}>{user?.vitaBalance?.toLocaleString() || '0'}</Text>
        <Text style={styles.vitaSub}>
          Total ganho: {user?.vitaBalance?.toLocaleString() || '0'} VITA
        </Text>
      </View>

      {/* Earnings */}
      <View style={styles.earningsCard}>
        <Text style={styles.vitaLabel}>Ganhos Totais</Text>
        <Text style={[styles.vitaBalance, { color: colors.green }]}>
          R$ {user?.totalEarnings?.toLocaleString() || '0'}
        </Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>📊 Meus Investimentos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>📦 Meus Pedidos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>💳 Pagamentos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>⚙️ Configurações</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingTop: 60, paddingBottom: 100 },
  profileSection: { alignItems: 'center', marginBottom: 25 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: 'white', fontWeight: '800', fontSize: 32 },
  name: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: 12 },
  rank: { fontSize: 14, color: colors.stone, marginTop: 4 },
  statsGrid: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20,
  },
  statBox: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: 12, padding: 14, alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  vitaCard: {
    backgroundColor: colors.bgCard, borderRadius: 16, padding: 20,
    marginHorizontal: 20, marginBottom: 12, alignItems: 'center',
  },
  vitaLabel: { fontSize: 13, color: colors.textSecondary },
  vitaBalance: { fontSize: 32, fontWeight: '900', color: colors.stone, marginTop: 5 },
  vitaSub: { fontSize: 12, color: colors.textMuted, marginTop: 5 },
  earningsCard: {
    backgroundColor: colors.bgCard, borderRadius: 16, padding: 20,
    marginHorizontal: 20, marginBottom: 20, alignItems: 'center',
  },
  menu: { paddingHorizontal: 20 },
  menuItem: {
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  menuText: { fontSize: 15, color: colors.textPrimary },
  logoutBtn: {
    marginHorizontal: 20, marginTop: 20, padding: 14,
    borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, alignItems: 'center',
  },
  logoutText: { color: colors.live, fontSize: 15, fontWeight: '600' },
});
