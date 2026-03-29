'use client'

import { useState, useEffect } from 'react'

interface Evento {
  id: string
  evento: string
  dia: string
  hora: string
  lineup: string
}

function gerarId() {
  return Math.random().toString(36).substr(2, 9)
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroSenha, setErroSenha] = useState(false)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [publicando, setPublicando] = useState(false)
  const [publicado, setPublicado] = useState(false)

  useEffect(() => {
    if (autenticado) {
      fetch('/api/eventos').then(res => res.json()).then(data => setEventos(data))
    }
  }, [autenticado])

  async function handleLogin() {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha }),
    })
    if (res.ok) { setAutenticado(true); setErroSenha(false) }
    else setErroSenha(true)
  }

  function adicionarEvento() {
    setEventos(prev => [...prev, { id: gerarId(), evento: '', dia: '', hora: '', lineup: '' }])
  }

  function atualizarEvento(id: string, campo: keyof Evento, valor: string) {
    setEventos(prev => prev.map(ev => ev.id === id ? { ...ev, [campo]: valor } : ev))
  }

  function removerEvento(id: string) {
    setEventos(prev => prev.filter(ev => ev.id !== id))
  }

  async function publicar() {
    setPublicando(true)
    await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventos),
    })
    setPublicando(false)
    setPublicado(true)
    setTimeout(() => setPublicado(false), 2000)
  }

  const inp: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid white',
    color: 'white',
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    fontWeight: 700,
    fontSize: '14px',
    width: '100%',
    padding: '4px 0',
    outline: 'none',
  }

  const lbl: React.CSSProperties = {
    color: 'white',
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    fontWeight: 700,
    fontSize: '13px',
    marginBottom: '2px',
  }

  if (!autenticado) {
    return (
      <main style={{ background: '#C8102E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '260px' }}>
          <div style={{ color: 'white', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: '24px' }}>TC Admin</div>
          <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ ...inp, fontSize: '16px' }} />
          {erroSenha && <div style={{ color: 'white', fontSize: '13px', opacity: 0.7 }}>Senha incorreta.</div>}
          <button onClick={handleLogin} style={{ background: 'white', color: '#C8102E', border: 'none', padding: '10px', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>ENTRAR</button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#C8102E', minHeight: '100vh', padding: '40px 24px 120px', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ color: 'white', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: '20px' }}>Agenda</div>
        <button onClick={adicionarEvento} style={{ background: 'transparent', border: '1.5px solid white', borderRadius: '50%', width: '32px', height: '32px', color: 'white', fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>+</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {eventos.map((ev) => (
          <div key={ev.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(['evento', 'dia', 'hora', 'lineup'] as const).map(campo => (
              <div key={campo}>
                <div style={lbl}>{campo.charAt(0).toUpperCase() + campo.slice(1)}</div>
                <input style={inp} value={ev[campo]} onChange={e => atualizarEvento(ev.id, campo, e.target.value)} />
              </div>
            ))}
            <button onClick={() => removerEvento(ev.id)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: '12px', cursor: 'pointer', textAlign: 'left', padding: 0 }}>REMOVER</button>
          </div>
        ))}
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '24px', background: '#C8102E' }}>
        <button onClick={publicar} disabled={publicando} style={{ background: 'transparent', border: 'none', color: 'white', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: '16px', cursor: 'pointer', textDecoration: 'underline' }}>
          {publicando ? 'PUBLICANDO...' : publicado ? 'PUBLICADO ✓' : 'PUBLICAR'}
        </button>
      </div>
    </main>
  )
}