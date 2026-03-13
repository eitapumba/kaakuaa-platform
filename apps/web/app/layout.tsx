import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Kaa Kuaa — Desafie-se. Regenere o Planeta.',
  description: 'Plataforma de desafios ao vivo com stakes reais que financiam regeneração ambiental.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
