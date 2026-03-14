'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/auth-context'
import { api } from '../../lib/api'

const STAGE_ICONS: Record<string, string> = {
  screenplay: '📝',
  storyboard: '🎨',
  cinematography: '🎬',
  soundtrack: '🎵',
  acting: '🎭',
}

const STAGE_NAMES: Record<string, string> = {
  screenplay: 'Roteiro',
  storyboard: 'Storyboard',
  cinematography: 'Fotografia',
  soundtrack: 'Trilha Sonora',
  acting: 'Atuação',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  recruiting: { label: 'Recrutando', color: 'bg-green-500' },
  stage_active: { label: 'Em Andamento', color: 'bg-gold' },
  voting: { label: 'Votação', color: 'bg-purple-500' },
  completed: { label: 'Completa', color: 'bg-sage' },
  cancelled: { label: 'Cancelada', color: 'bg-red-400' },
}

const TIERS = [
  { value: '', label: 'Todos' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'diamond', label: 'Diamond' },
]

export default function JornadaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [journeys, setJourneys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: 'Jornada do Herói',
    tier: 'bronze',
    stakePerStage: 20,
  })

  useEffect(() => {
    loadJourneys()
  }, [selectedTier])

  const loadJourneys = async () => {
    setLoading(true)
    try {
      const data = await api.getJourneys(selectedTier || undefined)
      setJourneys(data.journeys || [])
    } catch (err) {
      console.error('Erro ao carregar jornadas:', err)
      // Mock data for demo
      setJourneys([
        {
          id: 'demo-1',
          title: 'Jornada do Herói — Primeira Edição',
          status: 'recruiting',
          tier: 'bronze',
          stakePerStage: 20,
          totalPool: 160,
          currentStageOrder: 1,
          creator: { displayName: 'Pumba' },
          followerCount: 24,
          stages: [
            { id: 's1', stageType: 'screenplay', stageOrder: 1, status: 'open', currentParticipants: 3, maxParticipants: 8, name: 'Batalha de Roteiro' },
            { id: 's2', stageType: 'storyboard', stageOrder: 2, status: 'pending', currentParticipants: 0, maxParticipants: 8, name: 'Batalha de Storyboard' },
            { id: 's3', stageType: 'cinematography', stageOrder: 3, status: 'pending', currentParticipants: 0, maxParticipants: 4, name: 'Batalha de Direção de Fotografia' },
            { id: 's4', stageType: 'soundtrack', stageOrder: 4, status: 'pending', currentParticipants: 0, maxParticipants: 6, name: 'Batalha de Trilha Sonora' },
            { id: 's5', stageType: 'acting', stageOrder: 5, status: 'pending', currentParticipants: 0, maxParticipants: 4, name: 'Batalha de Atuação' },
          ],
          createdAt: new Date().toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const journey = await api.createJourney(createForm)
      setShowCreateModal(false)
      router.push(`/jornada/${journey.id}`)
    } catch (err) {
      console.error('Erro ao criar jornada:', err)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/logo-nav.png" alt="Jungle Games" width={120} height={36} className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">
              ← Voltar
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="sec-label mb-3">Atuação & Cinema</p>
              <h1 className="font-serif text-display">
                Jornada do Herói
              </h1>
              <p className="text-sm text-kk-text-muted mt-2 max-w-lg">
                Uma jornada cinematográfica colaborativa — do roteiro ao curta-metragem.
                5 batalhas sequenciais, cada vencedor contribui para o produto final.
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-gold text-sm py-3 px-8"
              >
                Criar Jornada
              </button>
            )}
          </div>

          {/* Stage Pipeline Visual */}
          <div className="glass-card rounded-3xl p-6 mb-10">
            <p className="sec-label mb-4">Pipeline de Batalhas</p>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['screenplay', 'storyboard', 'cinematography', 'soundtrack', 'acting'].map((stage, i) => (
                <div key={stage} className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl bg-beige min-w-[100px]">
                    <span className="text-2xl">{STAGE_ICONS[stage]}</span>
                    <span className="text-xs font-medium text-kk-text">{STAGE_NAMES[stage]}</span>
                    <span className="text-[10px] text-kk-text-muted">Etapa {i + 1}</span>
                  </div>
                  {i < 4 && (
                    <span className="text-gold text-lg flex-shrink-0">→</span>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <span className="text-gold text-lg">=</span>
                <div className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl bg-gold/10 border border-gold/30 min-w-[100px]">
                  <span className="text-2xl">🎥</span>
                  <span className="text-xs font-medium text-gold">Curta-Metragem</span>
                  <span className="text-[10px] text-kk-text-muted">Produto Final</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tier Filter */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto">
            {TIERS.map(t => (
              <button
                key={t.value}
                onClick={() => setSelectedTier(t.value)}
                className={`px-5 py-2 rounded-full text-sm transition-all ${
                  selectedTier === t.value
                    ? 'bg-gold text-white shadow-gold'
                    : 'glass-card hover:border-gold text-kk-text-muted'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Journey List */}
          {loading ? (
            <div className="text-center py-20">
              <p className="text-sm text-kk-text-muted animate-pulse">Carregando jornadas...</p>
            </div>
          ) : journeys.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">🎬</span>
              <h3 className="font-serif text-xl mb-2">Nenhuma jornada ativa</h3>
              <p className="text-sm text-kk-text-muted mb-6">Seja o primeiro a criar uma Jornada do Herói!</p>
              {user && (
                <button onClick={() => setShowCreateModal(true)} className="btn-gold text-sm py-3 px-8">
                  Criar Jornada
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {journeys.map(journey => {
                const statusInfo = STATUS_LABELS[journey.status] || STATUS_LABELS.recruiting
                const currentStage = journey.stages?.find((s: any) => s.stageOrder === journey.currentStageOrder)

                return (
                  <Link
                    key={journey.id}
                    href={`/jornada/${journey.id}`}
                    className="premium-card block p-0 cursor-pointer group"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
                            <span className="text-xs uppercase tracking-widest text-kk-text-muted">{statusInfo.label}</span>
                            <span className="text-xs text-kk-text-muted">·</span>
                            <span className="text-xs text-kk-text-muted capitalize">{journey.tier}</span>
                          </div>
                          <h3 className="font-serif text-xl group-hover:text-gold transition-colors">{journey.title}</h3>
                          <p className="text-xs text-kk-text-muted mt-1">
                            Criada por {journey.creator?.displayName || 'Anônimo'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="stat-num text-xl">R${Number(journey.totalPool || 0).toFixed(0)}</p>
                          <p className="text-xs text-kk-text-muted mt-1">Pool Total</p>
                        </div>
                      </div>

                      {/* Stage Progress */}
                      <div className="flex items-center gap-1.5 mb-3">
                        {journey.stages?.map((stage: any) => (
                          <div
                            key={stage.id}
                            className={`flex-1 h-2 rounded-full transition-all ${
                              stage.status === 'completed' ? 'bg-gold' :
                              stage.status === 'active' || stage.status === 'voting' || stage.status === 'open' ? 'bg-gold/40 animate-pulse' :
                              'bg-tan'
                            }`}
                            title={`${STAGE_NAMES[stage.stageType]}: ${stage.status}`}
                          />
                        ))}
                      </div>

                      {/* Current Stage Info */}
                      {currentStage && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{STAGE_ICONS[currentStage.stageType]}</span>
                            <span className="text-sm text-kk-text">
                              Etapa {currentStage.stageOrder}: {currentStage.name}
                            </span>
                          </div>
                          <span className="text-xs text-kk-text-muted">
                            {currentStage.currentParticipants}/{currentStage.maxParticipants} participantes
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="px-6 py-3 border-t border-gold-muted flex items-center justify-between">
                      <span className="text-xs text-kk-text-muted">
                        R${Number(journey.stakePerStage || 0).toFixed(0)} por estágio
                      </span>
                      <span className="text-xs text-kk-text-muted">
                        👥 {journey.followerCount || 0} seguindo
                      </span>
                      <span className="text-gold text-xs font-medium group-hover:translate-x-1 transition-transform">
                        Ver Jornada →
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm">
          <div className="glass-card rounded-3xl p-8 max-w-md w-full animate-scale-in">
            <h2 className="font-serif text-heading mb-6">Criar Jornada do Herói</h2>

            <div className="space-y-5">
              <div>
                <label className="sec-label mb-2 block">Título</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full glass-card rounded-xl px-4 py-3 text-sm text-kk-text border-none outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label className="sec-label mb-2 block">Tier</label>
                <div className="grid grid-cols-4 gap-2">
                  {['bronze', 'silver', 'gold', 'diamond'].map(t => (
                    <button
                      key={t}
                      onClick={() => setCreateForm({ ...createForm, tier: t })}
                      className={`py-2 px-3 rounded-xl text-xs capitalize transition-all ${
                        createForm.tier === t
                          ? 'bg-gold text-white shadow-gold'
                          : 'glass-card text-kk-text-muted'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="sec-label mb-2 block">Stake por Estágio (R$)</label>
                <div className="grid grid-cols-4 gap-2">
                  {[20, 50, 200, 500].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setCreateForm({ ...createForm, stakePerStage: amount })}
                      className={`py-3 rounded-xl text-sm transition-all ${
                        createForm.stakePerStage === amount
                          ? 'bg-gold text-white shadow-gold'
                          : 'glass-card text-kk-text-muted'
                      }`}
                    >
                      R${amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-kk-text-muted mb-2">Resumo da Jornada</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-kk-text-muted">5 estágios ×</span>
                    <span className="text-kk-text">R${createForm.stakePerStage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-kk-text-muted">Max participantes</span>
                    <span className="text-kk-text">8+8+4+6+4 = 30</span>
                  </div>
                  <div className="flex justify-between text-gold font-medium">
                    <span>Pool potencial máx</span>
                    <span>R${createForm.stakePerStage * 30}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowCreateModal(false)} className="btn-outline flex-1 py-3">
                Cancelar
              </button>
              <button onClick={handleCreate} className="btn-gold flex-1 py-3">
                Criar Jornada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
