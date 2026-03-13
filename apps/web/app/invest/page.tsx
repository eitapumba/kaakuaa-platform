'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const TOP_PLAYERS = [
  { id: '1', name: 'xBlaze', rank: 'Diamond', winRate: 92, earnings: 12400, vita: 8500, category: 'E-Sports', investors: 14, roi: '+34%' },
  { id: '2', name: 'MC_Flow', rank: 'Gold', winRate: 78, earnings: 5200, vita: 4100, category: 'Rap Battle', investors: 8, roi: '+22%' },
  { id: '3', name: 'Pumba', rank: 'Silver', winRate: 80, earnings: 840, vita: 1250, category: 'Sports', investors: 3, roi: '+18%' },
  { id: '4', name: 'ChefNina', rank: 'Gold', winRate: 85, earnings: 3800, vita: 3200, category: 'Culinária', investors: 6, roi: '+28%' },
  { id: '5', name: 'ZenMaster', rank: 'Silver', winRate: 71, earnings: 1200, vita: 2000, category: 'Evolução', investors: 4, roi: '+12%' },
]

const RANK_BADGE: Record<string, string> = {
  Bronze: 'badge-bronze',
  Silver: 'badge-silver',
  Gold: 'badge-gold-rank',
  Diamond: 'badge-diamond',
}

export default function InvestPage() {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [investAmount, setInvestAmount] = useState(500)

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
            <span className="text-sm font-medium text-gold tracking-wide">Investir</span>
            <Link href="/marketplace" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Loja</Link>
            <Link href="/profile" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Perfil</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <p className="sec-label mb-3">Crowdfunding 2.0</p>
          <h1 className="font-serif text-display">Invista em Jogadores</h1>
          <p className="text-sm text-kk-text-muted mt-3 max-w-lg">
            Apoie talentos e receba percentual dos ganhos futuros — desafios e royalties de conteúdo.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {[
            { icon: '🎯', title: 'Escolha um Jogador', desc: 'Analise stats, win rate e histórico antes de investir' },
            { icon: '💰', title: 'Invista VITA', desc: 'Defina o valor e o contrato (% retorno + duração)' },
            { icon: '📈', title: 'Receba Retornos', desc: 'Ganhe % de cada vitória + royalties de conteúdo' },
          ].map((step, i) => (
            <div key={i} className="glass-card rounded-3xl p-7 text-center">
              <div className="w-14 h-14 rounded-2xl bg-sage-light flex items-center justify-center text-3xl mx-auto mb-4">
                {step.icon}
              </div>
              <h3 className="font-serif text-lg mb-2">{step.title}</h3>
              <p className="text-xs text-kk-text-muted">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Player list */}
        <div className="flex items-center gap-4 mb-6">
          <p className="sec-label">Top Jogadores</p>
          <div className="gold-line flex-1" />
        </div>

        <div className="space-y-3">
          {TOP_PLAYERS.map(p => (
            <div key={p.id}>
              <button
                onClick={() => setSelectedPlayer(selectedPlayer === p.id ? null : p.id)}
                className={`w-full glass-card rounded-2xl p-5 flex items-center gap-5 text-left transition-all ${
                  selectedPlayer === p.id ? 'ring-2 ring-gold shadow-gold' : ''
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-beige border border-gold-muted flex items-center justify-center font-serif text-xl text-kk-text flex-shrink-0">
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-serif text-base text-kk-text">{p.name}</p>
                    <span className={`badge-rank ${RANK_BADGE[p.rank]}`}>{p.rank}</span>
                  </div>
                  <p className="text-xs text-kk-text-muted mt-1">{p.category} · {p.winRate}% win rate</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-gold font-medium">{p.roi}</p>
                  <p className="text-xs text-kk-text-muted mt-1">{p.investors} investidores</p>
                </div>
              </button>

              {/* Expanded invest panel */}
              {selectedPlayer === p.id && (
                <div className="glass-card rounded-b-2xl p-6 -mt-3 pt-8 border-t border-gold-muted animate-fade-in">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { val: p.vita.toLocaleString(), label: 'VITA' },
                      { val: `R$${p.earnings.toLocaleString()}`, label: 'Ganhos' },
                      { val: p.investors.toString(), label: 'Investidores' },
                    ].map(s => (
                      <div key={s.label} className="text-center">
                        <p className="stat-num text-xl">{s.val}</p>
                        <p className="text-xs text-kk-text-muted mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <p className="sec-label mb-3">Quanto investir?</p>
                  <div className="flex gap-2 mb-5">
                    {[100, 500, 1000, 2000].map(v => (
                      <button
                        key={v}
                        onClick={() => setInvestAmount(v)}
                        className={`flex-1 py-2.5 rounded-xl text-sm transition-all ${
                          investAmount === v
                            ? 'bg-gold text-white shadow-gold'
                            : 'glass-card text-kk-text-muted hover:border-gold'
                        }`}
                      >
                        {v} VITA
                      </button>
                    ))}
                  </div>

                  <div className="glass-card rounded-2xl p-4 mb-5">
                    <div className="flex justify-between text-sm py-1.5">
                      <span className="text-kk-text-muted">Contrato</span>
                      <span className="text-kk-text">90 dias</span>
                    </div>
                    <div className="divider" />
                    <div className="flex justify-between text-sm py-1.5">
                      <span className="text-kk-text-muted">Retorno por vitória</span>
                      <span className="text-gold font-medium">5%</span>
                    </div>
                    <div className="divider" />
                    <div className="flex justify-between text-sm py-1.5">
                      <span className="text-kk-text-muted">Royalties conteúdo</span>
                      <span className="text-gold font-medium">2%</span>
                    </div>
                  </div>

                  <button className="btn-gold w-full py-3.5">
                    Investir {investAmount} VITA em {p.name}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
