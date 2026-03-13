import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
  StatusBar, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

interface Props {
  onLogin: () => void;
  onRegister: () => void;
  onGoogleLogin: () => void;
  onAppleLogin: () => void;
}

export function WelcomeScreen({ onLogin, onRegister, onGoogleLogin, onAppleLogin }: Props) {
  return (
    <LinearGradient colors={[colors.earth, '#0a0a0a']} style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.logoSection}>
        <Text style={styles.logo}>KAA KUAA</Text>
        <Text style={styles.tagline}>Desafie-se. Regenere o planeta.</Text>
      </View>

      <View style={styles.buttonsSection}>
        <TouchableOpacity style={styles.btnGoogle} onPress={onGoogleLogin}>
          <Text style={styles.btnGoogleText}>Entrar com Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnApple} onPress={onAppleLogin}>
          <Text style={styles.btnAppleText}> Entrar com Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnEmail} onPress={onRegister}>
          <Text style={styles.btnEmailText}>Criar conta com email</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onLogin}>
          <Text style={styles.loginLink}>Já tenho conta → Entrar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: 50 },
  logoSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: '800', color: colors.stone, letterSpacing: 3 },
  tagline: { fontSize: 16, color: colors.sage, marginTop: 10, textAlign: 'center' },
  buttonsSection: { paddingHorizontal: 30, gap: 12 },
  btnGoogle: {
    backgroundColor: colors.green,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnGoogleText: { color: 'white', fontSize: 16, fontWeight: '700' },
  btnApple: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnAppleText: { color: 'white', fontSize: 16, fontWeight: '700' },
  btnEmail: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  btnEmailText: { color: colors.sage, fontSize: 16, fontWeight: '600' },
  loginLink: {
    color: colors.green,
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
});
