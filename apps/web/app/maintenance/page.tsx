'use client'

import Image from 'next/image'

export default function MaintenancePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #FEFAE0 0%, #E9EDC9 40%, #CCD5AE 70%, #FAEDCD 100%)',
      }}
    >
      {/* Decorative glows */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-40 blur-[120px]"
        style={{ top: '10%', left: '5%', background: 'rgba(204,213,174,0.6)' }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-30 blur-[100px]"
        style={{ bottom: '10%', right: '5%', background: 'rgba(201,169,110,0.4)' }}
      />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        {/* Logo */}
        <div className="mb-10">
          <Image
            src="/img/logo-nav.png"
            alt="Jungle Games"
            width={180}
            height={54}
            className="mx-auto h-12 w-auto opacity-80"
          />
        </div>

        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/40 flex items-center justify-center mx-auto mb-8 shadow-lg">
          <span className="text-5xl">🌿</span>
        </div>

        {/* Title */}
        <h1
          className="font-serif text-4xl md:text-5xl tracking-tight mb-4"
          style={{ color: '#3A3A2E' }}
        >
          Estamos{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #C9A96E 0%, #D4B483 50%, #C9A96E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            evoluindo
          </span>
        </h1>

        {/* Message */}
        <p
          className="text-base md:text-lg leading-relaxed mb-10 font-light"
          style={{ color: '#6B6B5E' }}
        >
          Estamos preparando algo especial para você.
          <br />
          A arena está sendo construída — em breve você poderá jogar.
        </p>

        {/* Divider */}
        <div
          className="w-16 h-px mx-auto mb-8"
          style={{ background: 'linear-gradient(90deg, transparent, #C9A96E, transparent)' }}
        />

        {/* Coming soon badge */}
        <div
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border bg-white/40 backdrop-blur-sm"
          style={{ borderColor: 'rgba(201,169,110,0.3)' }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#C9A96E' }}
          />
          <span
            className="text-xs tracking-[0.2em] uppercase font-light"
            style={{ color: '#6B6B5E' }}
          >
            Em desenvolvimento
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs font-light" style={{ color: '#9B9B8E' }}>
          Jungle Games — Live Reality Games
        </p>
      </div>
    </div>
  )
}
