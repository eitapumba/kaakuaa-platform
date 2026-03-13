'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const LIVE_CHALLENGES = [
  { id: '1', cat: '🏋️', title: 'Pumba vs Marina_RJ', category: 'Sports', viewers: 23, timer: '04:32', pool: 400, featured: true },
  { id: '2', cat: '🎮', title: 'xBlaze vs Kira99', category: 'E-Sports', viewers: 87, timer: '12:05', pool: 1000, featured: true },
  { id: '3', cat: '🧠', title: 'ZenMaster vs LucasDF', category: 'Evolução', viewers: 12, timer: '01:44', pool: 100, featured: false },
  { id: '4', cat: '🎤', title: 'MC_Flow vs RapGod', category: 'Rap Battle', viewers: 156, timer: '03:18', pool: 500, featured: false },
  { id: '5', cat: '🍳', title: 'ChefNina vs Flavinho', category: 'Culinária', viewers: 34, timer: '08:22', pool: 200, featured: false },
  { id: '6', cat: '🌿', title: 'EcoWarrior vs PlantBoss', category: 'Regeneração', viewers: 8, timer: '00:55', pool: 40, featured: false },
]

export default function TVPage() {
  const [filter, setFilter] = useState('all')

  const featured = LIVE_CHALLENGES.filter(c => c.featured)
  const feed = filter === 'all' ? LIVE_CHALLENGES : LIVE_CHALLENGES.filter(c => c.category === filter)

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/logo-nav.png" alt="Kaa Kuaa" width={120} height={36} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-gold tracking-wide">Ao Vivo</span>
            <Link href="/invest" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Investir</Link>
            <Link href="/marketplace" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Loja</Link>
            <Link href="/profile" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Perfil</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <p className="sec-label mb-3">Transmissões</p>
          <h1 className="font-serif text-display">Ao Vivo Agora</h1>
        </div>

        {/* Featured */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
          {featured.map(ch => (
            <div key={ch.id} className="premium-card group cursor-pointer">
              <div className="relative w-full h-52 bg-gradient-to-br from-sage-light to-beige flex items-center justify-center overflow-hidden">
                <span className="text-7xl group-hover:scale-110 transition-transform duration-700 opacity-60">{ch.cat}</span>
                <div className="absolute top-4 left-4 badge-live">AO VIVO</div>
                <div className="absolute top-4 right-4 glass-card px-3 py-1 rounded-full text-xs text-kk-text">
                  👀 {ch.viewers}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg text-kk-text">{ch.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-kk-text-muted">{ch.category} · {ch.timer}</span>
                  <span className="text-sm text-gold font-medium">R$ {ch.pool} pool</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <p className="sec-label">Todas as transmissões</p>
          <div className="gold-line flex-1" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'Sports', 'E-Sports', 'Evolução', 'Regeneração', 'Rap Battle', 'Culinária'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`pill ${filter === f ? 'pill-active' : ''}`}
            >
              {f === 'all' ? 'Todos' : f}
            </button>
          ))}
        </div>

        {/* Feed list */}
        <div className="space-y-3">
          {feed.map(ch => (
            <div key={ch.id} className="glass-card rounded-2xl p-5 flex items-center gap-5 cursor-pointer">
              <div className="w-16 h-16 rounded-2xl bg-sage-light flex items-center justify-center text-3xl flex-shrink-0">
                {ch.cat}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-serif text-base text-kk-text truncate">{ch.title}</p>
                <p className="text-xs text-kk-text-muted mt-1">{ch.category} · {ch.timer}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-gold font-medium">R$ {ch.pool}</p>
                <p className="text-xs text-kk-text-muted mt-1">👀 {ch.viewers}</p>
              </div>
              <div className="badge-live flex-shrink-0">LIVE</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
