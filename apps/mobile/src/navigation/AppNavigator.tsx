import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { challengesApi } from '../api/client';
import { colors } from '../theme/colors';

// Auth Screens
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

// Main Screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { StakeScreen } from '../screens/challenge/StakeScreen';
import { SearchingScreen } from '../screens/challenge/SearchingScreen';
import { MatchScreen } from '../screens/challenge/MatchScreen';
import { LiveChallengeScreen } from '../screens/challenge/LiveChallengeScreen';

// Tab Screens
import { TVScreen } from '../screens/tv/TVScreen';
import { InvestScreen } from '../screens/invest/InvestScreen';
import { MarketplaceScreen } from '../screens/marketplace/MarketplaceScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

type Screen =
  | 'welcome' | 'onboarding'
  | 'home' | 'stake' | 'searching' | 'match' | 'live'
  | 'tv' | 'invest' | 'marketplace' | 'profile';

export function AppNavigator() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { matchData, searchingData, challengeStarted, resetMatch } = useSocket(user?.id || null);

  const [screen, setScreen] = useState<Screen>('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStake, setSelectedStake] = useState(0);
  const [currentChallengeId, setCurrentChallengeId] = useState('');

  // --- Auth Flow ---
  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashLogo}>KAA KUAA</Text>
        <Text style={styles.splashSub}>Carregando...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <WelcomeScreen
      onLogin={() => {}} // TODO: Login form
      onRegister={() => setScreen('onboarding' as any)}
      onGoogleLogin={() => {}} // TODO: Google OAuth
      onAppleLogin={() => {}} // TODO: Apple Sign In
    />;
  }

  // --- React to WebSocket events ---
  // When match is found while searching
  if (matchData && screen === 'searching') {
    // Auto-transition to match screen
    setTimeout(() => {
      setCurrentChallengeId(matchData.challengeId);
      setScreen('match');
    }, 0);
  }

  // When challenge starts after countdown
  if (challengeStarted && screen === 'match') {
    setTimeout(() => setScreen('live'), 0);
  }

  // --- Challenge Flow ---
  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
    setScreen('stake');
  }, []);

  const handleSearch = useCallback(async (stakeAmount: number, preferLive: boolean) => {
    setSelectedStake(stakeAmount);
    setScreen('searching');
    try {
      const { data } = await challengesApi.joinMatchmaking({
        category: selectedCategory,
        stakeAmount,
        preferLive,
      });
      if (data.status === 'matched' && data.challenge) {
        setCurrentChallengeId(data.challenge.id);
        setScreen('match');
      }
    } catch (err) {
      setScreen('stake'); // Go back on error
    }
  }, [selectedCategory]);

  const handleCancelSearch = useCallback(async () => {
    try {
      await challengesApi.leaveMatchmaking(selectedCategory);
    } catch {}
    setScreen('stake');
  }, [selectedCategory]);

  const handleCountdownComplete = useCallback(() => {
    setScreen('live');
  }, []);

  const handleEndChallenge = useCallback(() => {
    resetMatch();
    setScreen('home');
  }, [resetMatch]);

  const goHome = useCallback(() => {
    resetMatch();
    setScreen('home');
  }, [resetMatch]);

  // --- Render current screen ---
  const renderScreen = () => {
    switch (screen) {
      case 'stake':
        return (
          <StakeScreen
            category={selectedCategory}
            onlineCount={42}
            onSearch={handleSearch}
            onBack={goHome}
          />
        );

      case 'searching':
        return (
          <SearchingScreen
            category={selectedCategory}
            stakeAmount={selectedStake}
            tier={searchingData?.tier || 'silver'}
            estimatedWait={searchingData?.estimatedWait || 15}
            queuePosition={searchingData?.queuePosition || 1}
            onCancel={handleCancelSearch}
          />
        );

      case 'match':
        if (!matchData) return null;
        return (
          <MatchScreen
            opponent={matchData.opponent}
            challengeId={matchData.challengeId}
            onCountdownComplete={handleCountdownComplete}
          />
        );

      case 'live':
        return (
          <LiveChallengeScreen
            challengeId={currentChallengeId}
            challengeTitle="Desafio"
            poolAmount={selectedStake * 2}
            opponentName={matchData?.opponent?.displayName || 'Oponente'}
            onEnd={handleEndChallenge}
          />
        );

      case 'tv': return <TVScreen />;
      case 'invest': return <InvestScreen />;
      case 'marketplace': return <MarketplaceScreen />;
      case 'profile': return <ProfileScreen />;

      default:
        return (
          <HomeScreen
            onSelectCategory={handleSelectCategory}
            onGoToActiveChallenge={(id) => {
              setCurrentChallengeId(id);
              setScreen('live');
            }}
          />
        );
    }
  };

  // Screens where tab bar should NOT show
  const hideTabBar = ['stake', 'searching', 'match', 'live'].includes(screen);

  return (
    <View style={styles.container}>
      {renderScreen()}

      {/* Tab Bar */}
      {!hideTabBar && (
        <View style={styles.tabBar}>
          <TabItem icon="⚔️" label="Desafios" active={screen === 'home'} onPress={() => setScreen('home')} />
          <TabItem icon="📺" label="TV" active={screen === 'tv'} onPress={() => setScreen('tv')} />
          <TabItem icon="📊" label="Invest" active={screen === 'invest'} onPress={() => setScreen('invest')} />
          <TabItem icon="🛒" label="Loja" active={screen === 'marketplace'} onPress={() => setScreen('marketplace')} />
          <TabItem icon="👤" label="Perfil" active={screen === 'profile'} onPress={() => setScreen('profile')} />
        </View>
      )}
    </View>
  );
}

function TabItem({ icon, label, active, onPress }: {
  icon: string; label: string; active: boolean; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tab} onPress={onPress}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  splash: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  splashLogo: { fontSize: 36, fontWeight: '800', color: colors.stone, letterSpacing: 3 },
  splashSub: { fontSize: 14, color: colors.textSecondary, marginTop: 10 },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.bg,
    borderTopWidth: 1, borderTopColor: colors.border,
    paddingBottom: 30, paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 10, color: colors.textMuted, marginTop: 3 },
  tabLabelActive: { color: colors.green, fontWeight: '600' },
});
