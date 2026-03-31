'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Evento {
  id: string
  evento: string
  dia: string
  hora: string
  lineup: string
  online: boolean
}

function gerarId() {
  return Math.random().toString(36).substr(2, 9)
}

const EASING = 'cubic-bezier(0.87, 0, 0.13, 1)'
const FS_NORMAL = '12px'
const FS_EDIT = '18px'
const GAP_NORMAL = '1px'
const GAP_EDIT = '20px'

function Card({
  ev,
  onDelete,
  onReorder,
  onUpdate,
}: {
  ev: Evento
  onDelete: (id: string) => void
  onReorder: (fromId: string, toId: string) => void
  onUpdate: (id: string, field: keyof Evento, value: string | boolean) => void
}) {
  const innerRef = useRef<HTMLDivElement>(null)
  const bgLRef = useRef<HTMLDivElement>(null)
  const bgRRef = useRef<HTMLDivElement>(null)
  const fieldsRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [isReordering, setIsReordering] = useState(false)

  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const curXRef = useRef(0)
  const draggingRef = useRef(false)
  const scrollCancelledRef = useRef(false)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reorderStartYRef = useRef(0)

  const enterEdit = useCallback(() => {
    setIsEditMode(true)
    if (fieldsRef.current) fieldsRef.current.style.gap = GAP_EDIT
    innerRef.current?.querySelectorAll<HTMLDivElement>('[contenteditable]').forEach(el => {
      el.style.fontSize = FS_EDIT
      el.contentEditable = 'true'
    })
  }, [])

  const exitEdit = useCallback(() => {
    setIsEditMode(false)
    if (fieldsRef.current) fieldsRef.current.style.gap = GAP_NORMAL
    innerRef.current?.querySelectorAll<HTMLDivElement>('[contenteditable]').forEach(el => {
      el.style.fontSize = FS_NORMAL
      el.contentEditable = 'false'
      el.blur()
    })
  }, [])

  const flashGreen = useCallback(() => {
    const el = innerRef.current
    if (!el) return
    el.style.transition = 'background 0.08s'
    el.style.background = '#22c55e'
    setTimeout(() => {
      el.style.transition = 'background 0.25s'
      el.style.background = 'rgba(161,161,170,0.5)'
    }, 180)
  }, [])

  const doPublish = useCallback(() => {
    if (ev.online) {
      setShowPopup(true)
    } else {
      flashGreen()
      onUpdate(ev.id, 'online', true)
    }
  }, [ev.online, ev.id, flashGreen, onUpdate])

  const doDelete = useCallback(() => {
    const el = innerRef.current
    const wrapper = wrapperRef.current
    if (!el || !wrapper) return
    el.style.transition = 'background 0.08s'
    el.style.background = '#ef4444'
    setTimeout(() => {
      wrapper.style.transition = 'max-height 0.35s ease, opacity 0.2s'
      wrapper.style.maxHeight = wrapper.offsetHeight + 'px'
      wrapper.style.overflow = 'hidden'
      requestAnimationFrame(() => {
        wrapper.style.maxHeight = '0'
        wrapper.style.opacity = '0'
      })
      setTimeout(() => onDelete(ev.id), 400)
    }, 180)
  }, [ev.id, onDelete])

  const dStart = useCallback((x: number, y: number) => {
    if (isEditMode || isReordering) return
    startXRef.current = x
    startYRef.current = y
    draggingRef.current = true
    scrollCancelledRef.current = false
    const inner = innerRef.current
    const bgL = bgLRef.current
    const bgR = bgRRef.current
    if (inner) inner.style.transition = 'none'
    if (bgL) bgL.style.transition = 'none'
    if (bgR) bgR.style.transition = 'none'
  }, [isEditMode, isReordering])

  const dMove = useCallback((x: number, y: number) => {
    if (!draggingRef.current) return
    const dx = x - startXRef.current
    const dy = y - startYRef.current
    if (!scrollCancelledRef.current && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
      scrollCancelledRef.current = true
    }
    const inner = innerRef.current
    const bgL = bgLRef.current
    const bgR = bgRRef.current
    const wrapper = wrapperRef.current
    if (!inner || !bgL || !bgR || !wrapper) return
    if (scrollCancelledRef.current) {
      inner.style.transform = 'translateX(0)'
      bgL.style.width = '0'
      bgR.style.width = '0'
      return
    }
    curXRef.current = dx
    inner.style.transform = `translateX(${dx}px)`
    if (dx > 0) {
      inner.style.borderRadius = '0 8px 8px 0'
      bgL.style.width = Math.min(dx, wrapper.offsetWidth) + 'px'
      bgR.style.width = '0'
    } else {
      inner.style.borderRadius = '8px 0 0 8px'
      bgR.style.width = Math.min(-dx, wrapper.offsetWidth) + 'px'
      bgL.style.width = '0'
    }
  }, [])

  const dEnd = useCallback(() => {
    if (!draggingRef.current) return
    draggingRef.current = false
    const curX = curXRef.current
    const action = (!scrollCancelledRef.current && curX > 90) ? 'publish'
      : (!scrollCancelledRef.current && curX < -90) ? 'delete' : null
    const inner = innerRef.current
    const bgL = bgLRef.current
    const bgR = bgRRef.current
    if (inner) {
      inner.style.transition = `transform 0.5s ${EASING}, border-radius 0.5s ${EASING}`
      inner.style.transform = 'translateX(0)'
      inner.style.borderRadius = '8px'
    }
    if (bgL) { bgL.style.transition = `width 0.5s ${EASING}`; bgL.style.width = '0' }
    if (bgR) { bgR.style.transition = `width 0.5s ${EASING}`; bgR.style.width = '0' }
    if (action === 'publish') setTimeout(doPublish, 480)
    else if (action === 'delete') setTimeout(doDelete, 480)
    curXRef.current = 0
  }, [doPublish, doDelete])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => dMove(e.clientX, e.clientY)
    const onMouseUp = () => dEnd()
    const onTouchMove = (e: TouchEvent) => dMove(e.touches[0].clientX, e.touches[0].clientY)
    const onTouchEnd = () => dEnd()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [dMove, dEnd])

  const dotStyle: React.CSSProperties = ev.online
    ? { width: 8, height: 8, borderRadius: '50%', background: 'rgba(212,212,216,0.9)', flexShrink: 0, marginTop: 2 }
    : { width: 8, height: 8, borderRadius: '50%', background: 'transparent', border: '1px solid rgba(212,212,216,0.8)', flexShrink: 0, marginTop: 2 }

  const fieldStyle = (val: string): React.CSSProperties => ({
    fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    fontWeight: 500,
    fontSize: FS_NORMAL,
    color: val ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.5)',
    outline: 'none',
    display: 'block',
    width: '100%',
    wordBreak: 'break-word',
    minHeight: '2em',
    transition: 'font-size 0.2s ease',
  })

  return (
    <>
      <div ref={wrapperRef} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', flexShrink: 0, outline: isReordering ? '4px solid rgba(255,255,255,1)' : 'none' }}>
        {/* bg publicar */}
        <div ref={bgLRef} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 0, background: '#22c55e', display: 'flex', alignItems: 'center', overflow: 'hidden', zIndex: 0 }}>
          <svg style={{ marginLeft: 16, flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        {/* bg deletar */}
        <div ref={bgRRef} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 0, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', zIndex: 0 }}>
          <svg style={{ marginRight: 16, flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
        </div>

        {/* card */}
        <div
          ref={innerRef}
          style={{ position: 'relative', zIndex: 1, background: 'rgba(161,161,170,0.5)', borderRadius: 8, padding: 0, cursor: 'pointer', overflow: 'hidden' }}
          onDoubleClick={e => { e.stopPropagation(); isEditMode ? exitEdit() : enterEdit() }}
          onMouseDown={e => {
            dStart(e.clientX, e.clientY)
            holdTimerRef.current = setTimeout(() => {
              setIsReordering(true)
              reorderStartYRef.current = e.clientY
            }, 500)
          }}
          onMouseUp={() => { if (holdTimerRef.current) clearTimeout(holdTimerRef.current) }}
          onTouchStart={e => {
            dStart(e.touches[0].clientX, e.touches[0].clientY)
            holdTimerRef.current = setTimeout(() => {
              setIsReordering(true)
              reorderStartYRef.current = e.touches[0].clientY
            }, 500)
          }}
          onTouchEnd={() => { if (holdTimerRef.current) clearTimeout(holdTimerRef.current); setIsReordering(false) }}
        >
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div ref={fieldsRef} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: GAP_NORMAL, transition: 'gap 0.2s ease' }}>
              <div
                contentEditable={false}
                suppressContentEditableWarning
                data-placeholder="Evento"
                style={{ ...fieldStyle(ev.evento), padding: '10px 10px 4px 10px' }}
                onFocus={e => { if (e.currentTarget.textContent === 'Evento') { e.currentTarget.textContent = ''; e.currentTarget.style.color = 'rgba(255,255,255,1)' } }}
                onBlur={e => { const v = e.currentTarget.textContent?.trim() || ''; onUpdate(ev.id, 'evento', v); if (!v) { e.currentTarget.textContent = 'Evento'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } else e.currentTarget.style.color = 'rgba(255,255,255,1)' }}
                onMouseDown={e => isEditMode && e.stopPropagation()}
                onTouchStart={e => isEditMode && e.stopPropagation()}
              >{ev.evento || 'Evento'}</div>

              <div
                contentEditable={false}
                suppressContentEditableWarning
                data-placeholder="Line up"
                style={{ ...fieldStyle(ev.lineup), padding: '4px 10px' }}
                onFocus={e => { if (e.currentTarget.textContent === 'Line up') { e.currentTarget.textContent = ''; e.currentTarget.style.color = 'rgba(255,255,255,1)' } }}
                onBlur={e => { const v = e.currentTarget.textContent?.trim() || ''; onUpdate(ev.id, 'lineup', v); if (!v) { e.currentTarget.textContent = 'Line up'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } else e.currentTarget.style.color = 'rgba(255,255,255,1)' }}
                onMouseDown={e => isEditMode && e.stopPropagation()}
                onTouchStart={e => isEditMode && e.stopPropagation()}
              >{ev.lineup || 'Line up'}</div>

              <div style={{ display: 'flex', width: '100%' }}>
                <div
                  contentEditable={false}
                  suppressContentEditableWarning
                  data-placeholder="Dia"
                  style={{ ...fieldStyle(ev.dia), width: '50%', padding: '4px 10px 10px 10px' }}
                  onFocus={e => { if (e.currentTarget.textContent === 'Dia') { e.currentTarget.textContent = ''; e.currentTarget.style.color = 'rgba(255,255,255,1)' } }}
                  onBlur={e => { const v = e.currentTarget.textContent?.trim() || ''; onUpdate(ev.id, 'dia', v); if (!v) { e.currentTarget.textContent = 'Dia'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } else e.currentTarget.style.color = 'rgba(255,255,255,1)' }}
                  onMouseDown={e => isEditMode && e.stopPropagation()}
                  onTouchStart={e => isEditMode && e.stopPropagation()}
                >{ev.dia || 'Dia'}</div>
                <div
                  contentEditable={false}
                  suppressContentEditableWarning
                  data-placeholder="Hora"
                  style={{ ...fieldStyle(ev.hora), width: '50%', padding: '4px 10px 10px 0', textAlign: 'center' }}
                  onFocus={e => { if (e.currentTarget.textContent === 'Hora') { e.currentTarget.textContent = ''; e.currentTarget.style.color = 'rgba(255,255,255,1)' } }}
                  onBlur={e => { const v = e.currentTarget.textContent?.trim() || ''; onUpdate(ev.id, 'hora', v); if (!v) { e.currentTarget.textContent = 'Hora'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' } else e.currentTarget.style.color = 'rgba(255,255,255,1)' }}
                  onMouseDown={e => isEditMode && e.stopPropagation()}
                  onTouchStart={e => isEditMode && e.stopPropagation()}
                >{ev.hora || 'Hora'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', padding: '10px 10px 0 0' }}>
              <div style={dotStyle} />
            </div>
          </div>
        </div>
      </div>

      {/* popup confirmação */}
      {showPopup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ background: '#4a4a47', borderRadius: 14, padding: '24px 20px', width: 260, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
            <div style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: 14, fontWeight: 500, color: 'white', textAlign: 'center', lineHeight: 1.5 }}>Tem certeza que quer deixar offline?</div>
            <div style={{ display: 'flex', gap: 10, width: '100%' }}>
              <button onClick={() => setShowPopup(false)} style={{ flex: 1, padding: 10, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: 13, fontWeight: 500, color: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { setShowPopup(false); onUpdate(ev.id, 'online', false) }} style={{ flex: 1, padding: 10, background: '#ef4444', border: 'none', borderRadius: 8, fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontSize: 13, fontWeight: 500, color: 'white', cursor: 'pointer' }}>Deixar offline</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroSenha, setErroSenha] = useState(false)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    if (autenticado) {
      fetch('/api/eventos').then(res => res.json()).then(data => {
        setEventos(data.map((ev: Evento) => ({ ...ev, online: ev.online ?? false })))
      })
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
    setEventos(prev => [...prev, { id: gerarId(), evento: '', dia: '', hora: '', lineup: '', online: false }])
  }

  function removerEvento(id: string) {
    setEventos(prev => prev.filter(ev => ev.id !== id))
  }

  function atualizarEvento(id: string, field: keyof Evento, value: string | boolean) {
    setEventos(prev => prev.map(ev => ev.id === id ? { ...ev, [field]: value } : ev))
  }

  async function salvar() {
    setSalvando(true)
    await fetch('/api/eventos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventos),
    })
    setSalvando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2000)
  }

  const inp: React.CSSProperties = {
    background: 'transparent', border: 'none', borderBottom: '1px solid white',
    color: 'white', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
    fontWeight: 700, fontSize: '16px', width: '100%', padding: '4px 0', outline: 'none',
  }

  if (!autenticado) {
    return (
      <main style={{ background: '#71706b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '260px' }}>
          <div style={{ color: 'white', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: '24px' }}>TC</div>
          <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={inp} />
          {erroSenha && <div style={{ color: 'white', fontSize: '13px', opacity: 0.7 }}>Senha incorreta.</div>}
          <button onClick={handleLogin} style={{ background: 'white', color: '#71706b', border: 'none', padding: '10px', fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: '14px', cursor: 'pointer', borderRadius: 4 }}>ENTRAR</button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ background: '#71706b', minHeight: '100vh', maxWidth: 420, margin: '0 auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20 }}>
        <div style={{ fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif', fontWeight: 700, fontSize: 22, color: 'white', letterSpacing: -1 }}>TC</div>
        <button onClick={salvar} disabled={salvando} style={{ width: 24, height: 24, background: 'rgba(161,161,170,0.5)', border: 'none', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          {salvo
            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          }
        </button>
      </div>

      {/* cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {eventos.map(ev => (
          <Card key={ev.id} ev={ev} onDelete={removerEvento} onReorder={() => {}} onUpdate={atualizarEvento} />
        ))}
      </div>

      {/* botão + */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 0 4px' }}>
        <button onClick={adicionarEvento} style={{ width: 40, height: 40, background: 'rgba(161,161,170,0.5)', border: 'none', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </button>
      </div>
    </main>
  )
}