'use client'

import { useEffect, useState } from 'react'

interface Evento {
  id: string
  evento: string
  dia: string
  hora: string
  lineup: string
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/eventos')
      .then(res => res.json())
      .then(data => { setEventos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <main style={{ background: '#C8102E', minHeight: '100vh' }} />

  return (
    <main style={{ background: '#C8102E', minHeight: '100vh', padding: eventos.length > 0 ? '60px 40px' : '0' }}>
      {eventos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '400px' }}>
          {eventos.map((ev) => (
            <div key={ev.id} style={{ display: 'inline-flex', gap: '27.5px', alignItems: 'flex-start' }}>
              <div style={{ width: '36px', display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end', gap: '9.5px' }}>
                <div style={{ color: 'white', fontSize: '32px', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: '700', lineHeight: 1 }}>{ev.dia}</div>
                <div style={{ color: 'white', fontSize: '14px', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: '700', textAlign: 'right' }}>{ev.hora}</div>
              </div>
              <div style={{ flex: '1 1 0', display: 'inline-flex', flexDirection: 'column', gap: '9.5px' }}>
                <div style={{ color: 'white', fontSize: '32px', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: '700', lineHeight: 1 }}>{ev.evento}</div>
                <div style={{ color: 'white', fontSize: '14px', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: '700' }}>{ev.lineup}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}