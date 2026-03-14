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
  { key: 'sports', emoji: '🏋️', label: 'Sports', desc: 'Desafios físicos ao vivo', online: 47 },
  { key: 'esports', emoji: '🎮', label: 'E-Sports', desc: 'Games competitivos', online: 124 },
  { key: 'personal_evolution', emoji: '🧠', label: 'Evolução', desc: 'Crescimento pessoal', online: 33 },
  { key: 'arts', emoji: '🎨', label: 'Artes', desc: 'Criatividade em desafio', online: 22 },
  { key: 'rap_battle', emoji: '🎤', label: 'Rap Battle', desc: 'Batalhas de rima', online: 9 },
  { key: 'culinary', emoji: '🍳', label: 'Culinária', desc: 'Duelos gastronômicos', online: 15 },
  { key: 'hero_journey', emoji: '🎬', label: 'Jornada do Herói', desc: 'Do roteiro ao curta-metragem', online: 18 },
]

const STAKES = [
  { amount: 20, tier: 'Bronze' },
  { amount: 50, tier: 'Bronze' },
  { amount: 200, tier: 'Silver' },
  { amount: 500, tier: 'Gold' },
  { amount: 2000, tier: 'Diamond' },
]

type Phase = 'home' | 'subcategory' | 'mode' | 'stake' | 'searching' | 'match' | 'live' | 'judging' | 'result' | 'create_challenge'
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
  const { matchData, searchingData, challengeStarted, clearMatch } = useSocket(user?.id)

  const [phase, setPhase] = useState<Phase>('home')
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
  const [challengeTheme, setChallengeTheme] = useState('')
  const [challengeTimer, setChallengeTimer] = useState(0)
  const [timerRemaining, setTimerRemaining] = useState(0)
  const [viewerVotes, setViewerVotes] = useState({ player1: 0, player2: 0 })
  const [hasVoted, setHasVoted] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const screenStreamRef = useRef<MediaStream | null>(null)

  // Camera refs for WebRTC
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

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

  // Live timer + challenge timer
  useEffect(() => {
    if (phase === 'live') {
      startCamera()
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
              // Timer acabou — ir para judging
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
      // Simular votos de espectadores
      const voteInterval = setInterval(() => {
        if (mechanics.viewerJudge) {
          setViewerVotes(prev => ({
            player1: prev.player1 + Math.floor(Math.random() * 3),
            player2: prev.player2 + Math.floor(Math.random() * 3),
          }))
        }
      }, 4000)
      return () => {
        clearInterval(timer)
        clearInterval(voteInterval)
        stopCamera()
        stopScreenShare()
      }
    }
  }, [phase, startCamera, stopCamera, stopScreenShare, mechanics, challengeTheme, pickRandomTheme])

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

  // Screen sharing
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
    clearMatch()
    setPhase('home')
    setElapsed(0)
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
  // PHASE: HOME
  // ═══════════════════════════════════
  if (phase === 'home') {
    const displayName = user?.displayName || 'Guerreiro'
    const vitaBalance = user?.vitaBalance || 0
    const wins = user?.challengesWon || 0
    const completed = user?.challengesCompleted || 0
    const losses = completed - wins
    const totalEarnings = user?.totalEarnings || 0

    return (
      <div className="min-h-screen">
        <Nav user={user} onLogout={logout} />

        <section className="pt-28 pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Greeting */}
            <div className="flex items-center justify-between mb-12">
              <div>
                <p className="sec-label mb-3">
                  {new Date().getHours() < 12 ? 'Bom dia' : new Date().getHours() < 18 ? 'Boa tarde' : 'Boa noite'}, {displayName}
                </p>
                <h1 className="font-serif text-display">
                  Desafie-se.<br />
                  <span className="bg-gold-gradient bg-clip-text text-transparent">Regenere o Planeta.</span>
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-5">
                <div className="text-right">
                  <p className="stat-num">{vitaBalance.toLocaleString()}</p>
                  <p className="text-xs text-kk-text-muted mt-1">VITA</p>
                </div>
                <div className="w-px h-10 bg-gold-muted" />
                <div className="text-right">
                  <p className="stat-num">{wins}-{losses}</p>
                  <p className="text-xs text-kk-text-muted mt-1">W-L</p>
                </div>
                <div className="w-px h-10 bg-gold-muted" />
                <div className="text-right">
                  <p className="stat-num">R${totalEarnings}</p>
                  <p className="text-xs text-kk-text-muted mt-1">Ganhos</p>
                </div>
              </div>
            </div>

            {/* Mobile stats */}
            <div className="grid grid-cols-3 gap-3 mb-10 md:hidden">
              {[
                { val: vitaBalance.toLocaleString(), label: 'VITA' },
                { val: `${wins}-${losses}`, label: 'W-L' },
                { val: `R$${totalEarnings}`, label: 'Ganhos' },
              ].map(s => (
                <div key={s.label} className="glass-card rounded-2xl p-4 text-center">
                  <p className="stat-num text-xl">{s.val}</p>
                  <p className="text-xs text-kk-text-muted mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Section label */}
            <div className="flex items-center gap-4 mb-6">
              <p className="sec-label">Escolha seu desafio</p>
              <div className="gold-line flex-1" />
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat.key}
                  onClick={() => handleSelectCategory(cat.key)}
                  className="premium-card group text-left p-0 cursor-pointer"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="p-6 pb-5">
                    <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                      <span className="text-3xl">{cat.emoji}</span>
                    </div>
                    <h3 className="font-serif text-xl font-normal text-kk-text mb-1">{cat.label}</h3>
                    <p className="text-xs text-kk-text-muted font-light">{cat.desc}</p>
                  </div>
                  <div className="px-6 py-3 border-t border-gold-muted flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-kk-text-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      {cat.online} online
                    </span>
                    <span className="text-gold text-xs font-medium tracking-wide group-hover:translate-x-1 transition-transform">
                      Jogar →
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Create custom challenge button */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setPhase('create_challenge')}
                className="btn-outline text-sm py-3 px-8 flex items-center gap-2"
              >
                🎯 Criar Desafio Customizado
              </button>
            </div>

            {/* Regeneration banner */}
            <div className="mt-8 glass-card rounded-3xl p-8 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-sage-light flex items-center justify-center text-3xl flex-shrink-0">
                🌱
              </div>
              <div>
                <h3 className="font-serif text-lg">Cada desafio regenera o planeta</h3>
                <p className="text-sm text-kk-text-muted mt-1">
                  30% de cada pool vai para projetos de regeneração ambiental — eco-vilas, reflorestamento e água limpa.
                </p>
              </div>
              <p className="stat-num hidden md:block flex-shrink-0">R${Math.floor(totalEarnings * 0.3)}</p>
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: SUBCATEGORY
  // ═══════════════════════════════════
  if (phase === 'subcategory') {
    const subs = SUBCATEGORIES[selectedCat] || []
    return (
      <div className="min-h-screen">
        <Nav user={user} onLogout={logout} />
        <section className="pt-28 pb-16 px-6">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => setPhase('home')} className="flex items-center gap-2 text-sm text-kk-text-muted hover:text-gold transition-colors mb-8">
              <span>←</span> Voltar
            </button>

            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-3xl bg-sage-light flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">{catInfo?.emoji}</span>
              </div>
              <h2 className="font-serif text-heading">{catInfo?.label}</h2>
              <p className="text-sm text-kk-text-muted mt-2">Escolha sua modalidade</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {subs.map((sub, i) => (
                <button
                  key={sub.key}
                  onClick={() => handleSelectSubcategory(sub.key)}
                  className="premium-card group text-center p-5 cursor-pointer hover:border-gold transition-all duration-300"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-500">
                    <span className="text-3xl">{sub.emoji}</span>
                  </div>
                  <h3 className="font-serif text-base font-normal text-kk-text mb-1">{sub.label}</h3>
                  <p className="text-[11px] text-kk-text-muted font-light leading-relaxed">{sub.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: MODE (Challenge Type)
  // ═══════════════════════════════════
  if (phase === 'mode') {
    const modes = getChallengeModes(selectedCat)
    return (
      <div className="min-h-screen">
        <Nav user={user} onLogout={logout} />
        <section className="pt-28 pb-16 px-6">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setPhase('subcategory')} className="flex items-center gap-2 text-sm text-kk-text-muted hover:text-gold transition-colors mb-8">
              <span>←</span> Voltar
            </button>

            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center">
                  <span className="text-3xl">{catInfo?.emoji}</span>
                </div>
                <span className="text-kk-text-muted text-xl">→</span>
                <div className="w-14 h-14 rounded-2xl bg-beige flex items-center justify-center">
                  <span className="text-3xl">{subcatInfo?.emoji}</span>
                </div>
              </div>
              <h2 className="font-serif text-heading">{subcatInfo?.label}</h2>
              <p className="text-sm text-kk-text-muted mt-2">Escolha o modo de desafio</p>
            </div>

            {/* Modos clássicos */}
            <div className="mb-6">
              <p className="sec-label mb-4">Modos Clássicos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modes.filter(m => CHALLENGE_MODES._default.some(d => d.key === m.key)).map((mode, i) => (
                  <button
                    key={mode.key}
                    onClick={() => handleSelectMode(mode.key)}
                    className="premium-card group text-left p-5 cursor-pointer hover:border-gold transition-all duration-300"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <span className="text-2xl">{mode.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-lg font-normal text-kk-text">{mode.label}</h3>
                        <p className="text-xs text-kk-text-muted font-light mt-0.5">{mode.desc}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full">{mode.players} jogadores</span>
                          <span className="text-[10px] text-kk-text-muted">{mode.duration}</span>
                        </div>
                      </div>
                      <span className="text-gold text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Jogar →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Modos divertidos (se existirem) */}
            {modes.filter(m => !CHALLENGE_MODES._default.some(d => d.key === m.key)).length > 0 && (
              <div>
                <p className="sec-label mb-4">Modos Divertidos</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {modes.filter(m => !CHALLENGE_MODES._default.some(d => d.key === m.key)).map((mode, i) => (
                    <button
                      key={mode.key}
                      onClick={() => handleSelectMode(mode.key)}
                      className="premium-card group text-left p-5 cursor-pointer hover:border-gold transition-all duration-300 border-dashed"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-beige flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
                          <span className="text-2xl">{mode.emoji}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif text-lg font-normal text-kk-text">{mode.label}</h3>
                          <p className="text-xs text-kk-text-muted font-light mt-0.5">{mode.desc}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded-full">{mode.players} jogadores</span>
                            <span className="text-[10px] text-kk-text-muted">{mode.duration}</span>
                          </div>
                        </div>
                        <span className="text-gold text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Jogar →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: STAKE
  // ═══════════════════════════════════
  if (phase === 'stake') {
    return (
      <div className="min-h-screen">
        <Nav user={user} onLogout={logout} />
        <section className="pt-28 pb-16 px-6">
          <div className="max-w-lg mx-auto">
            <button onClick={() => selectedMode ? setPhase('mode') : selectedSubcat ? setPhase('subcategory') : setPhase('home')} className="flex items-center gap-2 text-sm text-kk-text-muted hover:text-gold transition-colors mb-8">
              <span>←</span> Voltar
            </button>

            <div className="text-center mb-10">
              {/* Breadcrumb visual */}
              <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center">
                  <span className="text-2xl">{catInfo?.emoji}</span>
                </div>
                {subcatInfo && (
                  <>
                    <span className="text-kk-text-muted text-lg">→</span>
                    <div className="w-14 h-14 rounded-2xl bg-beige flex items-center justify-center">
                      <span className="text-2xl">{subcatInfo.emoji}</span>
                    </div>
                  </>
                )}
                {modeInfo && (
                  <>
                    <span className="text-kk-text-muted text-lg">→</span>
                    <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center">
                      <span className="text-2xl">{modeInfo.emoji}</span>
                    </div>
                  </>
                )}
              </div>
              <h2 className="font-serif text-heading">
                {subcatInfo ? subcatInfo.label : catInfo?.label}
                {modeInfo ? ` · ${modeInfo.label}` : ''}
              </h2>
              <p className="text-sm text-kk-text-muted mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-1.5 animate-pulse" />
                {catInfo?.online} jogadores online
              </p>
            </div>

            <div className="mb-8">
              <p className="sec-label mb-4">Defina seu stake</p>
              <div className="grid grid-cols-5 gap-3">
                {STAKES.map(s => (
                  <button
                    key={s.amount}
                    onClick={() => setSelectedStake(s.amount)}
                    className={`rounded-2xl py-4 text-center transition-all duration-300 ${
                      selectedStake === s.amount
                        ? 'bg-gold text-white shadow-gold scale-105'
                        : 'glass-card hover:border-gold'
                    }`}
                  >
                    <span className="text-lg font-medium block">
                      {s.amount >= 1000 ? `${s.amount / 1000}k` : s.amount}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider block mt-1 ${
                      selectedStake === s.amount ? 'text-white/80' : 'text-kk-text-muted'
                    }`}>{s.tier}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Match Type: Online vs Amigo */}
            <div className="mb-6">
              <p className="sec-label mb-3">Tipo de partida</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setMatchType('online'); setFriendCode('') }}
                  className={`rounded-2xl py-4 px-4 text-center transition-all duration-300 ${
                    matchType === 'online' ? 'bg-gold text-white shadow-gold' : 'glass-card hover:border-gold'
                  }`}
                >
                  <span className="text-2xl block mb-1">🌐</span>
                  <span className="text-sm font-medium block">Online</span>
                  <span className={`text-[10px] block mt-0.5 ${matchType === 'online' ? 'text-white/70' : 'text-kk-text-muted'}`}>Contra qualquer pessoa</span>
                </button>
                <button
                  onClick={() => setMatchType('friend')}
                  className={`rounded-2xl py-4 px-4 text-center transition-all duration-300 ${
                    matchType === 'friend' ? 'bg-gold text-white shadow-gold' : 'glass-card hover:border-gold'
                  }`}
                >
                  <span className="text-2xl block mb-1">👥</span>
                  <span className="text-sm font-medium block">Desafiar Amigo</span>
                  <span className={`text-[10px] block mt-0.5 ${matchType === 'friend' ? 'text-white/70' : 'text-kk-text-muted'}`}>Convide pelo código</span>
                </button>
              </div>

              {/* Friend code input */}
              {matchType === 'friend' && (
                <div className="mt-4 glass-card rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1">
                      <p className="text-xs text-kk-text-muted mb-1.5">Seu código de convite</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-beige rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-widest text-gold font-medium">
                          {(user?.id?.slice(0, 6) || 'ABC123').toUpperCase()}
                        </div>
                        <button
                          onClick={() => navigator.clipboard?.writeText((user?.id?.slice(0, 6) || 'ABC123').toUpperCase())}
                          className="btn-outline text-xs py-2.5 px-3"
                        >Copiar</button>
                      </div>
                    </div>
                  </div>
                  <div className="divider mb-3" />
                  <p className="text-xs text-kk-text-muted mb-1.5">Código do amigo</p>
                  <input
                    type="text"
                    placeholder="Cole o código aqui"
                    value={friendCode}
                    onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                    className="w-full bg-beige rounded-xl px-4 py-2.5 text-center font-mono text-lg tracking-widest text-kk-text placeholder:text-kk-text-muted/40 outline-none focus:ring-2 focus:ring-gold/30"
                    maxLength={6}
                  />
                </div>
              )}
            </div>

            {/* Mechanics preview */}
            {selectedSubcat && (
              <div className="glass-card rounded-2xl p-4 mb-5">
                <p className="sec-label mb-3">Como funciona este desafio</p>
                <div className="flex flex-wrap gap-2">
                  {mechanics.camera && (
                    <span className="text-[11px] bg-sage-light text-kk-text px-3 py-1.5 rounded-full flex items-center gap-1.5">📷 Câmera ao vivo</span>
                  )}
                  {mechanics.screenRec && (
                    <span className="text-[11px] bg-sage-light text-kk-text px-3 py-1.5 rounded-full flex items-center gap-1.5">🖥️ Gravação de tela</span>
                  )}
                  {mechanics.theme && (
                    <span className="text-[11px] bg-sage-light text-kk-text px-3 py-1.5 rounded-full flex items-center gap-1.5">🎲 Tema sorteado</span>
                  )}
                  {mechanics.timerMinutes > 0 && (
                    <span className="text-[11px] bg-sage-light text-kk-text px-3 py-1.5 rounded-full flex items-center gap-1.5">⏱️ {mechanics.timerMinutes} min</span>
                  )}
                  {mechanics.uploadResult && (
                    <span className="text-[11px] bg-sage-light text-kk-text px-3 py-1.5 rounded-full flex items-center gap-1.5">📤 Upload resultado</span>
                  )}
                  {mechanics.aiJudge && (
                    <span className="text-[11px] bg-sage-light text-kk-text px-3 py-1.5 rounded-full flex items-center gap-1.5">🤖 IA analisa</span>
                  )}
                  {mechanics.viewerJudge && (
                    <span className="text-[11px] bg-sage-light text-kk-text px-3 py-1.5 rounded-full flex items-center gap-1.5">👀 Juízes votam</span>
                  )}
                </div>
                {mechanics.tools && mechanics.tools.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gold-muted">
                    <p className="text-[10px] text-kk-text-muted uppercase tracking-wider mb-2">Ferramentas permitidas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {mechanics.tools.map(tool => (
                        <span key={tool} className="text-[10px] bg-beige text-kk-text px-2.5 py-1 rounded-full">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="glass-card rounded-2xl p-5 flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-medium text-kk-text">Desafio ao vivo</p>
                <p className="text-xs text-kk-text-muted mt-0.5">Câmera liga quando match acontecer</p>
              </div>
              <button
                onClick={() => setPreferLive(!preferLive)}
                className={`w-12 h-7 rounded-full relative transition-all duration-300 ${preferLive ? 'bg-gold shadow-gold' : 'bg-tan'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ${preferLive ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="glass-card rounded-2xl p-5 mb-8">
              <p className="sec-label mb-4">Se você vencer</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-kk-text-muted">Pool total</span>
                  <span className="text-kk-text">R$ {pool.toFixed(2)}</span>
                </div>
                <div className="divider" />
                <div className="flex justify-between text-sm">
                  <span className="text-kk-text-muted">Você recebe (70%)</span>
                  <span className="text-gold font-medium">R$ {winnerReceives}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-kk-text-muted">Fundo Regeneração (30%)</span>
                  <span className="text-kk-text">R$ {fundAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-kk-text-muted">VITA Bonus</span>
                  <span className="text-gold font-medium">+{Math.floor(selectedStake * 0.75)} VITA</span>
                </div>
              </div>
            </div>

            <button onClick={handleSearch} disabled={apiLoading || (matchType === 'friend' && friendCode.length < 4)} className="btn-gold w-full py-4 text-base disabled:opacity-50">
              {apiLoading
                ? 'Entrando na fila...'
                : matchType === 'friend'
                  ? friendCode.length >= 4 ? `Desafiar Amigo — R$${selectedStake}` : 'Digite o código do amigo'
                  : `Buscar Desafiante — R$${selectedStake}`}
            </button>
          </div>
        </section>
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

        {/* Opponent PiP */}
        <div className="absolute top-20 right-4 w-24 h-32 rounded-2xl bg-beige border-2 border-gold/30 flex flex-col items-center justify-center shadow-card overflow-hidden">
          <span className="text-3xl font-serif text-kk-text">{opponent.displayName[0]}</span>
          <span className="text-[9px] text-kk-text-muted mt-1">{opponent.displayName}</span>
        </div>

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
              onClick={() => { stopCamera(); stopScreenShare(); setChallengeTheme(''); setPhase('judging') }}
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
    const aiVerdict = p1Pct >= 50 // IA concorda com maioria (simplificado)

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6"
           style={{ background: 'radial-gradient(circle at 50% 30%, #E9EDC9 0%, #FEFAE0 70%)' }}>
        <Nav user={user} onLogout={logout} />

        <span className="text-6xl block mb-6">⚖️</span>
        <h2 className="font-serif text-heading mb-2">Avaliação em andamento</h2>
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
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center text-xl">🤖</div>
              <div className="flex-1">
                <p className="text-sm font-medium">Verificação automática</p>
                <p className="text-xs text-kk-text-muted">Analisando performance e resultado...</p>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            </div>
          </div>
        </div>

        {/* Finalize */}
        <button
          onClick={() => {
            setPhase('result')
          }}
          className="btn-gold py-3 px-10 text-sm"
        >
          Ver Resultado Final
        </button>
      </div>
    )
  }

  // ═══════════════════════════════════
  // PHASE: RESULT
  // ═══════════════════════════════════
  if (phase === 'result') {
    const won = viewerVotes.player1 >= viewerVotes.player2

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
