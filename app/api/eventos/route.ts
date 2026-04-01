import { NextResponse } from "next/server";

const SHEET_ID = "1NwXSG5vVFXudGvZpTTWnO1by-GGjf0W-DocUjniRVQ4";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

export async function GET() {
  try {
    const res = await fetch(SHEET_URL, { next: { revalidate: 60 } });
    const text = await res.text();

    // Google retorna um formato estranho, precisamos limpar antes de parsear
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;

    const agora = new Date();

    const eventos = rows
      .map((row: any) => {
        const evento = row.c[0]?.v ?? "";
        const lineup = row.c[1]?.v ?? "";
        const diaRaw = row.c[2]?.v ?? "";
        const hora = row.c[3]?.v ?? "";

        // converte DD/MM/AAAA para Date
        const [dia, mes, ano] = String(diaRaw).split("/");
        const dataEvento = new Date(Number(ano), Number(mes) - 1, Number(dia));
        // evento some 24h depois do dia
        dataEvento.setHours(24, 0, 0, 0);

        return { evento, lineup, dia: `${dia}.${mes}`, hora, dataEvento };
      })
      .filter((ev: any) => ev.dataEvento > agora && ev.evento !== "")
      .map(({ evento, lineup, dia, hora }: any) => ({
        evento,
        lineup,
        dia,
        hora,
      }));

    return NextResponse.json(eventos);
  } catch (e) {
    console.error(e);
    return NextResponse.json([]);
  }
}
