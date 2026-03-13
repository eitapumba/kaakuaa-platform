'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const MATCH_HISTORY = [
  { id: '1', opponent: 'Marina_RJ', category: 'Sports', result: 'win' as const, stake: 200, earned: '+R$238', date: '12 Mar' },
  { id: '2', opponent: 'xBlaze', category: 'E-Sports', result: 'loss' as const, stake: 500, earned: '-R$500', date: '11 Mar' },
  { id: '3', opponent: 'JoãoPedro', category: 'Sports', result: 'win' as const, stake: 200, earned: '+R$238', date: '10 Mar' },
  { id: '4', opponent: 'LucasDF', category: 'Evolução', result: 'win' as const, stake: 50, earned: '+R$59.50', date: '9 Mar' },
  { id: '5', opponent: 'KiraFit', category: 'Sports', result: 'win' as const, stake: 200, earned: '+R$238', date: '8 Mar' },
]

export default function ProfilePage() {
  const [tab, setTab] = useState<'history' | 'investments' | 'achievements'>('history')

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
            <Link href="/invest" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Investir</Link>
            <Link href="/marketplace" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Loja</Link>
            <span className="text-sm font-medium text-gold tracking-wide">Perfil</span>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-28 pb-16">
        {/* Profile header */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-24 h-24 rounded-full bg-gold-gradient flex items-center justify-center text-white font-serif text-4xl shadow-gold">
            P
          </div>
          <div>
            <h1 className="font-serif text-heading">Pumba</h1>
            <p className="text-sm text-kk-text-muted mt-1">
              <span className="badge-rank badge-silver">Silver</span>
              <span className="ml-2">🔥 3 dias de streak</span>
            </p>
            <p className="text-xs text-kk-text-muted mt-1">Membro desde Janeiro 2026</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { val: '1.250', label: 'VITA' },
            { val: '12-3', label: 'W-L' },
            { val: '80%', label: 'Win Rate' },
            { val: 'R$840', label: 'Ganhos' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-2xl p-5 text-center">
              <p className="stat-num">{s.val}</p>
              <p className="text-xs text-kk-text-muted mt-2">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Regeneration impact */}
        <div className="glass-card rounded-3xl p-7 mb-10">
          <p className="sec-label mb-4">Seu Impacto Regenerativo</p>
          <div className="flex items-center gap-8">
            {[
              { val: 'R$252', label: 'Doado via desafios' },
              { val: '12', label: 'Árvores plantadas' },
              { val: '0.8t', label: 'CO₂ compensado' },
            ].map(s => (
              <div key={s.label}>
                <p className="stat-num">{s.val}</p>
                <p className="text-xs text-kk-text-muted mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 glass-card rounded-2xl">
          {([
            { key: 'history' as const, label: 'Histórico' },
            { key: 'investments' as const, label: 'Investimentos' },
            { key: 'achievements' as const, label: 'Conquistas' },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${
                tab === t.key
                  ? 'bg-gold text-white shadow-gold'
                  : 'text-kk-text-muted hover:text-gold'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: History */}
        {tab === 'history' && (
          <div className="space-y-3">
            {MATCH_HISTORY.map(m => (
              <div key={m.id} className="glass-card rounded-2xl p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-serif text-lg ${
                  m.result === 'win'
                    ? 'bg-sage-light text-sage-dark'
                    : 'bg-red-50 text-red-400'
                }`}>
                  {m.result === 'win' ? 'W' : 'L'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-kk-text">vs {m.opponent}</p>
                  <p className="text-xs text-kk-text-muted mt-0.5">{m.category} · R${m.stake} stake</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${m.result === 'win' ? 'text-gold' : 'text-red-400'}`}>
                    {m.earned}
                  </p>
                  <p className="text-xs text-kk-text-muted mt-0.5">{m.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Investments */}
        {tab === 'investments' && (
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-sage-light flex items-center justify-center text-3xl mx-auto mb-4">
              📊
            </div>
            <h3 className="font-serif text-lg mb-2">3 investidores apostaram em você</h3>
            <p className="text-gold font-medium">Total investido: 1.500 VITA</p>
            <p className="text-xs text-kk-text-muted mt-1">Retorno médio: +18%</p>
          </div>
        )}

        {/* Tab: Achievements */}
        {tab === 'achievements' && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { emoji: '🔥', label: '3 Dias Streak', done: true },
              { emoji: '🏆', label: '10 Vitórias', done: true },
              { emoji: '💰', label: 'Primeiro R$500', done: true },
              { emoji: '🌱', label: '10 Árvores', done: true },
              { emoji: '⭐', label: 'Gold Rank', done: false },
              { emoji: '🎯', label: '50 Desafios', done: false },
            ].map((a, i) => (
              <div key={i} className={`glass-card rounded-2xl p-5 text-center ${!a.done ? 'opacity-35' : ''}`}>
                <span className="text-3xl block mb-2">{a.emoji}</span>
                <p className="text-xs font-medium text-kk-text">{a.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Logout */}
        <button className="btn-outline w-full mt-10 py-3">
          Sair da conta
        </button>
      </div>
    </div>
  )
}
