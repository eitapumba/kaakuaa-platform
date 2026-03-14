'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useAuth } from '../../../lib/auth-context'
import { api } from '../../../lib/api'

const STAGE_ICONS: Record<string, string> = {
  screenplay: '📝',
  storyboard: '🎨',
  cinematography: '🎬',
  soundtrack: '🎵',
  acting: '🎭',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-tan text-kk-text-muted',
  open: 'bg-green-100 text-green-700',
  active: 'bg-gold/20 text-gold',
  voting: 'bg-purple-100 text-purple-700',
  completed: 'bg-sage-light text-sage-dark',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando',
  open: 'Aberto',
  active: 'Em Andamento',
  voting: 'Votação',
  completed: 'Concluído',
}

type SubmitTab = 'text' | 'video' | 'image' | 'audio'

export default function JourneyDetailPage() {
  const params = useParams()
  const journeyId = params.id as string
  const { user } = useAuth()

  const [journey, setJourney] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [expandedStage, setExpandedStage] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Record<string, any[]>>({})
  const [votingResults, setVotingResults] = useState<Record<string, any>>({})

  // Submit form state
  const [submitTab, setSubmitTab] = useState<SubmitTab>('text')
  const [submitText, setSubmitText] = useState('')
  const [submitUrl, setSubmitUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadJourney()
  }, [journeyId])

  const loadJourney = async () => {
    setLoading(true)
    try {
      const data = await api.getJourney(journeyId)
      setJourney(data)
      // Auto-expand current stage
      const currentStage = data.stages?.find((s: any) =>
        ['open', 'active', 'voting'].includes(s.status)
      )
      if (currentStage) {
        setExpandedStage(currentStage.id)
        if (currentStage.status === 'voting') {
          loadStageSubmissions(currentStage.id)
          loadVotingResults(currentStage.id)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar jornada:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadStageSubmissions = async (stageId: string) => {
    try {
      const data = await api.getStageSubmissions(journeyId, stageId)
      setSubmissions(prev => ({ ...prev, [stageId]: data }))
    } catch (err) {
      console.error('Erro ao carregar submissões:', err)
    }
  }

  const loadVotingResults = async (stageId: string) => {
    try {
      const data = await api.getStageResults(journeyId, stageId)
      setVotingResults(prev => ({ ...prev, [stageId]: data }))
    } catch (err) {
      console.error('Erro ao carregar resultados:', err)
    }
  }

  const handleJoinStage = async (stageId: string) => {
    try {
      await api.joinJourneyStage(journeyId, stageId)
      loadJourney()
    } catch (err: any) {
      alert(err.message || 'Erro ao participar')
    }
  }

  const handleSubmitWork = async (stageId: string) => {
    setSubmitting(true)
    try {
      await api.submitJourneyWork(journeyId, stageId, {
        type: submitTab,
        text: submitTab === 'text' ? submitText : undefined,
        url: submitTab !== 'text' ? submitUrl : undefined,
      })
      setSubmitText('')
      setSubmitUrl('')
      loadJourney()
    } catch (err: any) {
      alert(err.message || 'Erro ao submeter')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (stageId: string, participantId: string) => {
    try {
      await api.voteJourneyStage(journeyId, stageId, { participantId, vitaAmount: 1 })
      loadVotingResults(stageId)
    } catch (err: any) {
      alert(err.message || 'Erro ao votar')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-kk-text-muted animate-pulse">Carregando jornada...</p>
      </div>
    )
  }

  if (!journey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl block mb-4">🎬</span>
          <h2 className="font-serif text-xl mb-2">Jornada não encontrada</h2>
          <Link href="/jornada" className="text-gold text-sm">← Voltar</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="nav-glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/img/logo-nav.png" alt="Jungle Games" width={120} height={36} className="h-8 w-auto" />
          </Link>
          <Link href="/jornada" className="text-sm font-light text-kk-text-muted hover:text-gold transition-colors">
            ← Todas as Jornadas
          </Link>
        </div>
      </nav>

      <section className="pt-28 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Journey Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${
                journey.status === 'completed' ? 'bg-sage' : 'bg-green-500 animate-pulse'
              }`} />
              <span className="text-xs uppercase tracking-widest text-kk-text-muted capitalize">
                {journey.status?.replace('_', ' ')}
              </span>
              <span className="text-xs text-kk-text-muted">·</span>
              <span className="text-xs text-kk-text-muted capitalize">{journey.tier}</span>
            </div>
            <h1 className="font-serif text-display mb-3">{journey.title}</h1>
            <p className="text-sm text-kk-text-muted">{journey.description}</p>

            <div className="flex items-center gap-6 mt-6">
              <div className="text-center">
                <p className="stat-num">R${Number(journey.totalPool || 0).toFixed(0)}</p>
                <p className="text-xs text-kk-text-muted mt-1">Pool Total</p>
              </div>
              <div className="w-px h-8 bg-gold-muted" />
              <div className="text-center">
                <p className="stat-num">R${Number(journey.stakePerStage || 0).toFixed(0)}</p>
                <p className="text-xs text-kk-text-muted mt-1">Stake/Estágio</p>
              </div>
              <div className="w-px h-8 bg-gold-muted" />
              <div className="text-center">
                <p className="stat-num">{journey.currentStageOrder}/5</p>
                <p className="text-xs text-kk-text-muted mt-1">Estágio Atual</p>
              </div>
              <div className="w-px h-8 bg-gold-muted" />
              <div className="text-center">
                <p className="stat-num">👥 {journey.followerCount || 0}</p>
                <p className="text-xs text-kk-text-muted mt-1">Seguindo</p>
              </div>
            </div>
          </div>

          {/* Stage Progress Bar */}
          <div className="flex items-center gap-1.5 mb-10">
            {journey.stages?.map((stage: any) => (
              <div
                key={stage.id}
                className={`flex-1 h-3 rounded-full transition-all cursor-pointer hover:scale-y-125 ${
                  stage.status === 'completed' ? 'bg-gold' :
                  stage.status === 'active' || stage.status === 'voting' || stage.status === 'open' ? 'bg-gold/40 animate-pulse' :
                  'bg-tan'
                }`}
                onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                title={`${stage.name}: ${STATUS_LABELS[stage.status] || stage.status}`}
              />
            ))}
          </div>

          {/* Stages */}
          <div className="space-y-4">
            {journey.stages?.map((stage: any) => {
              const isExpanded = expandedStage === stage.id
              const isCurrent = ['open', 'active', 'voting'].includes(stage.status)
              const stageSubmissions = submissions[stage.id] || []
              const stageResults = votingResults[stage.id]

              return (
                <div
                  key={stage.id}
                  className={`premium-card transition-all ${isCurrent ? 'ring-1 ring-gold/30' : ''}`}
                >
                  {/* Stage Header */}
                  <button
                    onClick={() => {
                      setExpandedStage(isExpanded ? null : stage.id)
                      if (!isExpanded && (stage.status === 'voting' || stage.status === 'completed')) {
                        loadStageSubmissions(stage.id)
                        loadVotingResults(stage.id)
                      }
                    }}
                    className="w-full p-6 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                        stage.status === 'completed' ? 'bg-gold/10' :
                        isCurrent ? 'bg-sage-light' : 'bg-tan'
                      }`}>
                        {stage.status === 'completed' ? '✓' : STAGE_ICONS[stage.stageType]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-kk-text-muted">Etapa {stage.stageOrder}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[stage.status] || 'bg-tan text-kk-text-muted'}`}>
                            {STATUS_LABELS[stage.status] || stage.status}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg">{stage.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-xs text-kk-text-muted">
                        {stage.currentParticipants}/{stage.maxParticipants}
                      </span>
                      <span className={`text-kk-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        ▾
                      </span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-gold-muted pt-5">
                      {/* Description & Objectives */}
                      <p className="text-sm text-kk-text-muted mb-4">{stage.description}</p>

                      {stage.objectives && (
                        <div className="mb-5">
                          <p className="sec-label mb-2">Objetivos</p>
                          <div className="space-y-2">
                            {stage.objectives.map((obj: string, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-kk-text">
                                <span className="text-gold mt-0.5">•</span>
                                <span>{obj}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Previous Stage Output */}
                      {stage.previousStageOutput && (
                        <div className="glass-card rounded-xl p-4 mb-5">
                          <p className="sec-label mb-2">Material do Estágio Anterior</p>
                          <p className="text-sm text-kk-text">
                            Vencedor: <span className="text-gold">{stage.previousStageOutput.winnerName}</span>
                          </p>
                          {stage.previousStageOutput.content?.text && (
                            <div className="mt-2 p-3 bg-beige rounded-lg text-sm text-kk-text max-h-40 overflow-y-auto">
                              {stage.previousStageOutput.content.text}
                            </div>
                          )}
                          {stage.previousStageOutput.content?.url && (
                            <a
                              href={stage.previousStageOutput.content.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-sm text-gold hover:underline"
                            >
                              Ver material →
                            </a>
                          )}
                        </div>
                      )}

                      {/* Winner */}
                      {stage.status === 'completed' && stage.winner && (
                        <div className="glass-card rounded-xl p-4 mb-5 border-gold/30">
                          <p className="sec-label mb-2">Vencedor</p>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-white font-serif">
                              {stage.winner.displayName?.[0] || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-kk-text">{stage.winner.displayName}</p>
                              <p className="text-xs text-kk-text-muted">Vencedor por votação pública</p>
                            </div>
                            <span className="ml-auto text-2xl">🏆</span>
                          </div>
                        </div>
                      )}

                      {/* JOIN BUTTON (stage open) */}
                      {stage.status === 'open' && user && (
                        <button
                          onClick={() => handleJoinStage(stage.id)}
                          className="btn-gold w-full py-3 text-sm mb-4"
                        >
                          Participar — R${Number(journey.stakePerStage).toFixed(0)}
                        </button>
                      )}

                      {/* SUBMIT WORK (stage active) */}
                      {stage.status === 'active' && user && (
                        <div className="glass-card rounded-xl p-5">
                          <p className="sec-label mb-3">Submeter Trabalho</p>

                          {/* Tab selector */}
                          <div className="flex gap-2 mb-4">
                            {(stage.acceptedSubmissionTypes || []).map((type: string) => (
                              <button
                                key={type}
                                onClick={() => setSubmitTab(type as SubmitTab)}
                                className={`px-4 py-1.5 rounded-full text-xs transition-all ${
                                  submitTab === type
                                    ? 'bg-gold text-white'
                                    : 'bg-tan text-kk-text-muted'
                                }`}
                              >
                                {type === 'text' ? '📝 Texto' :
                                 type === 'video' ? '🎥 Vídeo' :
                                 type === 'image' ? '🖼️ Imagem' :
                                 type === 'audio' ? '🎵 Áudio' : type}
                              </button>
                            ))}
                          </div>

                          {submitTab === 'text' ? (
                            <textarea
                              value={submitText}
                              onChange={e => setSubmitText(e.target.value)}
                              placeholder="Escreva seu roteiro aqui..."
                              className="w-full h-40 glass-card rounded-xl px-4 py-3 text-sm text-kk-text border-none outline-none resize-none focus:ring-1 focus:ring-gold"
                            />
                          ) : (
                            <input
                              type="url"
                              value={submitUrl}
                              onChange={e => setSubmitUrl(e.target.value)}
                              placeholder={`URL do ${submitTab === 'video' ? 'vídeo' : submitTab === 'image' ? 'imagem' : 'áudio'}...`}
                              className="w-full glass-card rounded-xl px-4 py-3 text-sm text-kk-text border-none outline-none focus:ring-1 focus:ring-gold"
                            />
                          )}

                          <button
                            onClick={() => handleSubmitWork(stage.id)}
                            disabled={submitting || (submitTab === 'text' ? !submitText : !submitUrl)}
                            className="btn-gold w-full py-3 text-sm mt-3 disabled:opacity-50"
                          >
                            {submitting ? 'Enviando...' : 'Submeter Trabalho'}
                          </button>
                        </div>
                      )}

                      {/* VOTING (stage voting) */}
                      {stage.status === 'voting' && (
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <p className="sec-label">Votação Pública</p>
                            {stage.votingEndsAt && (
                              <span className="text-xs text-kk-text-muted">
                                Encerra: {new Date(stage.votingEndsAt).toLocaleDateString('pt-BR', {
                                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>

                          <div className="space-y-3">
                            {stageSubmissions.map((sub: any) => {
                              const result = stageResults?.results?.find(
                                (r: any) => r.participantId === sub.participantId
                              )
                              return (
                                <div key={sub.participantId} className="glass-card rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-sage-light flex items-center justify-center font-serif">
                                        {sub.displayName?.[0] || '?'}
                                      </div>
                                      <div>
                                        <p className="text-sm font-medium text-kk-text">{sub.displayName}</p>
                                        <p className="text-xs text-kk-text-muted">
                                          {result?.voteCount || 0} votos · {result?.totalVita || 0} VITA
                                        </p>
                                      </div>
                                    </div>
                                    {user && (
                                      <button
                                        onClick={() => handleVote(stage.id, sub.participantId)}
                                        className="btn-outline text-xs py-1.5 px-4"
                                      >
                                        Votar 🗳️
                                      </button>
                                    )}
                                  </div>

                                  {/* Show submission preview */}
                                  {sub.evidence?.[0]?.metadata?.text && (
                                    <div className="p-3 bg-beige rounded-lg text-sm text-kk-text max-h-32 overflow-y-auto">
                                      {sub.evidence[0].metadata.text.substring(0, 300)}
                                      {sub.evidence[0].metadata.text.length > 300 && '...'}
                                    </div>
                                  )}
                                  {sub.evidence?.[0]?.url && !sub.evidence?.[0]?.metadata?.text && (
                                    <a
                                      href={sub.evidence[0].url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-gold hover:underline"
                                    >
                                      Ver submissão →
                                    </a>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Completed Final Product */}
                      {journey.status === 'completed' && stage.stageOrder === 5 && journey.finalProduct?.finalFilmUrl && (
                        <div className="glass-card rounded-xl p-5 border-gold/30 mt-4">
                          <p className="sec-label mb-3">Curta-Metragem Final 🎥</p>
                          <a
                            href={journey.finalProduct.finalFilmUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-gold inline-block text-sm py-2 px-6"
                          >
                            Assistir Curta-Metragem →
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Final Product Section (when journey is complete) */}
          {journey.status === 'completed' && journey.finalProduct && (
            <div className="mt-10 premium-card p-8 text-center">
              <span className="text-6xl block mb-4">🎬</span>
              <h2 className="font-serif text-heading mb-3">Jornada Completa!</h2>
              <p className="text-sm text-kk-text-muted mb-6">
                O curta-metragem foi produzido colaborativamente por {journey.stages?.length || 5} vencedores.
              </p>
              <div className="grid grid-cols-5 gap-3 mb-6">
                {journey.stages?.map((s: any) => (
                  <div key={s.id} className="text-center">
                    <span className="text-xl block">{STAGE_ICONS[s.stageType]}</span>
                    <p className="text-xs text-gold mt-1">{s.winner?.displayName || '—'}</p>
                  </div>
                ))}
              </div>
              {journey.finalProduct.finalFilmUrl && (
                <a
                  href={journey.finalProduct.finalFilmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold text-sm py-3 px-10"
                >
                  Assistir Curta-Metragem Final
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
