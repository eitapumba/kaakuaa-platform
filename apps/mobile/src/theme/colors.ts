export const colors = {
  // Core brand
  stone: '#E2C2A2',
  sage: '#CCD5AE',
  earth: '#3D2B1F',
  green: '#4A7C59',
  greenLight: '#6aac79',

  // Backgrounds
  bg: '#0a0a0a',
  bgCard: '#111111',
  bgElevated: '#1a1a1a',
  bgHighlight: '#1a2e1a',

  // Text
  textPrimary: '#f0ece4',
  textSecondary: '#999999',
  textMuted: '#666666',

  // UI
  border: '#222222',
  borderLight: '#333333',

  // Status
  live: '#ef4444',
  success: '#4ADE80',
  warning: '#f59e0b',
  error: '#ef4444',

  // Category gradients
  categories: {
    sports: ['#1e40af', '#3b82f6'],
    esports: ['#7c3aed', '#a78bfa'],
    evolution: ['#b45309', '#f59e0b'],
    regeneration: ['#166534', '#4A7C59'],
    rap_battle: ['#991b1b', '#ef4444'],
    culinary: ['#92400e', '#d97706'],
    acting: ['#4c1d95', '#8b5cf6'],
    visual_arts: ['#831843', '#ec4899'],
    crazy_race: ['#0f766e', '#14b8a6'],
  } as Record<string, string[]>,
} as const;
