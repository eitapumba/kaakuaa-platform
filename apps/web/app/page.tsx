'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/auth-context'
import { useSocket } from '../lib/use-socket'
import { api } from '../lib/api'

/* ═══════════════════════════════════════
   LANDING PAGE — for visitors
   ═══════════════════════════════════════ */

const LANDING_CATEGORIES = [
  { emoji: '🏋️', label: 'Sports', bg: 'bg-beige' },
  { emoji: '🎮', label: 'E-Sports', bg: 'bg-sage-light' },
  { emoji: '🧠', label: 'Evolução', bg: 'bg-beige' },
  { emoji: '🌿', label: 'Regeneração', bg: 'bg-sage-light' },
  { emoji: '🎤', label: 'Rap Battle', bg: 'bg-beige' },
  { emoji: '🍳', label: 'Culinária', bg: 'bg-sage-light' },
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
              Jogadores online agora
            </span>
          </div>

          {/* Title */}
          <h1 className="landing-title reveal-up stagger-1">
            Desafie. Jogue.<br />
            <span className="bg-gold-gradient bg-clip-text text-transparent">Regenere o Planeta.</span>
          </h1>

          {/* Subtitle */}
          <p className="landing-subtitle mx-auto mt-6 reveal-up stagger-2">
            Uma arena de desafios ao vivo onde cada partida financia projetos de regeneração ambiental.
            Aposte nas suas habilidades e faça a diferença.
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
            <p className="number">6</p>
            <p className="label">Categorias</p>
          </div>
          <div className="stat-block">
            <p className="number">30%</p>
            <p className="label">Para o Planeta</p>
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
          <p className="sec-label mb-4">O que é Jungle Games</p>
          <div className="draw-line mx-auto mb-8" />
          <h2 className="font-serif text-heading mb-6">
            A arena onde suas habilidades<br />
            <span className="text-gold">valem de verdade</span>
          </h2>
          <p className="landing-subtitle mx-auto">
            Escolha um desafio, defina sua aposta e enfrente oponentes ao vivo.
            Ganhe dinheiro real e VITA tokens — enquanto cada partida
            destina 30% para projetos de regeneração ambiental.
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
              { emoji: '🏋️', label: 'Sports', desc: 'Desafios físicos transmitidos ao vivo' },
              { emoji: '🎮', label: 'E-Sports', desc: 'Duelos em games competitivos' },
              { emoji: '🧠', label: 'Evolução', desc: 'Desafios de crescimento pessoal' },
              { emoji: '🌿', label: 'Regeneração', desc: 'Missões de impacto ambiental' },
              { emoji: '🎤', label: 'Rap Battle', desc: 'Batalhas de rima e improviso' },
              { emoji: '🍳', label: 'Culinária', desc: 'Duelos gastronômicos ao vivo' },
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
              { num: '1', title: 'Escolha o Desafio', desc: 'Selecione a categoria e defina seu stake. De R$20 a R$2.000.' },
              { num: '2', title: 'Enfrente ao Vivo', desc: 'Matchmaking instantâneo. Câmera liga e o desafio começa.' },
              { num: '3', title: 'Ganhe e Regenere', desc: 'Vencedor leva 59.5%. 30% vai para projetos ambientais.' },
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
                Cada desafio regenera o planeta
              </h2>
              <p className="landing-subtitle mx-auto mb-2">
                30% de cada pool é destinado a projetos reais — eco-vilas,
                reflorestamento e acesso à água limpa.
                Jogue e faça parte da mudança.
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
            Entre na arena
          </h2>
          <p className="landing-subtitle mx-auto mb-10">
            Crie sua conta em 30 segundos, ganhe 100 VITA de boas-vindas
            e comece a desafiar agora.
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
          Jungle Games — Desafie-se. Regenere o Planeta.
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
  { key: 'regeneration', emoji: '🌿', label: 'Regeneração', desc: 'Impacto ambiental', online: 18 },
  { key: 'rap_battle', emoji: '🎤', label: 'Rap Battle', desc: 'Batalhas de rima', online: 9 },
  { key: 'culinary', emoji: '🍳', label: 'Culinária', desc: 'Duelos gastronômicos', online: 15 },
]

const STAKES = [
  { amount: 20, tier: 'Bronze' },
  { amount: 50, tier: 'Bronze' },
  { amount: 200, tier: 'Silver' },
  { amount: 500, tier: 'Gold' },
  { amount: 2000, tier: 'Diamond' },
]

type Phase = 'home' | 'stake' | 'searching' | 'match' | 'live'

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
  const [selectedStake, setSelectedStake] = useState(200)
  const [preferLive, setPreferLive] = useState(true)
  const [countdown, setCountdown] = useState(5)
  const [elapsed, setElapsed] = useState(0)
  const [apiLoading, setApiLoading] = useState(false)

  // Camera refs for WebRTC
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const localStreamRef = useRef<MediaStream | null>(null)

  const catInfo = CATEGORIES.find(c => c.key === selectedCat)
  const pool = selectedStake * 2
  const winnerReceives = (pool * 0.595).toFixed(2)
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

  // Live timer
  useEffect(() => {
    if (phase === 'live') {
      startCamera()
      const timer = setInterval(() => setElapsed(prev => prev + 1), 1000)
      return () => {
        clearInterval(timer)
        stopCamera()
      }
    }
  }, [phase, startCamera, stopCamera])

  // ─── Handlers ───
  const handleSelectCategory = (key: string) => {
    if (!user) {
      router.push('/auth')
      return
    }
    setSelectedCat(key)
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

            {/* Regeneration banner */}
            <div className="mt-12 glass-card rounded-3xl p-8 flex items-center gap-6">
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
  // PHASE: STAKE
  // ═══════════════════════════════════
  if (phase === 'stake') {
    return (
      <div className="min-h-screen">
        <Nav user={user} onLogout={logout} />
        <section className="pt-28 pb-16 px-6">
          <div className="max-w-lg mx-auto">
            <button onClick={() => setPhase('home')} className="flex items-center gap-2 text-sm text-kk-text-muted hover:text-gold transition-colors mb-8">
              <span>←</span> Voltar
            </button>

            <div className="text-center mb-10">
              <div className="w-20 h-20 rounded-3xl bg-sage-light flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">{catInfo?.emoji}</span>
              </div>
              <h2 className="font-serif text-heading">{catInfo?.label}</h2>
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
                  <span className="text-kk-text-muted">Você recebe (59.5%)</span>
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

            <button onClick={handleSearch} disabled={apiLoading} className="btn-gold w-full py-4 text-base disabled:opacity-50">
              {apiLoading ? 'Entrando na fila...' : `Buscar Desafiante — R$${selectedStake}`}
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
    return (
      <div className="min-h-screen bg-sage-dark relative">
        {/* YOUR CAMERA — real WebRTC */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-[70vh] object-cover bg-black"
        />

        {/* Fallback if no camera */}
        {!localStreamRef.current && (
          <div className="absolute top-0 left-0 w-full h-[70vh] bg-gradient-to-b from-sage to-beige flex items-center justify-center">
            <div className="text-center">
              <span className="text-7xl opacity-40 block">{catInfo?.emoji}</span>
              <p className="text-sm text-kk-text-muted mt-4">Permitir acesso à câmera para transmitir ao vivo</p>
            </div>
          </div>
        )}

        {/* Live badge */}
        <div className="absolute top-6 left-6 badge-live text-sm px-3 py-1.5">AO VIVO</div>

        {/* Viewers */}
        <div className="absolute top-6 right-6 glass-card px-4 py-2 rounded-full text-sm text-kk-text">
          👀 {Math.floor(Math.random() * 30) + 5}
        </div>

        {/* Opponent PiP */}
        <div className="absolute top-20 right-5 w-28 h-36 rounded-2xl bg-beige border-2 border-gold/30 flex flex-col items-center justify-center shadow-card overflow-hidden">
          <span className="text-3xl font-serif text-kk-text">{opponent.displayName[0]}</span>
          <span className="text-[10px] text-kk-text-muted mt-1">{opponent.displayName}</span>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sage-dark via-sage-dark/95 to-transparent pt-20 pb-10 px-6">
          <p className="font-serif text-5xl text-gold text-center">{formatTime(elapsed)}</p>
          <p className="text-sm text-sage-light text-center mt-2">{catInfo?.label} · R${pool} pool</p>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => {
                const tracks = localStreamRef.current?.getVideoTracks()
                if (tracks?.[0]) tracks[0].enabled = !tracks[0].enabled
              }}
              className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-colors"
            >📷</button>
            <button
              onClick={() => {
                const tracks = localStreamRef.current?.getAudioTracks()
                if (tracks?.[0]) tracks[0].enabled = !tracks[0].enabled
              }}
              className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-colors"
            >🎤</button>
            <button
              onClick={handleEndChallenge}
              className="w-14 h-14 rounded-full bg-live flex items-center justify-center text-xl hover:opacity-90 transition-opacity"
            >⏹️</button>
            <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-xl hover:bg-white/20 transition-colors">
              💬
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
