'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const PRODUCTS = [
  { id: '1', name: 'Guaraná Ancestral', desc: 'Energia pura da Amazônia', price: 29.90, vita: 150, cat: 'beverage', img: '🫐', rank: '' },
  { id: '2', name: 'Energético Natural', desc: 'Yerba mate + adaptógenos', price: 19.90, vita: 100, cat: 'beverage', img: '🧉', rank: '' },
  { id: '3', name: 'Pasta Dental Neem', desc: 'Sem flúor, 100% natural', price: 24.90, vita: 120, cat: 'health', img: '🪥', rank: '' },
  { id: '4', name: 'Retiro Regeneração', desc: '3 dias na eco-vila Kaa Kuaa', price: 1500, vita: 5000, cat: 'experience', img: '🏕️', rank: 'Gold' },
  { id: '5', name: 'Plano Guerreiro', desc: 'Assinatura mensal premium', price: 49.90, vita: 0, cat: 'subscription', img: '⚔️', rank: 'Silver' },
  { id: '6', name: 'Kit Mushroom Coffee', desc: 'Lions Mane + Chaga + café', price: 59.90, vita: 250, cat: 'beverage', img: '🍄', rank: '' },
  { id: '7', name: 'Camiseta Kaa Kuaa', desc: 'Algodão orgânico regenerativo', price: 89.90, vita: 400, cat: 'merch', img: '👕', rank: '' },
  { id: '8', name: 'Coaching 1:1', desc: '1h com coach certificado', price: 200, vita: 800, cat: 'experience', img: '🎯', rank: 'Silver' },
]

const CATS = [
  { key: 'all', label: 'Todos' },
  { key: 'beverage', label: 'Bebidas' },
  { key: 'health', label: 'Saúde' },
  { key: 'experience', label: 'Experiências' },
  { key: 'subscription', label: 'Assinaturas' },
  { key: 'merch', label: 'Merch' },
]

export default function MarketplacePage() {
  const [filter, setFilter] = useState('all')
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter)

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
            <span className="text-sm font-medium text-gold tracking-wide">Loja</span>
            <Link href="/profile" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">Perfil</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-10">
          <p className="sec-label mb-3">Marketplace</p>
          <h1 className="font-serif text-display">Loja Kaa Kuaa</h1>
          <p className="text-sm text-kk-text-muted mt-3">
            Pague com R$ ou VITA — cada compra regenera o planeta
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATS.map(c => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={`pill ${filter === c.key ? 'pill-active' : ''}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(p => (
            <div key={p.id} className="premium-card group cursor-pointer">
              <div className="w-full h-40 bg-sage-light flex items-center justify-center overflow-hidden">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-500">{p.img}</span>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-base text-kk-text truncate">{p.name}</h3>
                <p className="text-xs text-kk-text-muted mt-1 truncate">{p.desc}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-gold font-medium">R$ {p.price.toFixed(2)}</span>
                  {p.vita > 0 && (
                    <span className="text-[11px] text-kk-text-muted">ou {p.vita} VITA</span>
                  )}
                </div>
                {p.rank && (
                  <p className="text-[10px] text-gold mt-2 uppercase tracking-wider">Requer {p.rank}+</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
