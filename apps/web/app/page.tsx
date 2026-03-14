'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/auth-context'
import { useSocket } from '../lib/use-socket'
import { api } from '../lib/api'

/* ═══════════════════════════════════════
   SUBCATEGORIES & CHALLENGE MODES
   ═══════════════════════════════════════ */

interface Subcategory {
  key: string
  emoji: string
  label: string
  desc: string
}

// Mecânicas de cada subcategoria — o que o desafio precisa
interface ChallengeMechanics {
  camera: boolean        // Câmera do competidor ligada
  screenRec: boolean     // Gravação de tela do celular/PC
  theme: boolean         // Tema sorteado antes do desafio
  timerMinutes: number   // Timer em minutos (0 = sem timer fixo)
  uploadResult: boolean  // Competidor sobe resultado final
  aiJudge: boolean       // IA analisa o resultado
  viewerJudge: boolean   // Espectadores votam no vencedor
  tools?: string[]       // Ferramentas permitidas/integradas
}

// Mecânicas padrão por subcategoria
const CHALLENGE_MECHANICS: Record<string, ChallengeMechanics> = {
  // ─── Jornada do Herói ───
  roteiro:         { camera: true, screenRec: true, theme: true, timerMinutes: 30, uploadResult: true, aiJudge: true, viewerJudge: true, tools: ['Texto livre', 'Google Docs', 'Notas'] },
  atuacao:         { camera: true, screenRec: false, theme: true, timerMinutes: 10, uploadResult: false, aiJudge: true, viewerJudge: true },
  direcao:         { camera: true, screenRec: true, theme: true, timerMinutes: 60, uploadResult: true, aiJudge: true, viewerJudge: true },
  edicao:          { camera: true, screenRec: true, theme: false, timerMinutes: 30, uploadResult: true, aiJudge: true, viewerJudge: true, tools: ['CapCut', 'Premiere', 'Final Cut', 'DaVinci'] },
  documentario:    { camera: true, screenRec: true, theme: true, timerMinutes: 45, uploadResult: true, aiJudge: true, viewerJudge: true },
  animacao:        { camera: true, screenRec: true, theme: true, timerMinutes: 30, uploadResult: true, aiJudge: true, viewerJudge: true, tools: ['Mão livre', 'Procreate', 'Photoshop', 'Illustrator', 'IA Generativa'] },
  fotografia_cine: { camera: true, screenRec: false, theme: true, timerMinutes: 20, uploadResult: true, aiJudge: true, viewerJudge: true },
  trilha_sonora:   { camera: true, screenRec: true, theme: true, timerMinutes: 20, uploadResult: true, aiJudge: true, viewerJudge: true, tools: ['Instrumentos', 'Beatbox → IA', 'GarageBand', 'Suno AI'] },
  vlog_challenge:  { camera: true, screenRec: false, theme: true, timerMinutes: 15, uploadResult: true, aiJudge: true, viewerJudge: true },
  podcast:         { camera: true, screenRec: false, theme: true, timerMinutes: 20, uploadResult: false, aiJudge: true, viewerJudge: true },
  // ─── Sports ───
  futebol:  { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  basquete: { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  tenis:    { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  natacao:  { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  corrida:  { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  mma:      { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  crossfit: { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  surf:     { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  skate:    { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  ciclismo: { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  volei:    { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  ginastica:{ camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  // ─── E-Sports ───
  fifa:           { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  lol:            { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  valorant:       { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  cs2:            { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  fortnite:       { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  rocket_league:  { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  street_fighter: { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  tekken:         { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  apex:           { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  cod:            { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  chess:          { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: false },
  mario_kart:     { camera: true, screenRec: true, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  // ─── Artes ───
  desenho:     { camera: true, screenRec: true, theme: true, timerMinutes: 20, uploadResult: true, aiJudge: true, viewerJudge: true, tools: ['Mão livre', 'Procreate', 'Photoshop', 'IA Generativa'] },
  pintura:     { camera: true, screenRec: false, theme: true, timerMinutes: 30, uploadResult: true, aiJudge: true, viewerJudge: true },
  fotografia:  { camera: true, screenRec: false, theme: true, timerMinutes: 15, uploadResult: true, aiJudge: true, viewerJudge: true },
  musica:      { camera: true, screenRec: false, theme: true, timerMinutes: 15, uploadResult: false, aiJudge: true, viewerJudge: true },
  danca:       { camera: true, screenRec: false, theme: true, timerMinutes: 5, uploadResult: false, aiJudge: true, viewerJudge: true },
  grafite:     { camera: true, screenRec: false, theme: true, timerMinutes: 30, uploadResult: true, aiJudge: true, viewerJudge: true },
  poesia:      { camera: true, screenRec: true, theme: true, timerMinutes: 15, uploadResult: true, aiJudge: true, viewerJudge: true },
  escultura:   { camera: true, screenRec: false, theme: true, timerMinutes: 30, uploadResult: true, aiJudge: true, viewerJudge: true },
  digital_art: { camera: true, screenRec: true, theme: true, timerMinutes: 20, uploadResult: true, aiJudge: true, viewerJudge: true, tools: ['Procreate', 'Photoshop', 'Illustrator', 'IA Generativa'] },
  // ─── Rap Battle ───
  freestyle:    { camera: true, screenRec: false, theme: true, timerMinutes: 3, uploadResult: false, aiJudge: true, viewerJudge: true },
  escrito:      { camera: true, screenRec: true, theme: true, timerMinutes: 10, uploadResult: true, aiJudge: true, viewerJudge: true },
  beatbox:      { camera: true, screenRec: false, theme: false, timerMinutes: 5, uploadResult: false, aiJudge: true, viewerJudge: true },
  trap:         { camera: true, screenRec: true, theme: true, timerMinutes: 15, uploadResult: true, aiJudge: true, viewerJudge: true },
  storytelling: { camera: true, screenRec: false, theme: true, timerMinutes: 5, uploadResult: false, aiJudge: true, viewerJudge: true },
  roast:        { camera: true, screenRec: false, theme: false, timerMinutes: 5, uploadResult: false, aiJudge: true, viewerJudge: true },
  // ─── Culinária ───
  brasileira:  { camera: true, screenRec: false, theme: true, timerMinutes: 45, uploadResult: true, aiJudge: true, viewerJudge: true },
  japonesa:    { camera: true, screenRec: false, theme: true, timerMinutes: 45, uploadResult: true, aiJudge: true, viewerJudge: true },
  italiana:    { camera: true, screenRec: false, theme: true, timerMinutes: 45, uploadResult: true, aiJudge: true, viewerJudge: true },
  confeitaria: { camera: true, screenRec: false, theme: true, timerMinutes: 60, uploadResult: true, aiJudge: true, viewerJudge: true },
  vegana:      { camera: true, screenRec: false, theme: true, timerMinutes: 30, uploadResult: true, aiJudge: true, viewerJudge: true },
  churrasco:   { camera: true, screenRec: false, theme: true, timerMinutes: 60, uploadResult: true, aiJudge: true, viewerJudge: true },
  mexicana:    { camera: true, screenRec: false, theme: true, timerMinutes: 45, uploadResult: true, aiJudge: true, viewerJudge: true },
  drinks:      { camera: true, screenRec: false, theme: true, timerMinutes: 15, uploadResult: true, aiJudge: true, viewerJudge: true },
  // ─── Evolução Pessoal ───
  meditacao:     { camera: true, screenRec: false, theme: false, timerMinutes: 10, uploadResult: false, aiJudge: true, viewerJudge: false },
  leitura:       { camera: true, screenRec: false, theme: true, timerMinutes: 30, uploadResult: true, aiJudge: true, viewerJudge: true },
  idiomas:       { camera: true, screenRec: false, theme: true, timerMinutes: 10, uploadResult: false, aiJudge: true, viewerJudge: true },
  fitness:       { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  jejum:         { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: false },
  gratidao:      { camera: true, screenRec: false, theme: true, timerMinutes: 5, uploadResult: true, aiJudge: true, viewerJudge: true },
  cold_exposure: { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true },
  habitos:       { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: false },
  financas:      { camera: true, screenRec: true, theme: true, timerMinutes: 15, uploadResult: true, aiJudge: true, viewerJudge: true },
}

// Temas por subcategoria (pool de temas sorteados)
const THEME_POOLS: Record<string, string[]> = {
  roteiro: ['Recomeço', 'O último dia', 'Encontro inesperado', 'Carta para o futuro', 'Segredo de família', 'A viagem', 'Redenção', 'O estranho'],
  atuacao: ['Despedida', 'Primeiro amor', 'Confissão', 'Notícia inesperada', 'Reencontro', 'Monólogo do vilão', 'Pedido de desculpas', 'Discurso de vitória'],
  direcao: ['Suspense em 60s', 'Comédia do cotidiano', 'Drama familiar', 'Terror psicológico', 'Romance urbano', 'Documentário social'],
  animacao: ['Metamorfose', 'Mundo invertido', 'A última árvore', 'Robô com sentimentos', 'Viagem no tempo', 'Cidade flutuante'],
  trilha_sonora: ['Tensão', 'Nostalgia', 'Aventura épica', 'Romance', 'Mistério', 'Vitória', 'Tristeza bonita', 'Euforia'],
  desenho: ['Retrato de emoção', 'Cidade do futuro', 'Natureza viva', 'Auto-retrato abstrato', 'Animal fantástico', 'Paisagem onírica'],
  freestyle: ['Superação', 'Cidade grande', 'Amor e ódio', 'Dinheiro', 'Família', 'Futuro', 'Rua', 'Liberdade'],
  storytelling: ['De onde eu vim', 'O dia que mudou tudo', 'Se eu pudesse voltar', 'A lição mais dura', 'O que ninguém sabe'],
  brasileira: ['Feijoada completa', 'Moqueca baiana', 'Coxinha gourmet', 'Açaí na tigela', 'Pão de queijo recheado'],
  japonesa: ['Temaki criativo', 'Ramen do zero', 'Gyoza artesanal', 'Onigiri fusion', 'Yakisoba especial'],
  italiana: ['Carbonara autêntica', 'Pizza napolitana', 'Risoto criativo', 'Tiramisù', 'Gnocchi da nonna'],
  drinks: ['Caipirinha twist', 'Mojito tropical', 'Shot criativo', 'Drink sem álcool', 'Coquetel autoral'],
  fotografia: ['Luz e sombra', 'Reflexos', 'Minimalismo', 'Cores vibrantes', 'Retrato de rua', 'Macro natureza'],
  poesia: ['Saudade', 'Amanhecer', 'Revolução', 'Silêncio', 'Cicatrizes', 'Liberdade'],
  digital_art: ['Cyberpunk', 'Natureza futurista', 'Retrato surrealista', 'Abstrato emocional', 'Paisagem alien'],
  vlog_challenge: ['Meu dia em 60s', 'Tour do meu quarto', 'O que como num dia', 'Desafio na rua', 'Reagindo a...'],
  podcast: ['Tema surpresa', 'Debate quente', 'Entrevista improvável', 'Storytelling pessoal', 'Hot takes'],
  leitura: ['Resuma em 2 min', 'Análise crítica', 'Conexão com a vida', 'Recomendação apaixonada'],
  idiomas: ['Apresentação pessoal', 'Pedir comida', 'Contar uma história', 'Debate simples', 'Tradução ao vivo'],
  gratidao: ['3 coisas de hoje', 'Carta de gratidão', 'Momento marcante', 'Pessoa especial'],
  documentario: ['Minha rua', 'Uma profissão', 'Comida de rua', 'Antes e depois', 'Mini perfil humano'],
  fotografia_cine: ['Golden hour', 'Silhueta', 'Close dramático', 'Plano aberto narrativo', 'Luz artificial criativa'],
  pintura: ['Emoção em cores', 'Paisagem imaginária', 'Retrato expressionista', 'Abstrato livre'],
  danca: ['Freestyle total', 'Coreografia em 3 min', 'Dança com objeto', 'Estilo surpresa'],
  musica: ['Loop de 30s', 'Cover criativo', 'Composição original', 'Jam session tema'],
  confeitaria: ['Bolo temático', 'Sobremesa em 30 min', 'Decoração criativa', 'Doce brasileiro gourmet'],
  mexicana: ['Taco criativo', 'Guacamole twist', 'Burrito gourmet', 'Nachos premium'],
  vegana: ['Hambúrguer vegano', 'Sobremesa sem leite', 'Bowl proteico', 'Comfort food plant-based'],
  churrasco: ['Costela premium', 'Hambúrguer artesanal', 'Espeto criativo', 'Defumado especial'],
  financas: ['Plano de economia', 'Investimento simulado', 'Orçamento pessoal', 'Análise de gastos'],
  grafite: ['Tag original', 'Mural temático', 'Stencil art', 'Lettering criativo'],
  escultura: ['Escultura de argila', 'Reciclagem artística', 'Miniatura detalhada', 'Escultura abstrata'],
  trap: ['Beat do zero', 'Flow trap', 'Drill brasileiro', 'Autotune challenge'],
  escrito: ['Punchline king', 'Rima multissilábica', '16 barras perfeitas', 'Storytelling rimado'],
}

interface ChallengeMode {
  key: string
  emoji: string
  label: string
  desc: string
  players: string
  duration: string
}

// Modos de desafio disponíveis globalmente
const CHALLENGE_MODES: Record<string, ChallengeMode[]> = {
  _default: [
    { key: '1v1', emoji: '⚔️', label: '1 vs 1', desc: 'Duelo clássico', players: '2', duration: '5-30min' },
    { key: '2v2', emoji: '🤝', label: '2 vs 2', desc: 'Duplas competitivas', players: '4', duration: '10-30min' },
    { key: 'battle_royale', emoji: '👑', label: 'Battle Royale', desc: 'Todos contra todos — só 1 vence', players: '4-8', duration: '15-45min' },
    { key: 'speed_run', emoji: '⚡', label: 'Speed Run', desc: 'Quem completa mais rápido', players: '2-6', duration: '5-15min' },
    { key: 'best_of_3', emoji: '🏆', label: 'Melhor de 3', desc: 'Série de 3 rodadas', players: '2', duration: '15-45min' },
  ],
  // Modos especiais por categoria
  sports_fun: [
    { key: 'trick_shot', emoji: '🎯', label: 'Trick Shot', desc: 'Acerte a jogada impossível', players: '2-4', duration: '10min' },
    { key: 'endurance', emoji: '💪', label: 'Resistência', desc: 'Quem aguenta mais', players: '2-8', duration: '30-60min' },
  ],
  esports_fun: [
    { key: 'clutch_1v5', emoji: '🔥', label: 'Clutch Mode', desc: 'Situações impossíveis', players: '2', duration: '10min' },
    { key: 'no_hud', emoji: '🫣', label: 'Sem HUD', desc: 'Jogue às cegas', players: '2', duration: '15min' },
  ],
  rap_fun: [
    { key: 'tema_surpresa', emoji: '🎲', label: 'Tema Surpresa', desc: 'Tema revelado na hora', players: '2', duration: '5min' },
    { key: 'tag_team', emoji: '🏷️', label: 'Tag Team', desc: 'Revezamento de rimas', players: '4', duration: '10min' },
  ],
  culinary_fun: [
    { key: 'mystery_box', emoji: '📦', label: 'Caixa Mistério', desc: 'Ingredientes surpresa', players: '2-4', duration: '30min' },
    { key: 'speed_cook', emoji: '⏱️', label: 'Speed Cook', desc: 'Cozinhe em 10 minutos', players: '2-4', duration: '10min' },
  ],
  hero_journey_fun: [
    { key: 'improv_scene', emoji: '🎭', label: 'Cena Improvisada', desc: 'Tema surpresa, atue na hora', players: '2-4', duration: '10min' },
    { key: 'plot_twist', emoji: '🔄', label: 'Plot Twist', desc: 'Reviravolta obrigatória no roteiro', players: '2', duration: '20min' },
    { key: 'one_take', emoji: '🎬', label: 'One Take', desc: 'Filme tudo em uma tomada só', players: '2-4', duration: '15min' },
  ],
}

// Subcategorias por categoria
const SUBCATEGORIES: Record<string, Subcategory[]> = {
  sports: [
    { key: 'futebol', emoji: '⚽', label: 'Futebol', desc: 'Gols, dribles e embaixadinhas' },
    { key: 'basquete', emoji: '🏀', label: 'Basquete', desc: 'Arremessos e enterradas' },
    { key: 'tenis', emoji: '🎾', label: 'Tênis', desc: 'Saques e rallies' },
    { key: 'natacao', emoji: '🏊', label: 'Natação', desc: 'Velocidade e resistência na água' },
    { key: 'corrida', emoji: '🏃', label: 'Corrida', desc: 'Sprints e provas de fundo' },
    { key: 'mma', emoji: '🥊', label: 'MMA / Luta', desc: 'Artes marciais e boxe' },
    { key: 'crossfit', emoji: '🏋️', label: 'CrossFit', desc: 'WODs e desafios funcionais' },
    { key: 'surf', emoji: '🏄', label: 'Surf', desc: 'Manobras e ondas' },
    { key: 'skate', emoji: '🛹', label: 'Skate', desc: 'Tricks e manobras' },
    { key: 'ciclismo', emoji: '🚴', label: 'Ciclismo', desc: 'Velocidade e trilhas' },
    { key: 'volei', emoji: '🏐', label: 'Vôlei', desc: 'Ataques e bloqueios' },
    { key: 'ginastica', emoji: '🤸', label: 'Ginástica', desc: 'Flexibilidade e acrobacias' },
  ],
  esports: [
    { key: 'fifa', emoji: '⚽', label: 'EA FC / FIFA', desc: 'Futebol digital' },
    { key: 'lol', emoji: '🧙', label: 'League of Legends', desc: 'MOBA estratégico' },
    { key: 'valorant', emoji: '🔫', label: 'Valorant', desc: 'FPS tático' },
    { key: 'cs2', emoji: '💣', label: 'Counter-Strike 2', desc: 'FPS competitivo' },
    { key: 'fortnite', emoji: '🏗️', label: 'Fortnite', desc: 'Battle royale e construção' },
    { key: 'rocket_league', emoji: '🚗', label: 'Rocket League', desc: 'Futebol com carros' },
    { key: 'street_fighter', emoji: '👊', label: 'Street Fighter', desc: 'Luta 1v1 clássica' },
    { key: 'tekken', emoji: '🥋', label: 'Tekken', desc: 'Combate 3D' },
    { key: 'apex', emoji: '🎯', label: 'Apex Legends', desc: 'Battle royale FPS' },
    { key: 'cod', emoji: '🪖', label: 'Call of Duty', desc: 'Ação FPS' },
    { key: 'chess', emoji: '♟️', label: 'Xadrez Online', desc: 'Estratégia clássica' },
    { key: 'mario_kart', emoji: '🏎️', label: 'Mario Kart', desc: 'Corrida divertida' },
  ],
  personal_evolution: [
    { key: 'meditacao', emoji: '🧘', label: 'Meditação', desc: 'Minutos de prática meditativa' },
    { key: 'leitura', emoji: '📚', label: 'Leitura', desc: 'Páginas lidas e resumos' },
    { key: 'idiomas', emoji: '🌍', label: 'Idiomas', desc: 'Aprenda palavras e frases' },
    { key: 'fitness', emoji: '💪', label: 'Fitness', desc: 'Exercícios e metas físicas' },
    { key: 'jejum', emoji: '🕐', label: 'Jejum', desc: 'Desafios de jejum intermitente' },
    { key: 'gratidao', emoji: '🙏', label: 'Gratidão', desc: 'Diários e práticas de gratidão' },
    { key: 'cold_exposure', emoji: '🧊', label: 'Exposição ao Frio', desc: 'Banhos gelados e desafios' },
    { key: 'habitos', emoji: '📋', label: 'Hábitos', desc: 'Construa rotinas vencedoras' },
    { key: 'financas', emoji: '💰', label: 'Finanças', desc: 'Economia e investimento pessoal' },
  ],
  arts: [
    { key: 'desenho', emoji: '✏️', label: 'Desenho', desc: 'Crie arte com lápis ou digital' },
    { key: 'pintura', emoji: '🎨', label: 'Pintura', desc: 'Quadros e arte visual' },
    { key: 'fotografia', emoji: '📸', label: 'Fotografia', desc: 'Capture o momento perfeito' },
    { key: 'musica', emoji: '🎵', label: 'Música', desc: 'Instrumentos e composição' },
    { key: 'danca', emoji: '💃', label: 'Dança', desc: 'Coreografias e freestyle' },
    { key: 'grafite', emoji: '🖌️', label: 'Grafite / Street Art', desc: 'Arte urbana' },
    { key: 'poesia', emoji: '📝', label: 'Poesia', desc: 'Versos e rimas escritas' },
    { key: 'escultura', emoji: '🗿', label: 'Escultura', desc: 'Arte tridimensional' },
    { key: 'digital_art', emoji: '🖥️', label: 'Arte Digital', desc: 'Ilustração e design' },
  ],
  rap_battle: [
    { key: 'freestyle', emoji: '🎤', label: 'Freestyle', desc: 'Improviso puro ao vivo' },
    { key: 'escrito', emoji: '📝', label: 'Escrito', desc: 'Rimas preparadas com delivery' },
    { key: 'beatbox', emoji: '🥁', label: 'Beatbox', desc: 'Ritmos com a boca' },
    { key: 'trap', emoji: '🔊', label: 'Trap / Drill', desc: 'Estilo trap e drill' },
    { key: 'storytelling', emoji: '📖', label: 'Storytelling', desc: 'Conte uma história rimando' },
    { key: 'roast', emoji: '🔥', label: 'Roast Battle', desc: 'Humor afiado em rimas' },
  ],
  culinary: [
    { key: 'brasileira', emoji: '🇧🇷', label: 'Brasileira', desc: 'Feijoada, moqueca e mais' },
    { key: 'japonesa', emoji: '🍣', label: 'Japonesa', desc: 'Sushi, ramen e temaki' },
    { key: 'italiana', emoji: '🍝', label: 'Italiana', desc: 'Pasta, pizza e risoto' },
    { key: 'confeitaria', emoji: '🎂', label: 'Confeitaria', desc: 'Bolos, doces e sobremesas' },
    { key: 'vegana', emoji: '🥗', label: 'Vegana / Saudável', desc: 'Receitas plant-based' },
    { key: 'churrasco', emoji: '🥩', label: 'Churrasco', desc: 'Carnes e grelhados' },
    { key: 'mexicana', emoji: '🌮', label: 'Mexicana', desc: 'Tacos, burritos e molhos' },
    { key: 'drinks', emoji: '🍹', label: 'Drinks & Coquetéis', desc: 'Mixologia criativa' },
  ],
  hero_journey: [
    { key: 'roteiro', emoji: '📝', label: 'Roteiro', desc: 'Escreva a história do zero' },
    { key: 'atuacao', emoji: '🎭', label: 'Atuação', desc: 'Monólogos e cenas ao vivo' },
    { key: 'direcao', emoji: '🎬', label: 'Direção', desc: 'Dirija um curta-metragem' },
    { key: 'edicao', emoji: '✂️', label: 'Edição', desc: 'Monte o filme final' },
    { key: 'documentario', emoji: '📹', label: 'Documentário', desc: 'Conte histórias reais' },
    { key: 'animacao', emoji: '🖍️', label: 'Animação', desc: 'Crie vida com desenhos' },
    { key: 'fotografia_cine', emoji: '📸', label: 'Fotografia Cine', desc: 'Composição e luz cinematográfica' },
    { key: 'trilha_sonora', emoji: '🎵', label: 'Trilha Sonora', desc: 'Componha a música do filme' },
    { key: 'vlog_challenge', emoji: '📱', label: 'Vlog Challenge', desc: 'Crie o melhor vlog' },
    { key: 'podcast', emoji: '🎙️', label: 'Podcast', desc: 'Produza um episódio ao vivo' },
  ],
}

// Função para pegar os modos de desafio baseado na categoria
function getChallengeModes(categoryKey: string): ChallengeMode[] {
  const base = CHALLENGE_MODES._default
  const funKey = `${categoryKey}_fun`
  const extra = CHALLENGE_MODES[funKey] || []
  return [...base, ...extra]
}

/* ═══════════════════════════════════════
   LANDING PAGE — for visitors
   ═══════════════════════════════════════ */

const LANDING_CATEGORIES = [
  { emoji: '🏋️', label: 'Sports', bg: 'bg-beige' },
  { emoji: '🎮', label: 'E-Sports', bg: 'bg-sage-light' },
  { emoji: '🧠', label: 'Evolução', bg: 'bg-beige' },
  { emoji: '🎨', label: 'Artes', bg: 'bg-sage-light' },
  { emoji: '🎤', label: 'Rap Battle', bg: 'bg-beige' },
  { emoji: '🍳', label: 'Culinária', bg: 'bg-sage-light' },
  { emoji: '🎬', label: 'Jornada do Herói', bg: 'bg-beige' },
]

function LandingPage() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen">
      {/* ── Minimal Nav ── */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/logo-nav.png" alt="Jungle Games" width={120} height={36} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-light tracking-wide text-kk-text-muted hover:text-gold transition-colors">
              Entrar
            </Link>
            <Link href="/auth" className="btn-gold text-xs py-2.5 px-6">
              Criar Conta
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="landing-hero">
        {/* Decorative glows */}
        <div className="landing-glow" style={{ top: '15%', left: '10%', background: 'rgba(204,213,174,0.5)' }} />
        <div className="landing-glow" style={{ bottom: '20%', right: '10%', background: 'rgba(201,169,110,0.3)', animationDelay: '3s' }} />

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {/* Badge */}
          <div className="reveal-up inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border border-gold-muted bg-white/40 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs tracking-widest uppercase text-kk-text-muted font-light">
              Live Reality Games
            </span>
          </div>

          {/* Title */}
          <h1 className="landing-title reveal-up stagger-1">
            Ganhe dinheiro<br />
            <span className="bg-gold-gradient bg-clip-text text-transparent">fazendo o que ama.</span>
          </h1>

          {/* Subtitle */}
          <p className="landing-subtitle mx-auto mt-6 reveal-up stagger-2">
            Desafios online ao vivo de esporte, artes, culinária e evolução pessoal.
            Se divirta, evolua e ganhe dinheiro real — o caminho natural para o mundo que você merece.
          </p>

          {/* CTA */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 reveal-up stagger-3">
            <Link href="/auth" className="btn-gold text-sm py-4 px-10">
              Comece a Jogar
            </Link>
            <a href="#como-funciona" className="btn-outline text-sm py-3.5 px-8">
              Como Funciona
            </a>
          </div>

          {/* Category icons floating row */}
          <div className="mt-16 flex items-center justify-center gap-4 flex-wrap reveal-up stagger-4">
            {LANDING_CATEGORIES.map((cat, i) => (
              <div
                key={cat.label}
                className={`category-orb ${cat.bg} shadow-card`}
                style={{ animationDelay: `${i * 0.15}s` }}
                title={cat.label}
              >
                {cat.emoji}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <span className="text-[10px] tracking-[0.3em] uppercase text-kk-text-muted">Scroll</span>
          <div className="w-px h-8 bg-gold/40 animate-pulse" />
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="py-8 border-b border-gold-muted bg-white/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          <div className="stat-block">
            <p className="number">70%</p>
            <p className="label">Pro Vencedor</p>
          </div>
          <div className="stat-block">
            <p className="number">30%</p>
            <p className="label">Pro Planeta</p>
          </div>
          <div className="stat-block">
            <p className="number">24/7</p>
            <p className="label">Ao Vivo</p>
          </div>
        </div>
      </section>

      {/* ═══ WHAT IS ═══ */}
      <section className="landing-section bg-ivory">
        <div className="max-w-4xl mx-auto text-center">
          <p className="sec-label mb-4">Live Reality Games</p>
          <div className="draw-line mx-auto mb-8" />
          <h2 className="font-serif text-heading mb-6">
            Ganhe dinheiro<br />
            <span className="text-gold">enquanto evolui</span>
          </h2>
          <p className="landing-subtitle mx-auto">
            Desafios reais, transmitidos ao vivo. Escolha sua arena —
            esporte, artes, culinária ou evolução pessoal — e enfrente oponentes de verdade.
            Quem vence leva 70% do montante. E quem perde ainda sai ganhando:
            30% vai para regenerar o planeta.
          </p>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="landing-section" style={{ background: 'linear-gradient(180deg, #FEFAE0 0%, #FAEDCD 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="sec-label mb-4">Categorias</p>
            <h2 className="font-serif text-heading">Escolha seu campo de batalha</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {[
              { emoji: '🏋️', label: 'Sports', desc: 'Futebol, basquete, MMA e mais' },
              { emoji: '🎮', label: 'E-Sports', desc: 'FIFA, Valorant, LoL e mais' },
              { emoji: '🧠', label: 'Evolução Pessoal', desc: 'Meditação, leitura, hábitos' },
              { emoji: '🎨', label: 'Artes', desc: 'Desenho, música, fotografia' },
              { emoji: '🎤', label: 'Rap Battle', desc: 'Freestyle, beatbox, roast' },
              { emoji: '🍳', label: 'Culinária', desc: 'Brasileira, japonesa, confeitaria' },
              { emoji: '🎬', label: 'Jornada do Herói', desc: 'Do roteiro ao curta-metragem' },
            ].map((cat, i) => (
              <div
                key={cat.label}
                className="premium-card p-6 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-sage-light flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">{cat.emoji}</span>
                </div>
                <h3 className="font-serif text-xl mb-1">{cat.label}</h3>
                <p className="text-xs text-kk-text-muted font-light">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="como-funciona" className="landing-section bg-ivory">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="sec-label mb-4">Como Funciona</p>
            <div className="draw-line mx-auto mb-8" />
            <h2 className="font-serif text-heading">Simples. Rápido. Real.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'Escolha o Desafio', desc: 'Esporte, artes, culinária, evolução pessoal. Defina seu stake de R$20 a R$2.000.' },
              { num: '2', title: 'Enfrente ao Vivo', desc: 'Matchmaking instantâneo. Câmera liga e o desafio começa em tempo real.' },
              { num: '3', title: 'Ganhe e Regenere', desc: 'Vencedor leva 70%. 30% regenera o planeta. Todo mundo ganha.' },
            ].map(step => (
              <div key={step.num} className="how-step glass-card rounded-3xl">
                <div className="step-num">{step.num}</div>
                <h3 className="font-serif text-xl">{step.title}</h3>
                <p className="text-sm text-kk-text-muted font-light leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REGENERATION ═══ */}
      <section className="landing-section" style={{ background: 'linear-gradient(180deg, #FEFAE0 0%, #E9EDC9 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="regen-banner">
            <div className="relative z-10">
              <span className="text-5xl block mb-4">🌱</span>
              <h2 className="font-serif text-heading mb-4">
                Perdeu? O planeta ganhou.
              </h2>
              <p className="landing-subtitle mx-auto mb-2">
                Quem perde o desafio ainda sai satisfeito —
                30% do montante vai direto para projetos reais de regeneração:
                eco-vilas, reflorestamento e acesso à água limpa.
                Aqui ninguém perde de verdade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="landing-section bg-ivory">
        <div className="max-w-2xl mx-auto text-center">
          <p className="sec-label mb-4">Pronto?</p>
          <h2 className="landing-title mb-6" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Se divirta fazendo dinheiro<br />
            <span className="bg-gold-gradient bg-clip-text text-transparent">com o que ama</span>
          </h2>
          <p className="landing-subtitle mx-auto mb-10">
            Crie sua conta em 30 segundos, ganhe 100 VITA de boas-vindas
            e entre na arena agora.
          </p>
          <Link href="/auth" className="btn-gold text-sm py-4 px-12">
            Criar Minha Conta
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <Image src="/img/logo-nav.png" alt="Jungle Games" width={100} height={30} className="h-6 w-auto mx-auto mb-3 opacity-40" />
        <p className="text-xs text-kk-text-muted font-light">
          Jungle Games — Live Reality Games. Ganhe dinheiro fazendo o que ama.
        </p>
      </footer>
    </div>
  )
}

/* ═══════════════════════════════════════
   DASHBOARD — for logged-in users
   ═══════════════════════════════════════ */

const CATEGORIES = [
  { key: 'sports', emoji: '🏋️', label: 'Sports', desc: 'Desafios físicos ao vivo', online: 47, img: '/img/arena-bg.jpg' },
  { key: 'esports', emoji: '🎮', label: 'E-Sports', desc: 'Games competitivos', online: 124, img: '/img/categories/online-games.jpg' },
  { key: 'personal_evolution', emoji: '🧠', label: 'Evolução', desc: 'Crescimento pessoal', online: 33, img: '/img/arena-bg.jpg' },
  { key: 'arts', emoji: '🎨', label: 'Artes', desc: 'Criatividade em desafio', online: 22, img: '/img/categories/artes.jpg' },
  { key: 'rap_battle', emoji: '🎤', label: 'Rap Battle', desc: 'Batalhas de rima', online: 9, img: '/img/categories/rap.jpg' },
  { key: 'culinary', emoji: '🍳', label: 'Culinária', desc: 'Duelos gastronômicos', online: 15, img: '/img/categories/culinaria.jpg' },
  { key: 'hero_journey', emoji: '🎬', label: 'Jornada do Herói', desc: 'Do roteiro ao curta-metragem', online: 18, img: '/img/arena-bg.jpg' },
]

const STAKES = [
  { amount: 20, tier: 'Bronze' },
  { amount: 50, tier: 'Bronze' },
  { amount: 200, tier: 'Silver' },
  { amount: 500, tier: 'Gold' },
  { amount: 2000, tier: 'Diamond' },
]

type Phase = 'splash' | 'home' | 'friend_category' | 'subcategory' | 'mode' | 'stake' | 'searching' | 'match' | 'live' | 'judging' | 'result' | 'create_challenge'
type MatchType = 'online' | 'friend'

/* ─── Nav ─── */
function Nav({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/img/logo-nav.png" alt="Kaa Kuaa" width={120} height={36} className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-6">
          {[
            { href: '/challenges', label: 'Desafios' },
            { href: '/jornada', label: 'Jornada' },
            { href: '/tv', label: 'Ao Vivo' },
            { href: '/invest', label: 'Investir' },
            { href: '/marketplace', label: 'Loja' },
          ].map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-light tracking-wide text-kk-text-muted hover:text-gold transition-colors">
              {link.label}
            </Link>
          ))}
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="flex items-center gap-2 text-sm text-kk-text hover:text-gold transition-colors">
                <span className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center text-white text-xs font-medium">
                  {user.displayName?.[0] || 'U'}
                </span>
                <span className="hidden md:inline">{user.displayName}</span>
              </Link>
            </div>
          ) : (
            <Link href="/auth" className="btn-outline text-xs py-2 px-5">Entrar</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useAuth()

  // WebSocket real — conecta quando tiver user
  const {
    matchData, searchingData, challengeStarted, challengeCompleted, clearMatch,
    voteUpdate, sendOffer, sendAnswer, sendIceCandidate, sendReady, setWebRTCCallbacks,
    sendVote, watchChallenge, submitFrame,
  } = useSocket(user?.id)

  const [phase, setPhase] = useState<Phase>('splash')
  const [selectedCat, setSelectedCat] = useState('')
  const [selectedSubcat, setSelectedSubcat] = useState('')
  const [selectedMode, setSelectedMode] = useState('')
  const [selectedStake, setSelectedStake] = useState(200)
  const [preferLive, setPreferLive] = useState(true)
  const [countdown, setCountdown] = useState(5)
  const [elapsed, setElapsed] = useState(0)
  const [apiLoading, setApiLoading] = useState(false)
  const [matchType, setMatchType] = useState<MatchType>('online')
  const [friendCode, setFriendCode] = useState('')
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [splashFading, setSplashFading] = useState(false)
  const [challengeTheme, setChallengeTheme] = useState('')
  const [challengeTimer, setChallengeTimer] = useState(0)
  const [timerRemaining, setTimerRemaining] = useState(0)
  const [viewerVotes, setViewerVotes] = useState({ player1: 0, player2: 0 })
  const [hasVoted, setHasVoted] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [aiJudgment, setAiJudgment] = useState<any>(null)
  const [judgingLoading, setJudgingLoading] = useState(false)
  const screenStreamRef = useRef<MediaStream | null>(null)

  // Camera refs for WebRTC
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)

  // Screen recording with MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])

  // Frame capture for AI analysis
  const capturedFramesRef = useRef<string[]>([])

  const catInfo = CATEGORIES.find(c => c.key === selectedCat)
  const pool = selectedStake * 2
  const winnerReceives = (pool * 0.70).toFixed(2)
  const fundAmount = (pool * 0.30).toFixed(2)

  // ─── React to WebSocket events ───
  useEffect(() => {
    if (matchData && phase === 'searching') {
      setPhase('match')
      let c = 5
      const interval = setInterval(() => {
        c--
        setCountdown(c)
        if (c <= 0) {
          clearInterval(interval)
          setPhase('live')
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [matchData, phase])

  // Start camera when going live
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: true,
      })
      localStreamRef.current = stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop())
      localStreamRef.current = null
    }
  }, [])

  // Derived values (must be before useEffect)
  const subcatInfo = SUBCATEGORIES[selectedCat]?.find(s => s.key === selectedSubcat)
  const modeInfo = getChallengeModes(selectedCat).find(m => m.key === selectedMode)
  const mechanics = CHALLENGE_MECHANICS[selectedSubcat] || { camera: true, screenRec: false, theme: false, timerMinutes: 0, uploadResult: false, aiJudge: true, viewerJudge: true }

  // Sortear tema
  const pickRandomTheme = useCallback(() => {
    const themes = THEME_POOLS[selectedSubcat]
    if (themes && themes.length > 0) {
      return themes[Math.floor(Math.random() * themes.length)]
    }
    return ''
  }, [selectedSubcat])

  // Screen sharing (must be declared before useEffect that references it)
  const startScreenShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      screenStreamRef.current = stream
      setIsScreenSharing(true)
      stream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false)
        screenStreamRef.current = null
      }
    } catch {
      console.error('Screen share denied')
    }
  }, [])

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop())
      screenStreamRef.current = null
      setIsScreenSharing(false)
    }
  }, [])

  // ─── WebRTC Peer Connection ───
  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ]

  const setupPeerConnection = useCallback((challengeId: string, opponentId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS })
    peerConnectionRef.current = pc

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!)
      })
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log('[WebRTC] Remote track received')
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0]
      }
    }

    // ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate(challengeId, opponentId, event.candidate)
      }
    }

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState)
    }

    // If initiator, create and send offer
    if (isInitiator) {
      pc.createOffer().then(offer => {
        pc.setLocalDescription(offer)
        sendOffer(challengeId, opponentId, offer)
      })
    }

    return pc
  }, [sendIceCandidate, sendOffer])

  const closePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null
    }
  }, [])

  // Set WebRTC signaling callbacks
  useEffect(() => {
    if (!matchData) return

    setWebRTCCallbacks({
      onOffer: async (data: any) => {
        // We received an offer — create answer
        const pc = setupPeerConnection(data.challengeId, data.fromUserId, false)
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        sendAnswer(data.challengeId, data.fromUserId, answer)
      },
      onAnswer: async (data: any) => {
        // We sent an offer and got answer back
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp))
        }
      },
      onIceCandidate: async (data: any) => {
        if (peerConnectionRef.current && data.candidate) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate))
          } catch (err) {
            console.error('[WebRTC] Error adding ICE candidate:', err)
          }
        }
      },
      onPeerReady: (data: any) => {
        // Peer is ready — initiate WebRTC connection (we are the initiator)
        if (matchData?.challengeId) {
          setupPeerConnection(matchData.challengeId, data.userId, true)
        }
      },
    })
  }, [matchData, setWebRTCCallbacks, setupPeerConnection, sendAnswer])

  // Update viewer votes from WebSocket
  useEffect(() => {
    if (voteUpdate && matchData) {
      const participants = matchData ? [user?.id, matchData.opponent.id] : []
      if (participants.length >= 2) {
        setViewerVotes({
          player1: voteUpdate.votes[participants[0] as string] || 0,
          player2: voteUpdate.votes[participants[1] as string] || 0,
        })
      }
    }
  }, [voteUpdate, matchData, user?.id])

  // ─── Screen Recording with MediaRecorder ───
  const startRecording = useCallback(() => {
    const streams: MediaStream[] = []
    if (localStreamRef.current) streams.push(localStreamRef.current)
    if (screenStreamRef.current) streams.push(screenStreamRef.current)
    if (streams.length === 0) return

    // Combine all tracks into one stream
    const combinedStream = new MediaStream()
    streams.forEach(s => s.getTracks().forEach(t => combinedStream.addTrack(t)))

    try {
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm',
      })
      recordedChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data)
      }

      recorder.start(1000) // Capture every second
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      console.log('[Recording] Started')
    } catch (err) {
      console.error('[Recording] Error:', err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      console.log('[Recording] Stopped —', recordedChunksRef.current.length, 'chunks')
    }
  }, [])

  // ─── Frame Capture for AI Analysis ───
  const captureFrame = useCallback(() => {
    if (!localVideoRef.current) return null
    const canvas = document.createElement('canvas')
    const video = localVideoRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
      capturedFramesRef.current.push(dataUrl)
      return dataUrl
    }
    return null
  }, [])

  // Auto-capture frames during live phase (every 30 seconds)
  useEffect(() => {
    if (phase !== 'live') return
    capturedFramesRef.current = [] // Reset

    // Capture initial frame after 2 seconds
    const initialCapture = setTimeout(() => captureFrame(), 2000)

    // Then every 30 seconds
    const interval = setInterval(() => {
      captureFrame()
    }, 30000)

    return () => {
      clearTimeout(initialCapture)
      clearInterval(interval)
    }
  }, [phase, captureFrame])

  // ─── AI Judging Handler ───
  const requestAIJudging = useCallback(async () => {
    if (!matchData?.challengeId) return

    setJudgingLoading(true)
    // Capture final frame
    captureFrame()

    try {
      const result = await api.judgeChallenge(matchData.challengeId, {
        player1Evidence: { frames: capturedFramesRef.current.slice(-3) },
        player2Evidence: { frames: [] }, // Server-side would have the other player's frames
        subcategory: selectedSubcat,
        theme: challengeTheme || undefined,
        challengeMode: selectedMode,
        viewerVotes,
      })
      setAiJudgment(result)
    } catch (err) {
      console.error('[AI Judge] Error:', err)
      // Fallback judgment based on viewer votes
      setAiJudgment({
        winner: viewerVotes.player1 >= viewerVotes.player2 ? 'player1' : 'player2',
        confidence: 0.5,
        analysis: 'Julgamento baseado nos votos dos espectadores',
        method: 'fallback',
      })
    } finally {
      setJudgingLoading(false)
    }
  }, [matchData, captureFrame, selectedSubcat, challengeTheme, selectedMode, viewerVotes])

  // Live timer + challenge timer + WebRTC + Recording
  useEffect(() => {
    if (phase === 'live') {
      startCamera()

      // Signal WebRTC readiness to opponent
      if (matchData?.challengeId) {
        sendReady(matchData.challengeId)
        watchChallenge(matchData.challengeId)
      }

      // Start recording automatically
      const recordTimeout = setTimeout(() => startRecording(), 2000)

      // Sortear tema se a mecânica pede
      if (mechanics.theme && !challengeTheme) {
        setChallengeTheme(pickRandomTheme())
      }
      // Setar timer do desafio se tiver
      if (mechanics.timerMinutes > 0) {
        setChallengeTimer(mechanics.timerMinutes * 60)
        setTimerRemaining(mechanics.timerMinutes * 60)
      }
      const timer = setInterval(() => {
        setElapsed(prev => prev + 1)
        if (mechanics.timerMinutes > 0) {
          setTimerRemaining(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              if (mechanics.uploadResult) {
                setShowUpload(true)
              }
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)

      // Simulate viewer votes when no real viewers connected (demo mode)
      const voteInterval = setInterval(() => {
        if (mechanics.viewerJudge && !voteUpdate) {
          setViewerVotes(prev => ({
            player1: prev.player1 + Math.floor(Math.random() * 3),
            player2: prev.player2 + Math.floor(Math.random() * 3),
          }))
        }
      }, 4000)

      return () => {
        clearInterval(timer)
        clearInterval(voteInterval)
        clearTimeout(recordTimeout)
        stopCamera()
        stopScreenShare()
        stopRecording()
        closePeerConnection()
      }
    }
  }, [phase, startCamera, stopCamera, stopScreenShare, stopRecording, closePeerConnection, mechanics, challengeTheme, pickRandomTheme, matchData, sendReady, watchChallenge, startRecording, voteUpdate])

  // ─── Handlers ───
  const handleSelectCategory = (key: string) => {
    if (!user) {
      router.push('/auth')
      return
    }
    setSelectedCat(key)
    setSelectedSubcat('')
    setSelectedMode('')
    // Se a categoria tem subcategorias, mostrar seleção
    if (SUBCATEGORIES[key]) {
      setPhase('subcategory')
    } else {
      setPhase('stake')
    }
  }

  const handleSelectSubcategory = (subKey: string) => {
    setSelectedSubcat(subKey)
    setPhase('mode')
  }

  const handleSelectMode = (modeKey: string) => {
    setSelectedMode(modeKey)
    setPhase('stake')
  }

  const handleSearch = async () => {
    setPhase('searching')
    setApiLoading(true)

    try {
      const result = await api.joinMatchmaking({
        category: selectedCat,
        stakeAmount: selectedStake,
        preferLive,
      })

      if (result.status === 'matched') {
        setPhase('match')
      }
    } catch (err) {
      console.error('Erro ao entrar na fila:', err)
      setTimeout(() => {
        setPhase('match')
        let c = 5
        const interval = setInterval(() => {
          c--
          setCountdown(c)
          if (c <= 0) {
            clearInterval(interval)
            setPhase('live')
          }
        }, 1000)
      }, 3000)
    } finally {
      setApiLoading(false)
    }
  }

  const handleCancelSearch = async () => {
    try {
      await api.leaveMatchmaking(selectedCat)
    } catch {
      // Ignora se backend não está rodando
    }
    setPhase('stake')
  }

  const handleEndChallenge = () => {
    stopCamera()
    stopRecording()
    closePeerConnection()
    clearMatch()
    setPhase('home')
    setElapsed(0)
    setAiJudgment(null)
    capturedFramesRef.current = []
    recordedChunksRef.current = []
  }

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  // Loading auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Image src="/img/logo-nav.png" alt="Kaa Kuaa" width={160} height={48} className="mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-kk-text-muted">Carregando...</p>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════
  // NOT LOGGED IN → SHOW LANDING PAGE
  // ════════════════════════════════════
  if (!user) {
    return <LandingPage />
  }

  // Opponent info (from WebSocket or mock)
  const opponent = matchData?.opponent || {
    displayName: 'Oponente',
    stats: { rank: 'Silver', won: 8, completed: 12, winRate: 67, streak: 1 },
  }

  // ═══════════════════════════════════
  // PHASE: SPLASH (Logo on white)
  // ═══════════════════════════════════
  if (phase === 'splash') {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center cursor-pointer select-none"
        style={{ background: '#f5f3ef' }}
        onClick={() => {
          setSplashFading(true)
          setTimeout(() => { setPhase('home'); setSplashFading(false) }, 600)
        }}
      >
        <div className={`flex flex-col items-center transition-all duration-600 ${splashFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <img
            src="/img/logo-jungle-games.png"
            alt="Jungle Games"
            className="w-64 sm:w-80 md:w-96 h-auto"
            style={{ filter: 'drop-shadow(0 8px 32px rgba(160,130,80,0.15))' }}
          />
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm tracking-[0.3em] uppercase text-stone-400 font-light animate-pulse">
              Toque para entrar
            </p>
            <div className="w-8 h-8 border border-stone-300 rounded-full flex items-center justify-center">
              <span className="text-stone-400 text-xs">▶</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: HOME — Fullscreen carousel
  // ═══════════════════════════════════
  if (phase === 'home') {
    const allSlides = [...CATEGORIES, { key: 'friend', emoji: '👥', label: 'Desafiar Amigo', desc: 'Escolha uma categoria e desafie um amigo', online: 0, img: '/img/categories/escolha-batalha.jpg' }]
    const current = allSlides[carouselIndex]
    const prevSlide = () => setCarouselIndex(i => i === 0 ? allSlides.length - 1 : i - 1)
    const nextSlide = () => setCarouselIndex(i => i === allSlides.length - 1 ? 0 : i + 1)

    const handleEnterCategory = () => {
      if (current.key === 'friend') {
        setMatchType('friend')
        setPhase('friend_category')
      } else {
        setMatchType('online')
        handleSelectCategory(current.key)
      }
    }

    // Swipe support
    const touchStartRef = useRef<number>(0)
    const handleTouchStart = (e: React.TouchEvent) => { touchStartRef.current = e.touches[0].clientX }
    const handleTouchEnd = (e: React.TouchEvent) => {
      const diff = touchStartRef.current - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide() }
    }

    // Keyboard nav
    useEffect(() => {
      if (phase !== 'home') return
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') nextSlide()
        else if (e.key === 'ArrowLeft') prevSlide()
        else if (e.key === 'Enter') handleEnterCategory()
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }, [phase, carouselIndex])

    return (
      <div
        className="fixed inset-0 overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background image with transition */}
        {allSlides.map((slide, idx) => (
          <div
            key={slide.key}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{
              backgroundImage: `url(${slide.img})`,
              opacity: idx === carouselIndex ? 1 : 0,
              zIndex: idx === carouselIndex ? 1 : 0,
            }}
          />
        ))}

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 z-10" />

        {/* Top bar: Logo + user info */}
        <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-5 py-4">
          <img
            src="/img/logo-jungle-games.png"
            alt="Jungle Games"
            className="h-10 w-auto cursor-pointer"
            style={{ filter: 'brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
            onClick={() => { setPhase('splash'); setCarouselIndex(0) }}
          />
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-white text-xs font-medium drop-shadow">{user.displayName}</p>
                <p className="text-white/60 text-[10px]">{user.vitaBalance || 0} VITA</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {user.displayName?.[0] || 'U'}
              </div>
            </div>
          )}
        </div>

        {/* Left Arrow */}
        <button
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 active:scale-90 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/60 active:scale-90 transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        {/* Bottom content area */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8 pt-20">
          <div className="max-w-lg mx-auto text-center">
            {/* Category emoji */}
            <div className="mb-3">
              <span className="text-5xl sm:text-6xl drop-shadow-lg">{current.emoji}</span>
            </div>

            {/* Category name */}
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              {current.label}
            </h1>

            {/* Description */}
            <p className="text-white/80 text-sm sm:text-base mt-2 font-light drop-shadow" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {current.desc}
            </p>

            {/* Online count */}
            {current.online > 0 && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/80 text-xs">{current.online} online agora</span>
              </div>
            )}

            {/* Enter button */}
            <div className="mt-6">
              <button
                onClick={handleEnterCategory}
                className="px-10 py-4 rounded-2xl text-white font-semibold text-base sm:text-lg tracking-wide shadow-2xl active:scale-95 transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #c9a96e 0%, #a0835a 50%, #c9a96e 100%)',
                  boxShadow: '0 8px 32px rgba(160,130,80,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
              >
                {current.key === 'friend' ? '👥 Desafiar Amigo' : '⚔️ Entrar na Arena'}
              </button>
            </div>

            {/* Dot indicators */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {allSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`rounded-full transition-all duration-300 ${idx === carouselIndex ? 'w-8 h-2.5 bg-amber-400' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: FRIEND CATEGORY SELECTION
  // ═══════════════════════════════════
  if (phase === 'friend_category') {
    return (
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: 'url(/img/categories/escolha-batalha.jpg)' }}>
        <div className="min-h-screen bg-black/60 backdrop-blur-sm">
          <div className="pt-6 px-5">
            <button onClick={() => { setPhase('home'); setMatchType('online') }} className="flex items-center gap-2 text-sm text-white/70 hover:text-amber-400 transition-colors mb-6">
              <span>←</span> Voltar
            </button>
          </div>

          <div className="text-center mb-8 px-6">
            <span className="text-5xl">👥</span>
            <h2 className="text-white text-2xl font-bold mt-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Desafiar Amigo</h2>
            <p className="text-white/60 text-sm mt-1">Escolha a categoria do desafio</p>
          </div>

          <div className="px-5 pb-10 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.key}
                onClick={() => handleSelectCategory(cat.key)}
                className="group relative overflow-hidden rounded-2xl border border-white/15 bg-black/30 backdrop-blur-sm hover:border-amber-400/50 active:scale-95 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 transition-opacity" style={{ backgroundImage: `url(${cat.img})` }} />
                <div className="relative p-5 text-center">
                  <span className="text-3xl">{cat.emoji}</span>
                  <h3 className="text-white font-semibold text-base mt-2">{cat.label}</h3>
                  <p className="text-white/50 text-[11px] mt-1">{cat.desc}</p>
                  <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-white/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    {cat.online} online
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: SUBCATEGORY
  // ═══════════════════════════════════
  if (phase === 'subcategory') {
    const subs = SUBCATEGORIES[selectedCat] || []
    const catBg = CATEGORIES.find(c => c.key === selectedCat)?.img || '/img/arena-bg.jpg'
    return (
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${catBg})` }}>
        <div className="min-h-screen bg-black/60 backdrop-blur-sm">
          <div className="pt-6 px-5">
            <button onClick={() => setPhase(matchType === 'friend' ? 'friend_category' : 'home')} className="flex items-center gap-2 text-sm text-white/70 hover:text-amber-400 transition-colors mb-6">
              <span>←</span> Voltar
            </button>
          </div>

          <div className="text-center mb-8 px-6">
            {matchType === 'friend' && (
              <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-medium mb-3">👥 Modo Amigo</span>
            )}
            <span className="text-5xl">{catInfo?.emoji}</span>
            <h2 className="text-white text-2xl font-bold mt-3" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{catInfo?.label}</h2>
            <p className="text-white/60 text-sm mt-1">Escolha sua modalidade</p>
          </div>

          <div className="px-5 pb-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {subs.map((sub, i) => (
              <button
                key={sub.key}
                onClick={() => handleSelectSubcategory(sub.key)}
                className="group rounded-2xl border border-white/15 bg-black/30 backdrop-blur-sm p-5 text-center hover:border-amber-400/50 active:scale-95 transition-all duration-300"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-2xl">{sub.emoji}</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{sub.label}</h3>
                <p className="text-white/40 text-[10px] leading-relaxed">{sub.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: MODE (Challenge Type)
  // ═══════════════════════════════════
  if (phase === 'mode') {
    const modes = getChallengeModes(selectedCat)
    const catBg = CATEGORIES.find(c => c.key === selectedCat)?.img || '/img/arena-bg.jpg'
    return (
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${catBg})` }}>
        <div className="min-h-screen bg-black/65 backdrop-blur-sm">
          <div className="pt-6 px-5">
            <button onClick={() => setPhase('subcategory')} className="flex items-center gap-2 text-sm text-white/70 hover:text-amber-400 transition-colors mb-6">
              <span>←</span> Voltar
            </button>
          </div>

          <div className="text-center mb-8 px-6">
            {matchType === 'friend' && (
              <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-medium mb-3">👥 Modo Amigo</span>
            )}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-3xl">{catInfo?.emoji}</span>
              <span className="text-white/40 text-lg">→</span>
              <span className="text-3xl">{subcatInfo?.emoji}</span>
            </div>
            <h2 className="text-white text-2xl font-bold" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{subcatInfo?.label}</h2>
            <p className="text-white/60 text-sm mt-1">Escolha o modo de desafio</p>
          </div>

          <div className="px-5 pb-10 max-w-3xl mx-auto">
            <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Modos Clássicos</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {modes.filter(m => CHALLENGE_MODES._default.some(d => d.key === m.key)).map((mode, i) => (
                <button
                  key={mode.key}
                  onClick={() => handleSelectMode(mode.key)}
                  className="group rounded-2xl border border-white/15 bg-black/30 backdrop-blur-sm p-4 text-left hover:border-amber-400/50 active:scale-95 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{mode.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-sm">{mode.label}</h3>
                      <p className="text-white/40 text-[11px] mt-0.5">{mode.desc}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full">{mode.players} jogadores</span>
                        <span className="text-[10px] text-white/40">{mode.duration}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {modes.filter(m => !CHALLENGE_MODES._default.some(d => d.key === m.key)).length > 0 && (
              <>
                <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Modos Divertidos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {modes.filter(m => !CHALLENGE_MODES._default.some(d => d.key === m.key)).map((mode, i) => (
                    <button
                      key={mode.key}
                      onClick={() => handleSelectMode(mode.key)}
                      className="group rounded-2xl border border-dashed border-white/15 bg-black/30 backdrop-blur-sm p-4 text-left hover:border-amber-400/50 active:scale-95 transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">{mode.emoji}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-sm">{mode.label}</h3>
                          <p className="text-white/40 text-[11px] mt-0.5">{mode.desc}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full">{mode.players} jogadores</span>
                            <span className="text-[10px] text-white/40">{mode.duration}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: STAKE
  // ═══════════════════════════════════
  if (phase === 'stake') {
    const catBg = CATEGORIES.find(c => c.key === selectedCat)?.img || '/img/arena-bg.jpg'
    return (
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: `url(${catBg})` }}>
        <div className="min-h-screen bg-black/65 backdrop-blur-sm">
          <div className="pt-6 px-5">
            <button onClick={() => selectedMode ? setPhase('mode') : selectedSubcat ? setPhase('subcategory') : setPhase('home')} className="flex items-center gap-2 text-sm text-white/70 hover:text-amber-400 transition-colors mb-6">
              <span>←</span> Voltar
            </button>
          </div>
          <div className="px-5 pb-10 max-w-lg mx-auto">

            <div className="text-center mb-8">
              {matchType === 'friend' && (
                <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-medium mb-3">👥 Modo Amigo</span>
              )}
              <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                <span className="text-2xl">{catInfo?.emoji}</span>
                {subcatInfo && (<><span className="text-white/40">→</span><span className="text-2xl">{subcatInfo.emoji}</span></>)}
                {modeInfo && (<><span className="text-white/40">→</span><span className="text-2xl">{modeInfo.emoji}</span></>)}
              </div>
              <h2 className="text-white text-2xl font-bold" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                {subcatInfo ? subcatInfo.label : catInfo?.label}
                {modeInfo ? ` · ${modeInfo.label}` : ''}
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-white/50 text-xs mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {catInfo?.online} jogadores online
              </div>
            </div>

            <div className="mb-6">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Defina seu stake</p>
              <div className="grid grid-cols-5 gap-2">
                {STAKES.map(s => (
                  <button
                    key={s.amount}
                    onClick={() => setSelectedStake(s.amount)}
                    className={`rounded-2xl py-4 text-center transition-all duration-300 ${
                      selectedStake === s.amount
                        ? 'bg-gradient-to-b from-amber-400 to-amber-600 text-white shadow-lg scale-105'
                        : 'border border-white/15 bg-black/30 backdrop-blur-sm text-white hover:border-amber-400/50'
                    }`}
                  >
                    <span className="text-lg font-medium block">
                      {s.amount >= 1000 ? `${s.amount / 1000}k` : s.amount}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider block mt-1 ${
                      selectedStake === s.amount ? 'text-white/80' : 'text-white/40'
                    }`}>{s.tier}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Friend code (shown when in friend mode) */}
            {matchType === 'friend' && (
              <div className="rounded-2xl border border-white/15 bg-black/30 backdrop-blur-sm p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">👥</span>
                  <p className="text-sm font-medium text-white">Desafio entre Amigos</p>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-white/50 mb-1.5">Seu código</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center font-mono text-base tracking-widest text-amber-300 font-medium">
                        {(user?.id?.slice(0, 6) || 'ABC123').toUpperCase()}
                      </div>
                      <button
                        onClick={() => navigator.clipboard?.writeText((user?.id?.slice(0, 6) || 'ABC123').toUpperCase())}
                        className="text-xs text-amber-300 border border-amber-400/30 rounded-xl py-2 px-3 hover:bg-amber-400/10"
                      >Copiar</button>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 mb-3" />
                <p className="text-xs text-white/50 mb-1.5">Código do amigo</p>
                <input
                  type="text"
                  placeholder="Cole o código aqui"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  className="w-full bg-white/10 rounded-xl px-3 py-2 text-center font-mono text-base tracking-widest text-white placeholder:text-white/30 outline-none focus:ring-2 focus:ring-amber-400/30"
                  maxLength={6}
                />
              </div>
            )}

            {/* Mechanics preview */}
            {selectedSubcat && (
              <div className="rounded-2xl border border-white/15 bg-black/30 backdrop-blur-sm p-4 mb-5">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Como funciona este desafio</p>
                <div className="flex flex-wrap gap-2">
                  {mechanics.camera && (
                    <span className="text-[11px] bg-white/10 text-white/80 px-3 py-1.5 rounded-full">📷 Câmera ao vivo</span>
                  )}
                  {mechanics.screenRec && (
                    <span className="text-[11px] bg-white/10 text-white/80 px-3 py-1.5 rounded-full">🖥️ Gravação de tela</span>
                  )}
                  {mechanics.theme && (
                    <span className="text-[11px] bg-white/10 text-white/80 px-3 py-1.5 rounded-full">🎲 Tema sorteado</span>
                  )}
                  {mechanics.timerMinutes > 0 && (
                    <span className="text-[11px] bg-white/10 text-white/80 px-3 py-1.5 rounded-full">⏱️ {mechanics.timerMinutes} min</span>
                  )}
                  {mechanics.uploadResult && (
                    <span className="text-[11px] bg-white/10 text-white/80 px-3 py-1.5 rounded-full">📤 Upload resultado</span>
                  )}
                  {mechanics.aiJudge && (
                    <span className="text-[11px] bg-white/10 text-white/80 px-3 py-1.5 rounded-full">🤖 IA analisa</span>
                  )}
                  {mechanics.viewerJudge && (
                    <span className="text-[11px] bg-white/10 text-white/80 px-3 py-1.5 rounded-full">👀 Juízes votam</span>
                  )}
                </div>
                {mechanics.tools && mechanics.tools.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Ferramentas permitidas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mechanics.tools.map(tool => (
                        <span key={tool} className="text-[10px] bg-white/10 text-white/70 px-2.5 py-1 rounded-full">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-white/15 bg-black/30 backdrop-blur-sm p-5 flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-medium text-white">Desafio ao vivo</p>
                <p className="text-xs text-white/50 mt-0.5">Câmera liga quando match acontecer</p>
              </div>
              <button
                onClick={() => setPreferLive(!preferLive)}
                className={`w-12 h-7 rounded-full relative transition-all duration-300 ${preferLive ? 'bg-gold shadow-gold' : 'bg-tan'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ${preferLive ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/30 backdrop-blur-sm p-5 mb-8">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-4">Se você vencer</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Pool total</span>
                  <span className="text-white">R$ {pool.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/10" />
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Você recebe (70%)</span>
                  <span className="text-amber-300 font-medium">R$ {winnerReceives}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Fundo Regeneração (30%)</span>
                  <span className="text-white">R$ {fundAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">VITA Bonus</span>
                  <span className="text-amber-300 font-medium">+{Math.floor(selectedStake * 0.75)} VITA</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={apiLoading || (matchType === 'friend' && friendCode.length < 4)}
              className="w-full py-4 text-base font-semibold rounded-2xl text-white disabled:opacity-50 active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #c9a96e 0%, #a0835a 50%, #c9a96e 100%)', boxShadow: '0 8px 32px rgba(160,130,80,0.4)' }}
            >
              {apiLoading
                ? 'Entrando na fila...'
                : matchType === 'friend'
                  ? friendCode.length >= 4 ? `Desafiar Amigo — R$${selectedStake}` : 'Digite o código do amigo'
                  : `Buscar Desafiante — R$${selectedStake}`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: SEARCHING
  // ═══════════════════════════════════
  if (phase === 'searching') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <Nav user={user} onLogout={logout} />
        <div className="relative w-40 h-40 mb-8">
          <div className="absolute inset-0 rounded-full border-2 border-gold-muted search-ring" />
          <div className="absolute inset-3 rounded-full border border-gold/30 search-ring" style={{ animationDuration: '5s', animationDirection: 'reverse' }} />
          <div className="absolute inset-6 rounded-full bg-beige flex items-center justify-center">
            <span className="text-5xl">{catInfo?.emoji}</span>
          </div>
          <div className="absolute inset-0 rounded-full animate-pulse-gold" />
        </div>
        <h2 className="font-serif text-heading mb-2">Buscando desafiante</h2>
        <p className="text-sm text-kk-text-muted mb-10">{catInfo?.label} · {user?.rank || 'Silver'} · R${selectedStake}</p>
        <div className="flex gap-12 mb-12">
          <div className="text-center">
            <p className="stat-num">{searchingData?.queuePosition || catInfo?.online}</p>
            <p className="text-xs text-kk-text-muted mt-1">{searchingData ? 'Na fila' : 'Online'}</p>
          </div>
          <div className="text-center">
            <p className="stat-num">~{searchingData?.estimatedWait || 15}s</p>
            <p className="text-xs text-kk-text-muted mt-1">Estimativa</p>
          </div>
        </div>
        <button onClick={handleCancelSearch} className="btn-outline">Cancelar busca</button>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: MATCH
  // ═══════════════════════════════════
  if (phase === 'match') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 animate-scale-in"
           style={{ background: 'radial-gradient(circle at 50% 35%, #E9EDC9 0%, #FEFAE0 70%)' }}>
        <Nav user={user} onLogout={logout} />
        <p className="sec-label tracking-[6px] mb-8">Match Encontrado</p>

        <div className="text-center mb-5 animate-fade-in">
          <div className="w-24 h-24 rounded-full border-2 border-gold bg-beige flex items-center justify-center text-4xl font-serif mx-auto shadow-gold">
            {user?.displayName?.[0] || 'P'}
          </div>
          <p className="font-serif text-xl mt-3">{user?.displayName || 'Você'}</p>
          <p className="text-xs text-kk-text-muted mt-1">
            {user?.rank || 'Silver'} · {user?.challengesWon || 0}-{(user?.challengesCompleted || 0) - (user?.challengesWon || 0)} · 🔥{user?.currentStreak || 0}
          </p>
        </div>

        <div className="w-14 h-14 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold my-4">
          <span className="text-white font-serif text-lg font-medium">VS</span>
        </div>

        <div className="text-center mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="w-24 h-24 rounded-full border-2 border-tan bg-beige flex items-center justify-center text-4xl font-serif mx-auto">
            {opponent.displayName[0]}
          </div>
          <p className="font-serif text-xl mt-3">{opponent.displayName}</p>
          <p className="text-xs text-kk-text-muted mt-1">
            {opponent.stats.rank} · {opponent.stats.won}-{opponent.stats.completed - opponent.stats.won} ({opponent.stats.winRate}%) · 🔥{opponent.stats.streak}
          </p>
        </div>

        <div className="text-center">
          <p className="font-serif text-7xl text-gold animate-count">
            {countdown > 0 ? `0${countdown}` : 'GO!'}
          </p>
          <p className="text-sm text-kk-text-muted mt-3">
            {countdown > 0 ? 'Câmera liga em...' : 'Desafio iniciado!'}
          </p>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: LIVE — with real WebRTC camera
  // ═══════════════════════════════════
  if (phase === 'live') {
    const totalVotes = viewerVotes.player1 + viewerVotes.player2
    const p1Pct = totalVotes > 0 ? Math.round((viewerVotes.player1 / totalVotes) * 100) : 50
    const p2Pct = 100 - p1Pct

    return (
      <div className="min-h-screen bg-sage-dark relative">
        {/* YOUR CAMERA — real WebRTC */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-[60vh] object-cover bg-black"
        />

        {/* Fallback if no camera */}
        {!localStreamRef.current && (
          <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-sage to-beige flex items-center justify-center">
            <div className="text-center">
              <span className="text-7xl opacity-40 block">{catInfo?.emoji}</span>
              <p className="text-sm text-kk-text-muted mt-4">Permitir acesso à câmera para transmitir ao vivo</p>
            </div>
          </div>
        )}

        {/* Live badge */}
        <div className="absolute top-4 left-4 badge-live text-sm px-3 py-1.5">AO VIVO</div>

        {/* Screen recording indicator */}
        {mechanics.screenRec && (
          <div className="absolute top-4 left-28">
            <button
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                isScreenSharing
                  ? 'bg-red-500/90 text-white'
                  : 'bg-white/20 backdrop-blur-sm text-white border border-white/20'
              }`}
            >
              🖥️ {isScreenSharing ? 'Tela Compartilhada' : 'Compartilhar Tela'}
            </button>
          </div>
        )}

        {/* Theme banner */}
        {mechanics.theme && challengeTheme && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white px-6 py-3 rounded-2xl text-center max-w-xs">
            <p className="text-[10px] uppercase tracking-widest text-gold mb-1">Tema do Desafio</p>
            <p className="font-serif text-lg">{challengeTheme}</p>
          </div>
        )}

        {/* Viewers + Votes */}
        <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
          <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-white flex items-center gap-2">
            👀 {Math.floor(Math.random() * 30) + 5 + totalVotes}
          </div>
          {mechanics.viewerJudge && totalVotes > 0 && (
            <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-2xl text-xs text-white min-w-[120px]">
              <p className="text-[9px] text-center uppercase tracking-wider text-gold/80 mb-1.5">Votos</p>
              <div className="flex items-center gap-2">
                <span className="text-gold font-medium">{p1Pct}%</span>
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${p1Pct}%` }} />
                </div>
                <span className="text-white/70 font-medium">{p2Pct}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Opponent PiP — real WebRTC video or fallback avatar */}
        <div className="absolute top-20 right-4 w-28 h-36 rounded-2xl bg-beige border-2 border-gold/30 shadow-card overflow-hidden">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          {/* Fallback if no remote stream */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-beige/90">
            <span className="text-3xl font-serif text-kk-text">{opponent.displayName[0]}</span>
            <span className="text-[9px] text-kk-text-muted mt-1">{opponent.displayName}</span>
          </div>
        </div>

        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-4 left-28 flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-red-600/90 text-white text-xs px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              REC
            </div>
          </div>
        )}

        {/* Challenge Timer (countdown) */}
        {mechanics.timerMinutes > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className={`px-4 py-2 rounded-full text-lg font-mono font-bold ${
              timerRemaining <= 60 ? 'bg-red-500/90 text-white animate-pulse' : 'bg-black/50 backdrop-blur-sm text-gold'
            }`}>
              ⏱️ {formatTime(timerRemaining)}
            </div>
          </div>
        )}

        {/* Upload Result Modal */}
        {showUpload && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-ivory rounded-3xl p-8 max-w-sm mx-4 text-center">
              <span className="text-5xl block mb-4">⏰</span>
              <h3 className="font-serif text-2xl mb-2">Tempo Esgotado!</h3>
              <p className="text-sm text-kk-text-muted mb-6">Envie seu resultado final para avaliação</p>
              <button
                onClick={() => { setShowUpload(false); setPhase('judging') }}
                className="btn-gold w-full py-3 mb-3"
              >
                📤 Enviar Resultado
              </button>
              <button
                onClick={() => { setShowUpload(false); setPhase('judging') }}
                className="btn-outline w-full py-3 text-sm"
              >
                Pular — usar gravação ao vivo
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sage-dark via-sage-dark/95 to-transparent pt-16 pb-8 px-6">
          {/* Timer / Elapsed */}
          <div className="text-center mb-2">
            <p className="font-serif text-4xl text-gold">{formatTime(elapsed)}</p>
            <p className="text-xs text-sage-light mt-1">
              {subcatInfo?.label || catInfo?.label} · {modeInfo?.label || ''} · R${pool} pool
            </p>
          </div>

          {/* Tools info */}
          {mechanics.tools && mechanics.tools.length > 0 && (
            <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
              {mechanics.tools.map(tool => (
                <span key={tool} className="text-[9px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full">{tool}</span>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={() => {
                const tracks = localStreamRef.current?.getVideoTracks()
                if (tracks?.[0]) tracks[0].enabled = !tracks[0].enabled
              }}
              className="w-13 h-13 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-colors"
              style={{ width: 52, height: 52 }}
            >📷</button>
            <button
              onClick={() => {
                const tracks = localStreamRef.current?.getAudioTracks()
                if (tracks?.[0]) tracks[0].enabled = !tracks[0].enabled
              }}
              className="w-13 h-13 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-colors"
              style={{ width: 52, height: 52 }}
            >🎤</button>
            {mechanics.screenRec && (
              <button
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                className={`rounded-full flex items-center justify-center text-xl transition-colors ${
                  isScreenSharing ? 'bg-red-500/80 border border-red-400' : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20'
                }`}
                style={{ width: 52, height: 52 }}
              >🖥️</button>
            )}
            {mechanics.uploadResult && (
              <button
                onClick={() => setShowUpload(true)}
                className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-colors"
                style={{ width: 52, height: 52 }}
              >📤</button>
            )}
            <button
              onClick={() => { captureFrame(); stopRecording(); stopCamera(); stopScreenShare(); closePeerConnection(); setChallengeTheme(''); setPhase('judging') }}
              className="rounded-full bg-live flex items-center justify-center text-xl hover:opacity-90 transition-opacity"
              style={{ width: 52, height: 52 }}
            >⏹️</button>
            <button
              className="rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-colors"
              style={{ width: 52, height: 52 }}
            >💬</button>
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: JUDGING — IA + Viewers decide
  // ═══════════════════════════════════
  if (phase === 'judging') {
    const totalVotes = viewerVotes.player1 + viewerVotes.player2
    const p1Pct = totalVotes > 0 ? Math.round((viewerVotes.player1 / totalVotes) * 100) : 50
    const p2Pct = 100 - p1Pct

    // Auto-trigger AI judging when entering this phase
    if (!aiJudgment && !judgingLoading) {
      requestAIJudging()
    }

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
           style={{ background: 'radial-gradient(circle at 50% 30%, #E9EDC9 0%, #FEFAE0 70%)' }}>
        <Nav user={user} onLogout={logout} />

        <span className="text-6xl block mb-6">⚖️</span>
        <h2 className="font-serif text-heading mb-2">
          {aiJudgment ? 'Resultado da Avaliação' : 'Avaliação em andamento'}
        </h2>
        <p className="text-sm text-kk-text-muted mb-10">
          {subcatInfo?.label || catInfo?.label} · {modeInfo?.label || ''}
        </p>

        {/* Viewer votes */}
        {mechanics.viewerJudge && (
          <div className="w-full max-w-sm mb-8">
            <p className="sec-label mb-4">Votos dos Juízes (Espectadores)</p>
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-gold bg-beige flex items-center justify-center text-xl font-serif mx-auto mb-1">
                    {user?.displayName?.[0] || 'V'}
                  </div>
                  <p className="text-xs font-medium">{user?.displayName || 'Você'}</p>
                </div>
                <p className="font-serif text-2xl text-gold">{p1Pct}% — {p2Pct}%</p>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-tan bg-beige flex items-center justify-center text-xl font-serif mx-auto mb-1">
                    {opponent.displayName[0]}
                  </div>
                  <p className="text-xs font-medium">{opponent.displayName}</p>
                </div>
              </div>
              <div className="w-full h-3 bg-tan rounded-full overflow-hidden">
                <div className="h-full bg-gold-gradient rounded-full transition-all duration-1000" style={{ width: `${p1Pct}%` }} />
              </div>
              <p className="text-[10px] text-kk-text-muted text-center mt-2">{totalVotes} votos</p>
            </div>
          </div>
        )}

        {/* AI Analysis */}
        <div className="w-full max-w-sm mb-8">
          <p className="sec-label mb-4">Análise da IA</p>
          <div className="glass-card rounded-2xl p-5">
            {judgingLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center text-xl">🤖</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Analisando com IA...</p>
                  <p className="text-xs text-kk-text-muted">Processando frames capturados e votos</p>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
              </div>
            ) : aiJudgment ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center text-xl">🤖</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Veredicto: {aiJudgment.winner === 'player1' ? (user?.displayName || 'Você') : opponent.displayName}
                    </p>
                    <p className="text-xs text-kk-text-muted">
                      Confiança: {Math.round((aiJudgment.confidence || 0.5) * 100)}%
                    </p>
                  </div>
                  <span className="text-2xl">{aiJudgment.winner === 'player1' ? '🏆' : '🥈'}</span>
                </div>
                {aiJudgment.analysis && (
                  <p className="text-xs text-kk-text-muted mt-2 leading-relaxed">{aiJudgment.analysis}</p>
                )}
                {aiJudgment.player1Score != null && (
                  <div className="flex items-center gap-2 mt-3 text-xs">
                    <span className="text-gold font-medium">Você: {aiJudgment.player1Score}pts</span>
                    <span className="text-kk-text-muted">vs</span>
                    <span className="text-kk-text font-medium">{opponent.displayName}: {aiJudgment.player2Score}pts</span>
                  </div>
                )}
                <p className="text-[9px] text-kk-text-muted mt-2 uppercase tracking-wider">
                  Método: {aiJudgment.method === 'ai_vision_analysis' ? 'Claude Vision + Votos' : 'Votos dos Espectadores'}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center text-xl">🤖</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Preparando análise...</p>
                  <p className="text-xs text-kk-text-muted">{capturedFramesRef.current.length} frames capturados</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Finalize */}
        <button
          onClick={() => setPhase('result')}
          disabled={judgingLoading}
          className="btn-gold py-3 px-10 text-sm disabled:opacity-50"
        >
          {judgingLoading ? 'Aguarde a análise...' : 'Ver Resultado Final'}
        </button>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: RESULT
  // ═══════════════════════════════════
  if (phase === 'result') {
    const won = aiJudgment ? aiJudgment.winner === 'player1' : viewerVotes.player1 >= viewerVotes.player2

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
           style={{ background: won
             ? 'radial-gradient(circle at 50% 30%, #E9EDC9 0%, #FEFAE0 70%)'
             : 'radial-gradient(circle at 50% 30%, #FAEDCD 0%, #FEFAE0 70%)'
           }}>
        <Nav user={user} onLogout={logout} />

        <span className="text-7xl block mb-6">{won ? '🏆' : '🌱'}</span>
        <h2 className="font-serif text-display mb-2">
          {won ? 'Vitória!' : 'O Planeta Ganhou!'}
        </h2>
        <p className="text-sm text-kk-text-muted mb-8">
          {won
            ? `Você ganhou R$ ${(pool * 0.7).toFixed(2)} + ${Math.floor(selectedStake * 0.75)} VITA`
            : `R$ ${(pool * 0.3).toFixed(2)} foram para regeneração ambiental`}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="stat-num">{formatTime(elapsed)}</p>
            <p className="text-[10px] text-kk-text-muted mt-1">Duração</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="stat-num">{viewerVotes.player1 + viewerVotes.player2}</p>
            <p className="text-[10px] text-kk-text-muted mt-1">Votos</p>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="stat-num text-gold">{won ? `+R$${(pool * 0.7).toFixed(0)}` : `🌱 R$${(pool * 0.3).toFixed(0)}`}</p>
            <p className="text-[10px] text-kk-text-muted mt-1">{won ? 'Ganhos' : 'Regeneração'}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              setPhase('stake')
              setElapsed(0)
              setViewerVotes({ player1: 0, player2: 0 })
              setChallengeTheme('')
              setTimerRemaining(0)
              setAiJudgment(null)
              capturedFramesRef.current = []
            }}
            className="btn-gold py-3 px-8"
          >
            Jogar Novamente
          </button>
          <button
            onClick={() => {
              handleEndChallenge()
              setViewerVotes({ player1: 0, player2: 0 })
              setChallengeTheme('')
              setTimerRemaining(0)
            }}
            className="btn-outline py-3 px-8"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: CREATE CHALLENGE — custom challenges
  // ═══════════════════════════════════
  if (phase === 'create_challenge') {
    return (
      <div className="min-h-screen">
        <Nav user={user} onLogout={logout} />
        <section className="pt-28 pb-16 px-6">
          <div className="max-w-lg mx-auto">
            <button onClick={() => setPhase('home')} className="flex items-center gap-2 text-sm text-kk-text-muted hover:text-gold transition-colors mb-8">
              <span>←</span> Voltar
            </button>

            <div className="text-center mb-8">
              <span className="text-5xl block mb-4">🎯</span>
              <h2 className="font-serif text-heading">Criar Desafio Customizado</h2>
              <p className="text-sm text-kk-text-muted mt-2">Crie seu próprio desafio para a comunidade</p>
            </div>

            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5">
                <label className="text-xs text-kk-text-muted uppercase tracking-wider block mb-2">Nome do Desafio</label>
                <input type="text" placeholder="Ex: Quem faz mais embaixadinhas em 1 min" className="w-full bg-beige rounded-xl px-4 py-3 text-sm text-kk-text outline-none focus:ring-2 focus:ring-gold/30" />
              </div>

              <div className="glass-card rounded-2xl p-5">
                <label className="text-xs text-kk-text-muted uppercase tracking-wider block mb-2">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.key} className="text-xs bg-beige hover:bg-gold hover:text-white px-3 py-1.5 rounded-full transition-all">
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <label className="text-xs text-kk-text-muted uppercase tracking-wider block mb-2">Descrição e Regras</label>
                <textarea placeholder="Descreva como funciona o desafio, regras e critérios de vitória..." className="w-full bg-beige rounded-xl px-4 py-3 text-sm text-kk-text outline-none focus:ring-2 focus:ring-gold/30 h-24 resize-none" />
              </div>

              <div className="glass-card rounded-2xl p-5">
                <label className="text-xs text-kk-text-muted uppercase tracking-wider block mb-3">Mecânicas</label>
                <div className="flex flex-wrap gap-2">
                  {['📷 Câmera', '🖥️ Gravação de tela', '🎲 Tema sorteado', '⏱️ Timer', '📤 Upload resultado', '🤖 IA Analisa', '👀 Juízes votam'].map(m => (
                    <button key={m} className="text-[11px] bg-sage-light hover:bg-gold hover:text-white px-3 py-1.5 rounded-full transition-all">
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <label className="text-xs text-kk-text-muted uppercase tracking-wider block mb-2">Tempo limite (minutos)</label>
                <input type="number" placeholder="10" className="w-full bg-beige rounded-xl px-4 py-3 text-sm text-kk-text outline-none focus:ring-2 focus:ring-gold/30" />
              </div>

              <button className="btn-gold w-full py-4 text-base">
                Enviar para Aprovação
              </button>
              <p className="text-[10px] text-kk-text-muted text-center">
                Desafios customizados passam por aprovação antes de ficar disponíveis para a comunidade
              </p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return null
}
