import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { senha } = await req.json()
  const senhaCorreta = process.env.ADMIN_PASSWORD

  if (!senhaCorreta) {
    return NextResponse.json({ error: 'Senha não configurada' }, { status: 500 })
  }

  if (senha === senhaCorreta) {
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
}
