const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

async function fetchAPI(path: string, options?: RequestInit) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.message || `API Error: ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  register: (data: { email: string; password: string; displayName: string }) =>
    fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  googleAuth: (data: { googleId: string; email: string; displayName: string }) =>
    fetchAPI('/auth/google', { method: 'POST', body: JSON.stringify(data) }),

  refreshToken: (refreshToken: string) =>
    fetchAPI('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  // Users
  getMe: () => fetchAPI('/users/me'),
  updateMe: (data: Partial<{ displayName: string; avatarUrl: string }>) =>
    fetchAPI('/users/me', { method: 'PUT', body: JSON.stringify(data) }),
  getLeaderboard: () => fetchAPI('/users/leaderboard'),
  getProfile: (id: string) => fetchAPI(`/users/${id}/profile`),

  // Challenges
  getFeed: (category?: string) =>
    fetchAPI(`/challenges/feed${category ? `?category=${category}` : ''}`),
  getChallenge: (id: string) => fetchAPI(`/challenges/${id}`),
  getMyChallenges: () => fetchAPI('/challenges/my'),

  // Matchmaking
  joinMatchmaking: (data: { category: string; stakeAmount: number; preferLive?: boolean }) =>
    fetchAPI('/challenges/matchmaking/join', { method: 'POST', body: JSON.stringify(data) }),
  leaveMatchmaking: (category: string) =>
    fetchAPI('/challenges/matchmaking/leave', { method: 'DELETE', body: JSON.stringify({ category }) }),
  getMatchmakingStats: () => fetchAPI('/challenges/matchmaking/stats'),

  // Challenge actions
  startChallenge: (id: string) =>
    fetchAPI(`/challenges/${id}/start`, { method: 'POST' }),
  submitEvidence: (id: string, evidence: any) =>
    fetchAPI(`/challenges/${id}/evidence`, { method: 'POST', body: JSON.stringify(evidence) }),

  // VITA
  getBalance: () => fetchAPI('/vita/balance'),
  getVitaHistory: () => fetchAPI('/vita/history'),

  // Investments
  invest: (data: { playerId: string; amount: number; contractType: string }) =>
    fetchAPI('/investments', { method: 'POST', body: JSON.stringify(data) }),
  getMyInvestments: () => fetchAPI('/investments/my'),

  // Jornada do Herói
  getJourneys: (tier?: string) =>
    fetchAPI(`/journeys${tier ? `?tier=${tier}` : ''}`),
  getJourney: (id: string) => fetchAPI(`/journeys/${id}`),
  getMyJourneys: () => fetchAPI('/journeys/my'),
  createJourney: (data: { title?: string; description?: string; tier: string; stakePerStage: number }) =>
    fetchAPI('/journeys', { method: 'POST', body: JSON.stringify(data) }),
  joinJourneyStage: (journeyId: string, stageId: string) =>
    fetchAPI(`/journeys/${journeyId}/stages/${stageId}/join`, { method: 'POST' }),
  startJourneyStage: (journeyId: string, stageId: string) =>
    fetchAPI(`/journeys/${journeyId}/stages/${stageId}/start`, { method: 'POST' }),
  submitJourneyWork: (journeyId: string, stageId: string, data: { type: string; url?: string; text?: string; metadata?: any }) =>
    fetchAPI(`/journeys/${journeyId}/stages/${stageId}/submit`, { method: 'POST', body: JSON.stringify(data) }),
  getStageSubmissions: (journeyId: string, stageId: string) =>
    fetchAPI(`/journeys/${journeyId}/stages/${stageId}/submissions`),
  voteJourneyStage: (journeyId: string, stageId: string, data: { participantId: string; vitaAmount?: number }) =>
    fetchAPI(`/journeys/${journeyId}/stages/${stageId}/vote`, { method: 'POST', body: JSON.stringify(data) }),
  getStageResults: (journeyId: string, stageId: string) =>
    fetchAPI(`/journeys/${journeyId}/stages/${stageId}/results`),
  completeJourneyStage: (journeyId: string, stageId: string) =>
    fetchAPI(`/journeys/${journeyId}/stages/${stageId}/complete`, { method: 'POST' }),

  // Content
  getFeatured: () => fetchAPI('/content/featured'),

  // Marketplace
  getProducts: (category?: string) =>
    fetchAPI(`/marketplace/products${category ? `?category=${category}` : ''}`),
  createOrder: (data: { productId: string; paymentMethod: string }) =>
    fetchAPI('/marketplace/orders', { method: 'POST', body: JSON.stringify(data) }),
};
