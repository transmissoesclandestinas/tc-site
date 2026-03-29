import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TC',
  description: 'TC — Programação',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: '#C8102E' }}>
        {children}
      </body>
    </html>
  )
}
