'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../../lib/auth-context'

const CATEGORIES = [
  { key: 'all', emoji: '🔥', label: 'Todos' },
  { key: 'sports', emoji: '🏋️', label: 'Sports' },
  { key: 'esports', emoji: '🎮', label: 'E-Sports' },
  { key: 'personal_evolution', emoji: '🧠', label: 'Evolução' },
  { key: 'regeneration', emoji: '🌿', label: 'Regeneração' },
  { key: 'rap_battle', emoji: '🎤', label: 'Rap Battle' },
  { key: 'culinary', emoji: '🍳', label: 'Culinária' },
]

const SAMPLE_CHALLENGES = [
  {
    id: '1', title: '100 flexões em 5 minutos', category: 'sports', emoji: '🏋️',
    creator: 'Pumba', creatorRank: 'Silver', stake: 200, type: 'live',
    description: 'Quem faz mais flexões em 5 min. Câmera ao vivo, contagem por IA.',
    participants: 1, maxParticipants: 2, status: 'open', timeAgo: '2 min',
  },
  {
    id: '2', title: 'Freestyle Battle — Tema Livre', category: 'rap_battle', emoji: '🎤',
    creator: 'MC_Flow', creatorRank: 'Gold', stake: 500, type: 'live',
    description: '2 rounds de 1 min cada. Público vota. Ao vivo com câmera.',
    participants: 1, maxParticipants: 2, status: 'open', timeAgo: '5 min',
  },
  {
    id: '3', title: 'Melhor prato com 5 ingredientes', category: 'culinary', emoji: '🍳',
    creator: 'ChefNina', creatorRank: 'Gold', stake: 100, type: 'live',
    description: '30 min para cozinhar. Ingredientes secretos revelados na hora.',
    participants: 1, maxParticipants: 2, status: 'open', timeAgo: '12 min',
  },
  {
    id: '4', title: 'Ranked 1v1 — Valorant', category: 'esports', emoji: '🎮',
    creator: 'xBlaze', creatorRank: 'Diamond', stake: 1000, type: 'screen',
    description: 'Best of 3 rounds. Screen capture obrigatório.',
    participants: 1, maxParticipants: 2, status: 'open', timeAgo: '1 min',
  },
  {
    id: '5', title: 'Plantar 10 mudas — prova por foto', category: 'regeneration', emoji: '🌿',
    creator: 'EcoWarrior', creatorRank: 'Silver', stake: 50, type: 'photo',
    description: 'Quem plantar mais mudas em 24h. Prova por foto com GPS.',
    participants: 1, maxParticipants: 4, status: 'open', timeAgo: '30 min',
  },
  {
    id: '6', title: 'Meditação 30 min sem parar', category: 'personal_evolution', emoji: '🧠',
    creator: 'ZenMaster', creatorRank: 'Silver', stake: 20, type: 'live',
    description: 'Câmera ao vivo. IA monitora se manteve postura. Perde se mexer demais.',
    participants: 1, maxParticipants: 2, status: 'open', timeAgo: '8 min',
  },
]

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  live: { label: 'Ao Vivo', color: 'bg-red-50 text-red-500' },
  screen: { label: 'Screen Capture', color: 'bg-purple-50 text-purple-500' },
  photo: { label: 'Foto + GPS', color: 'bg-blue-50 text-blue-500' },
  video: { label: 'Enviar Vídeo', color: 'bg-amber-50 text-amber-600' },
}

export default function ChallengesPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'recent' | 'stake' | 'popular'>('recent')

  const filtered = filter === 'all'
    ? SAMPLE_CHALLENGES
    : SAMPLE_CHALLENGES.filter(c => c.category === filter)

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'stake') return b.stake - a.stake
    return 0
  })

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/logo-nav.png" alt="Kaa Kuaa" width={120} height={36} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/tv" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Ao Vivo</Link>
            <span className="text-sm font-medium text-gold tracking-wide">Desafios</span>
            <Link href="/marketplace" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Loja</Link>
            <Link href="/profile" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Perfil</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="sec-label mb-3">Arena</p>
            <h1 className="font-serif text-display">Desafios Disponíveis</h1>
          </div>
          <Link href="/challenges/create" className="btn-gold">
            Criar Desafio
          </Link>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`pill flex items-center gap-1.5 ${filter === c.key ? 'pill-active' : ''}`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4 mb-6">
          <div className="gold-line flex-1" />
          <div className="flex gap-1 p-1 glass-card rounded-xl">
            {[
              { key: 'recent' as const, label: 'Recentes' },
              { key: 'stake' as const, label: 'Maior Stake' },
              { key: 'popular' as const, label: 'Popular' },
            ].map(s => (
              <button
                key={s.key}
                onClick={() => setSortBy(s.key)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                  sortBy === s.key ? 'bg-gold text-white' : 'text-kk-text-muted hover:text-gold'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge cards */}
        <div className="space-y-4">
          {sorted.map(ch => (
            <div key={ch.id} className="glass-card rounded-2xl p-6 hover:shadow-card-hover transition-all cursor-pointer group">
              <div className="flex items-start gap-5">
                {/* Category icon */}
                <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  {ch.emoji}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-serif text-lg text-kk-text truncate">{ch.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_LABELS[ch.type].color}`}>
                      {TYPE_LABELS[ch.type].label}
                    </span>
                  </div>
                  <p className="text-xs text-kk-text-muted mb-3">{ch.description}</p>
                  <div className="flex items-center gap-4 text-xs text-kk-text-muted">
                    <span>por <span className="text-kk-text font-medium">{ch.creator}</span></span>
                    <span className="badge-rank badge-silver text-[9px]">{ch.creatorRank}</span>
                    <span>{ch.participants}/{ch.maxParticipants} jogadores</span>
                    <span>{ch.timeAgo} atrás</span>
                  </div>
                </div>

                {/* Stake + action */}
                <div className="text-right flex-shrink-0">
                  <p className="stat-num text-xl">R${ch.stake}</p>
                  <p className="text-[10px] text-kk-text-muted mt-1">stake</p>
                  <button className="btn-gold text-[10px] py-2 px-4 mt-3">
                    Aceitar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {sorted.length === 0 && (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">🏜️</span>
            <h3 className="font-serif text-xl mb-2">Nenhum desafio nessa categoria</h3>
            <p className="text-sm text-kk-text-muted mb-6">Seja o primeiro a criar um!</p>
            <Link href="/challenges/create" className="btn-gold">Criar Desafio</Link>
          </div>
        )}
      </div>
    </div>
  )
}
