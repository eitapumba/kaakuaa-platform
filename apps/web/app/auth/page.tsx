'use client'

import { useState } from 'react'
import { useAuth } from '../../lib/auth-context'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const { login, register, error, loading } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!displayName.trim()) {
          setLocalError('Digite seu nome de guerreiro')
          return
        }
        await register(email, password, displayName)
      }
      router.push('/')
    } catch {
      // error is set in context
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-1 bg-sage-light relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sage-light via-beige to-sage opacity-80" />
        <div className="relative z-10 text-center px-12">
          <Image src="/img/logo-official.png" alt="Kaa Kuaa" width={300} height={90} className="mx-auto mb-8 drop-shadow-lg" />
          <h2 className="font-serif text-3xl text-sage-dark mb-4">Desafie-se.<br />Regenere o Planeta.</h2>
          <p className="text-sm text-kk-text-muted max-w-md mx-auto">
            Desafios ao vivo com stakes reais. 30% de cada pool regenera o planeta.
            Jogue, ganhe, evolua.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <Image src="/img/logo-nav.png" alt="Kaa Kuaa" width={140} height={42} className="mx-auto mb-4" />
          </div>

          {/* Title */}
          <h1 className="font-serif text-heading text-center mb-2">
            {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
          </h1>
          <p className="text-sm text-kk-text-muted text-center mb-8">
            {mode === 'login'
              ? 'Entre na arena e desafie o mundo'
              : 'Escolha seu nome de guerreiro e comece'}
          </p>

          {/* Error */}
          {(error || localError) && (
            <div className="glass-card rounded-xl p-3 mb-5 border-l-4 border-red-400">
              <p className="text-sm text-red-600">{localError || error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="sec-label block mb-2">Nome de Guerreiro</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Ex: Pumba, xBlaze, MC_Flow"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/60 border border-gold-muted text-kk-text placeholder:text-kk-text-muted/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-sm"
                />
              </div>
            )}

            <div>
              <label className="sec-label block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3.5 rounded-2xl bg-white/60 border border-gold-muted text-kk-text placeholder:text-kk-text-muted/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-sm"
              />
            </div>

            <div>
              <label className="sec-label block mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full px-4 py-3.5 rounded-2xl bg-white/60 border border-gold-muted text-kk-text placeholder:text-kk-text-muted/50 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-4 mt-2 disabled:opacity-50"
            >
              {loading
                ? 'Carregando...'
                : mode === 'login'
                  ? 'Entrar'
                  : 'Criar Conta'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="gold-line flex-1" />
            <span className="text-xs text-kk-text-muted">ou</span>
            <div className="gold-line flex-1" />
          </div>

          {/* Toggle */}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setLocalError('') }}
            className="w-full text-center text-sm text-gold hover:text-gold-dark transition-colors"
          >
            {mode === 'login'
              ? 'Não tem conta? Cadastre-se'
              : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  )
}
