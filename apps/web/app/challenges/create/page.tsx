'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/auth-context'

const CATEGORIES = [
  { key: 'sports', emoji: '🏋️', label: 'Sports', examples: 'Flexões, corrida, natação, crossfit' },
  { key: 'esports', emoji: '🎮', label: 'E-Sports', examples: 'Valorant, FIFA, CS2, League' },
  { key: 'personal_evolution', emoji: '🧠', label: 'Evolução', examples: 'Meditação, leitura, cold shower' },
  { key: 'regeneration', emoji: '🌿', label: 'Regeneração', examples: 'Plantar, limpar praia, reciclar' },
  { key: 'rap_battle', emoji: '🎤', label: 'Rap Battle', examples: 'Freestyle, tema livre, improviso' },
  { key: 'culinary', emoji: '🍳', label: 'Culinária', examples: 'Prato em 30 min, ingrediente secreto' },
]

const VERIFICATION_TYPES = [
  { key: 'live', icon: '📹', label: 'Ao Vivo', desc: 'Câmera liga na hora — público assiste e vota' },
  { key: 'photo', icon: '📸', label: 'Foto + GPS', desc: 'Enviar foto com localização como prova' },
  { key: 'video', icon: '🎬', label: 'Enviar Vídeo', desc: 'Gravar vídeo e enviar em até 24h' },
  { key: 'screen', icon: '🖥️', label: 'Screen Capture', desc: 'Captura de tela automática (games)' },
]

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  live: { label: 'Ao Vivo', color: 'bg-red-50 text-red-500' },
  screen: { label: 'Screen Capture', color: 'bg-purple-50 text-purple-500' },
  photo: { label: 'Foto + GPS', color: 'bg-blue-50 text-blue-500' },
  video: { label: 'Enviar Vídeo', color: 'bg-amber-50 text-amber-600' },
}

const STAKES = [20, 50, 100, 200, 500, 1000, 2000]

type Step = 'category' | 'details' | 'rules' | 'review'

export default function CreateChallengePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('category')

  // Form state
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [stakeAmount, setStakeAmount] = useState(200)
  const [customStake, setCustomStake] = useState('')
  const [verificationType, setVerificationType] = useState('live')
  const [maxParticipants, setMaxParticipants] = useState(2)
  const [duration, setDuration] = useState('5')
  const [rules, setRules] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const catInfo = CATEGORIES.find(c => c.key === category)
  const verInfo = VERIFICATION_TYPES.find(v => v.key === verificationType)
  const finalStake = customStake ? parseInt(customStake) : stakeAmount
  const pool = finalStake * maxParticipants
  const winnerReceives = (pool * 0.595).toFixed(2)
  const fundAmount = (pool * 0.30).toFixed(2)

  const handleSubmit = async () => {
    if (!user) {
      router.push('/auth')
      return
    }
    setSubmitting(true)
    try {
      // POST to /challenges/create will be implemented
      // For now, redirect to challenges list
      setTimeout(() => {
        router.push('/challenges')
      }, 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const progress = ['category', 'details', 'rules', 'review'].indexOf(step) + 1

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/logo-nav.png" alt="Kaa Kuaa" width={120} height={36} className="h-8 w-auto" />
          </Link>
          <Link href="/challenges" className="text-sm text-kk-text-muted hover:text-gold transition-colors">
            ← Voltar aos desafios
          </Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-6 pt-28 pb-16">
        {/* Progress bar */}
        <div className="flex gap-2 mb-10">
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= progress ? 'bg-gold' : 'bg-gold-muted'
              }`}
            />
          ))}
        </div>

        {/* ═══ STEP 1: Category ═══ */}
        {step === 'category' && (
          <div className="animate-fade-in">
            <p className="sec-label mb-3">Passo 1 de 4</p>
            <h1 className="font-serif text-heading mb-2">Que tipo de desafio?</h1>
            <p className="text-sm text-kk-text-muted mb-8">Escolha a categoria do seu desafio</p>

            <div className="space-y-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { setCategory(cat.key); setStep('details') }}
                  className={`w-full glass-card rounded-2xl p-5 flex items-center gap-4 text-left transition-all ${
                    category === cat.key ? 'ring-2 ring-gold shadow-gold' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center text-2xl flex-shrink-0">
                    {cat.emoji}
                  </div>
                  <div>
                    <p className="font-serif text-base text-kk-text">{cat.label}</p>
                    <p className="text-xs text-kk-text-muted mt-0.5">{cat.examples}</p>
                  </div>
                  <span className="text-gold ml-auto">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Details ═══ */}
        {step === 'details' && (
          <div className="animate-fade-in">
            <button onClick={() => setStep('category')} className="flex items-center gap-2 text-sm text-kk-text-muted hover:text-gold transition-colors mb-6">
              ← Voltar
            </button>

            <p className="sec-label mb-3">Passo 2 de 4 — {catInfo?.emoji} {catInfo?.label}</p>
            <h1 className="font-serif text-heading mb-8">Descreva seu desafio</h1>

            {/* Title */}
            <div className="mb-5">
              <label className="sec-label block mb-2">Título do Desafio</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: 100 flexões em 5 minutos"
                className="w-full px-4 py-3.5 rounded-2xl bg-white/60 border border-gold-muted text-kk-text placeholder:text-kk-text-muted/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-sm"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="sec-label block mb-2">Descrição</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explique as regras básicas do desafio..."
                rows={3}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/60 border border-gold-muted text-kk-text placeholder:text-kk-text-muted/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-sm resize-none"
              />
            </div>

            {/* Stake */}
            <div className="mb-5">
              <label className="sec-label block mb-2">Stake (cada jogador deposita)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {STAKES.map(s => (
                  <button
                    key={s}
                    onClick={() => { setStakeAmount(s); setCustomStake('') }}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      stakeAmount === s && !customStake
                        ? 'bg-gold text-white shadow-gold'
                        : 'glass-card text-kk-text-muted hover:border-gold'
                    }`}
                  >
                    R${s >= 1000 ? `${s/1000}k` : s}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={customStake}
                onChange={e => setCustomStake(e.target.value)}
                placeholder="Ou digite um valor personalizado..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/60 border border-gold-muted text-kk-text placeholder:text-kk-text-muted/50 focus:outline-none focus:border-gold text-sm"
              />
            </div>

            {/* Participants */}
            <div className="mb-5">
              <label className="sec-label block mb-2">Jogadores</label>
              <div className="flex gap-2">
                {[2, 4, 8].map(n => (
                  <button
                    key={n}
                    onClick={() => setMaxParticipants(n)}
                    className={`flex-1 py-3 rounded-xl text-sm transition-all ${
                      maxParticipants === n
                        ? 'bg-gold text-white shadow-gold'
                        : 'glass-card text-kk-text-muted hover:border-gold'
                    }`}
                  >
                    {n === 2 ? '1v1' : n === 4 ? '2v2' : 'Battle Royale'}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div className="mb-8">
              <label className="sec-label block mb-2">Como verificar?</label>
              <div className="grid grid-cols-2 gap-3">
                {VERIFICATION_TYPES.map(v => (
                  <button
                    key={v.key}
                    onClick={() => setVerificationType(v.key)}
                    className={`glass-card rounded-2xl p-4 text-left transition-all ${
                      verificationType === v.key ? 'ring-2 ring-gold shadow-gold' : ''
                    }`}
                  >
                    <span className="text-2xl block mb-2">{v.icon}</span>
                    <p className="text-sm font-medium text-kk-text">{v.label}</p>
                    <p className="text-[10px] text-kk-text-muted mt-1">{v.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep('rules')}
              disabled={!title.trim()}
              className="btn-gold w-full py-4 disabled:opacity-40"
            >
              Próximo
            </button>
          </div>
        )}

        {/* ═══ STEP 3: Rules ═══ */}
        {step === 'rules' && (
          <div className="animate-fade-in">
            <button onClick={() => setStep('details')} className="flex items-center gap-2 text-sm text-kk-text-muted hover:text-gold transition-colors mb-6">
              ← Voltar
            </button>

            <p className="sec-label mb-3">Passo 3 de 4</p>
            <h1 className="font-serif text-heading mb-8">Regras e Duração</h1>

            {/* Duration */}
            <div className="mb-5">
              <label className="sec-label block mb-2">Duração do Desafio</label>
              <div className="flex gap-2">
                {[
                  { val: '5', label: '5 min' },
                  { val: '10', label: '10 min' },
                  { val: '30', label: '30 min' },
                  { val: '60', label: '1 hora' },
                  { val: '1440', label: '24 horas' },
                ].map(d => (
                  <button
                    key={d.val}
                    onClick={() => setDuration(d.val)}
                    className={`flex-1 py-3 rounded-xl text-sm transition-all ${
                      duration === d.val
                        ? 'bg-gold text-white shadow-gold'
                        : 'glass-card text-kk-text-muted hover:border-gold'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rules */}
            <div className="mb-5">
              <label className="sec-label block mb-2">Regras Adicionais (opcional)</label>
              <textarea
                value={rules}
                onChange={e => setRules(e.target.value)}
                placeholder="Ex: Sem pausas permitidas. Forma correta obrigatória. IA valida a contagem..."
                rows={4}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/60 border border-gold-muted text-kk-text placeholder:text-kk-text-muted/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-sm resize-none"
              />
            </div>

            {/* Public toggle */}
            <div className="glass-card rounded-2xl p-5 flex items-center justify-between mb-8">
              <div>
                <p className="text-sm font-medium text-kk-text">Desafio público</p>
                <p className="text-xs text-kk-text-muted mt-0.5">Qualquer jogador pode aceitar. Se privado, só por link.</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-7 rounded-full relative transition-all duration-300 ${isPublic ? 'bg-gold shadow-gold' : 'bg-tan'}`}
              >
                <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300 ${isPublic ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            <button onClick={() => setStep('review')} className="btn-gold w-full py-4">
              Revisar Desafio
            </button>
          </div>
        )}

        {/* ═══ STEP 4: Review ═══ */}
        {step === 'review' && (
          <div className="animate-fade-in">
            <button onClick={() => setStep('rules')} className="flex items-center gap-2 text-sm text-kk-text-muted hover:text-gold transition-colors mb-6">
              ← Voltar
            </button>

            <p className="sec-label mb-3">Passo 4 de 4</p>
            <h1 className="font-serif text-heading mb-8">Revisar e Publicar</h1>

            {/* Preview card */}
            <div className="glass-card rounded-3xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center text-2xl">
                  {catInfo?.emoji}
                </div>
                <div>
                  <h3 className="font-serif text-lg text-kk-text">{title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_LABELS[verificationType].color}`}>
                    {verInfo?.label}
                  </span>
                </div>
              </div>

              <p className="text-sm text-kk-text-muted mb-4">{description}</p>

              {rules && (
                <div className="bg-sage-light/50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-kk-text-muted font-medium mb-1">Regras:</p>
                  <p className="text-xs text-kk-text">{rules}</p>
                </div>
              )}

              <div className="divider mb-4" />

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="stat-num text-lg">R${finalStake}</p>
                  <p className="text-[10px] text-kk-text-muted">Stake</p>
                </div>
                <div>
                  <p className="stat-num text-lg">{maxParticipants === 2 ? '1v1' : maxParticipants === 4 ? '2v2' : 'BR'}</p>
                  <p className="text-[10px] text-kk-text-muted">Formato</p>
                </div>
                <div>
                  <p className="stat-num text-lg">{parseInt(duration) >= 60 ? `${parseInt(duration)/60}h` : `${duration}m`}</p>
                  <p className="text-[10px] text-kk-text-muted">Duração</p>
                </div>
              </div>
            </div>

            {/* Payout breakdown */}
            <div className="glass-card rounded-2xl p-5 mb-8">
              <p className="sec-label mb-3">Distribuição do Pool (R${pool})</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-kk-text-muted">Vencedor (59.5%)</span>
                  <span className="text-gold font-medium">R$ {winnerReceives}</span>
                </div>
                <div className="divider" />
                <div className="flex justify-between text-sm">
                  <span className="text-kk-text-muted">Fundo Regeneração (30%)</span>
                  <span className="text-kk-text">R$ {fundAmount}</span>
                </div>
                <div className="divider" />
                <div className="flex justify-between text-sm">
                  <span className="text-kk-text-muted">Taxa Kaa Kuaa (10.5%)</span>
                  <span className="text-kk-text">R$ {(pool * 0.105).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-gold w-full py-4 text-base disabled:opacity-50"
            >
              {submitting ? 'Publicando...' : `Publicar Desafio — Depositar R$${finalStake}`}
            </button>

            <p className="text-[10px] text-kk-text-muted text-center mt-3">
              Seu stake de R${finalStake} fica em escrow até o desafio ser concluído
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
