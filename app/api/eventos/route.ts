import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataPath = path.join(process.cwd(), 'data', 'eventos.json')

async function lerEventos() {
  try {
    const conteudo = await fs.readFile(dataPath, 'utf-8')
    return JSON.parse(conteudo)
  } catch {
    return []
  }
}

export async function GET() {
  const eventos = await lerEventos()
  return NextResponse.json(eventos)
}

export async function POST(req: NextRequest) {
  const eventos = await req.json()
  await fs.mkdir(path.dirname(dataPath), { recursive: true })
  await fs.writeFile(dataPath, JSON.stringify(eventos, null, 2), 'utf-8')
  return NextResponse.json({ ok: true })
}
