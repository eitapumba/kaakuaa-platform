// ============================================
// KAA KUAA — Shared Types
// ============================================

// --- User & Auth ---
export enum UserRole {
  PLAYER = 'player',
  CHALLENGER = 'challenger',
  REGENERATOR = 'regenerator',
  ADMIN = 'admin',
}

export enum UserRank {
  RECRUTA = 'recruta',         // Bronze — R$20-100
  GUARDIAO = 'guardiao',       // Prata — R$100-500
  MESTRE = 'mestre',           // Ouro — R$500-2000
  DIAMANTE = 'diamante',       // Diamante — R$2000-10000
  FUNDADOR = 'fundador',       // Fundador — R$10000+
}

// --- Challenges ---
export enum ChallengeCategory {
  SPORTS = 'sports',
  PERSONAL_EVOLUTION = 'personal_evolution',
  ESPORTS = 'esports',
  RAP_BATTLE = 'rap_battle',
  CULINARY = 'culinary',
  ACTING = 'acting',
  VISUAL_ARTS = 'visual_arts',
  CRAZY_RACE = 'crazy_race',
  REGENERATION = 'regeneration',
}

export enum ChallengeStatus {
  DRAFT = 'draft',             // Criado mas sem stake depositado
  OPEN = 'open',               // Stake depositado, aguardando oponente
  MATCHED = 'matched',         // Oponente aceitou, aguardando início
  ACTIVE = 'active',           // Em andamento
  PENDING_VERIFICATION = 'pending_verification', // Evidências submetidas
  UNDER_REVIEW = 'under_review', // Revisão humana
  COMPLETED = 'completed',     // Verificado e distribuído
  DISPUTED = 'disputed',       // Em disputa
  CANCELLED = 'cancelled',     // Cancelado antes de match
  EXPIRED = 'expired',         // Prazo expirou
}

export enum ChallengeType {
  ONE_VS_ONE = '1v1',          // Desafio entre 2 pessoas
  SOLO = 'solo',               // Desafio consigo mesmo (meta pessoal)
  GROUP = 'group',             // Desafio em grupo / guilda
  TOURNAMENT = 'tournament',   // Torneio com múltiplos participantes
}

export enum LeagueTier {
  BRONZE = 'bronze',           // R$20-100
  SILVER = 'silver',           // R$100-500
  GOLD = 'gold',               // R$500-2000
  DIAMOND = 'diamond',         // R$2000-10000
  FOUNDER = 'founder',         // R$10000+
}

// --- Verification ---
export enum VerificationMethod {
  PHOTO_GPS = 'photo_gps',           // Foto + GPS + timestamp
  LIVE_STREAM = 'live_stream',       // Stream ao vivo
  SCREEN_CAPTURE = 'screen_capture', // App desktop — game capture + OCR
  SCREEN_RECORDING = 'screen_recording', // Mobile — upload de gravação
  WEARABLE = 'wearable',             // Dados de wearable (Apple Health, Garmin)
  SOCIAL_VALIDATION = 'social_validation', // Validação por pares
  SATELLITE = 'satellite',           // NDVI + IoT (regeneração)
  PUBLIC_VOTING = 'public_voting',   // Votação pública (Jornada do Herói)
}

export enum VerificationStatus {
  PENDING = 'pending',
  ANALYZING = 'analyzing',
  APPROVED = 'approved',       // Score >= 85
  MANUAL_REVIEW = 'manual_review', // Score 60-85
  REJECTED = 'rejected',      // Score < 60
  APPEALED = 'appealed',
}

// --- VITA Economy ---
export enum VitaTransactionType {
  EARN_CHALLENGE = 'earn_challenge',
  EARN_GAME = 'earn_game',
  EARN_FIELD_MISSION = 'earn_field_mission',
  EARN_VOTE = 'earn_vote',
  EARN_STREAK = 'earn_streak',
  EARN_REFERRAL = 'earn_referral',
  EARN_WELCOME = 'earn_welcome',
  SPEND_VOTE = 'spend_vote',
  SPEND_MARKETPLACE = 'spend_marketplace',
  SPEND_COSMETIC = 'spend_cosmetic',
  SPEND_EVENT = 'spend_event',
  SPEND_BOOST = 'spend_boost',
  BURN = 'burn',               // 20% burn on spend
  DECAY = 'decay',             // 5% decay per 90 days inactive
  INVEST = 'invest',           // Investimento em player
  INVESTMENT_RETURN = 'investment_return', // Retorno de investimento
  TRANSFER = 'transfer',
}

// --- Payments ---
export enum PaymentStatus {
  PENDING = 'pending',
  HELD_IN_ESCROW = 'held_in_escrow',
  RELEASED_TO_WINNER = 'released_to_winner',
  SENT_TO_FUND = 'sent_to_fund',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

// --- Player Investment ---
export enum InvestmentContractType {
  CHALLENGE_SHARE = 'challenge_share',     // % das vitórias em desafios
  CONTENT_ROYALTY = 'content_royalty',      // Royalties de views
  EXPERIENCE_ACCESS = 'experience_access', // Acesso a experiências
  MIXED = 'mixed',                         // Combinação
}

export enum InvestmentStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',    // Prazo expirou
  CANCELLED = 'cancelled',
}

// --- Marketplace ---
export enum ProductCategory {
  BEVERAGE = 'beverage',           // Bebidas naturais
  PHARMACY = 'pharmacy',           // Farmácia natural
  COSMETIC = 'cosmetic',          // Cosméticos
  EQUIPMENT = 'equipment',        // Equipamento
  EXPERIENCE = 'experience',      // Spas, clubes, retiros
  SUBSCRIPTION = 'subscription',  // Planos mensais
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

// --- Jornada do Herói (Hero's Journey) ---
export enum JourneyStatus {
  RECRUITING = 'recruiting',       // Buscando participantes para próximo estágio
  STAGE_ACTIVE = 'stage_active',   // Estágio atual em andamento
  VOTING = 'voting',               // Votação pública no estágio atual
  BETWEEN_STAGES = 'between_stages', // Transição entre estágios
  COMPLETED = 'completed',         // Todos os estágios finalizados — curta-metragem pronto
  CANCELLED = 'cancelled',
}

export enum JourneyStageType {
  SCREENPLAY = 'screenplay',           // Batalha de Roteiro
  STORYBOARD = 'storyboard',           // Batalha de Storyboard
  CINEMATOGRAPHY = 'cinematography',   // Batalha de Direção de Fotografia
  SOUNDTRACK = 'soundtrack',           // Batalha de Trilha Sonora
  ACTING = 'acting',                   // Batalha de Atuação
}

export enum JourneyStageStatus {
  PENDING = 'pending',             // Aguardando estágio anterior
  OPEN = 'open',                   // Aceitando participantes
  ACTIVE = 'active',               // Desafio em andamento
  VOTING = 'voting',               // Período de votação pública
  COMPLETED = 'completed',         // Vencedor decidido
  CANCELLED = 'cancelled',
}

export enum SubmissionType {
  TEXT = 'text',                   // Texto digitado no app (Roteiro)
  VIDEO = 'video',                 // Upload de vídeo (Roteiro storytelling, Cinematografia, Atuação)
  IMAGE = 'image',                 // Upload de imagem/desenho (Storyboard)
  AUDIO = 'audio',                 // Upload de áudio (Trilha Sonora)
}

// Configuração de cada tipo de estágio da Jornada
export const JOURNEY_STAGE_CONFIG: Record<JourneyStageType, {
  order: number;
  name: string;
  description: string;
  submissionTypes: SubmissionType[];
  maxParticipants: number;
  votingDurationHours: number;
  objectives: string[];
}> = {
  [JourneyStageType.SCREENPLAY]: {
    order: 1,
    name: 'Batalha de Roteiro',
    description: 'Escreva ou narre a história que será a base do curta-metragem',
    submissionTypes: [SubmissionType.TEXT, SubmissionType.VIDEO],
    maxParticipants: 8,
    votingDurationHours: 48,
    objectives: [
      'Criar um roteiro original de 3-5 minutos',
      'Incluir início, meio e fim claros',
      'Definir pelo menos 2 personagens',
      'Descrever cenário principal',
      'Opção A: Digitar roteiro no app | Opção B: Vídeo narrando a história (max 5min)',
    ],
  },
  [JourneyStageType.STORYBOARD]: {
    order: 2,
    name: 'Batalha de Storyboard',
    description: 'Visualize as cenas do roteiro vencedor em quadros ilustrados',
    submissionTypes: [SubmissionType.IMAGE],
    maxParticipants: 8,
    votingDurationHours: 48,
    objectives: [
      'Criar mínimo 8 quadros de storyboard',
      'Seguir fielmente o roteiro vencedor',
      'Incluir enquadramento e ângulos de câmera',
      'Indicar movimentos e transições entre cenas',
      'Pode ser desenhado à mão, digital ou com IA de imagem',
    ],
  },
  [JourneyStageType.CINEMATOGRAPHY]: {
    order: 3,
    name: 'Batalha de Direção de Fotografia',
    description: 'Filme as cenas seguindo o storyboard vencedor',
    submissionTypes: [SubmissionType.VIDEO],
    maxParticipants: 4,
    votingDurationHours: 72,
    objectives: [
      'Gravar as cenas conforme o storyboard vencedor',
      'Aplicar técnicas de iluminação e enquadramento',
      'Duração: 3-5 minutos de material bruto',
      'Incluir pelo menos 3 ângulos diferentes',
      'Upload de vídeo (sem edição de som final)',
    ],
  },
  [JourneyStageType.SOUNDTRACK]: {
    order: 4,
    name: 'Batalha de Trilha Sonora',
    description: 'Crie a trilha sonora e efeitos de som para o material filmado',
    submissionTypes: [SubmissionType.AUDIO],
    maxParticipants: 6,
    votingDurationHours: 48,
    objectives: [
      'Compor trilha original que acompanhe o vídeo',
      'Incluir efeitos sonoros para cenas-chave',
      'Duração compatível com o vídeo filmado',
      'Pode usar instrumentos reais, digitais ou IA',
      'Upload de arquivo de áudio (MP3/WAV)',
    ],
  },
  [JourneyStageType.ACTING]: {
    order: 5,
    name: 'Batalha de Atuação',
    description: 'Atue as cenas do roteiro e finalize o curta-metragem',
    submissionTypes: [SubmissionType.VIDEO],
    maxParticipants: 4,
    votingDurationHours: 72,
    objectives: [
      'Atuar seguindo o roteiro vencedor',
      'Integrar com a direção de fotografia vencedora',
      'Usar a trilha sonora vencedora como base',
      'Produzir versão final do curta (3-5 min)',
      'Upload de vídeo editado completo',
    ],
  },
};

// --- Content / TV ---
export enum ContentType {
  CHALLENGE_CLIP = 'challenge_clip',
  CHALLENGE_STREAM = 'challenge_stream',
  TV_EPISODE = 'tv_episode',
  FIELD_MISSION = 'field_mission',
  USER_GENERATED = 'user_generated',
}

// --- Financial Split Constants ---
export const SPLIT = {
  WINNER: 0.70,         // 70% do pool vai pro vencedor
  FUND: 0.30,           // 30% vai pro Fundo de Regeneração
  FEE: 0.15,            // 15% de taxa sobre os 70% do vencedor → receita Kaa Kuaa
  WINNER_NET: 0.595,    // 59.5% — o que o vencedor realmente recebe (70% - 15% de 70%)
  KAAKUAA_NET: 0.105,   // 10.5% — receita líquida da Kaa Kuaa
} as const;
