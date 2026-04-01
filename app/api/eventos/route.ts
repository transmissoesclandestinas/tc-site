import { NextResponse } from "next/server";

const SHEET_ID = "1NwXSG5vVFXudGvZpTTWnO1by-GGjf0W-DocUjniRVQ4";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=P%C3%A1gina1`;

export async function GET() {
  try {
    const res = await fetch(SHEET_URL, { next: { revalidate: 60 } });
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;
    const agora = new Date();

    const eventos = rows
      .filter((row: any) => {
        const lineup = row.c[0]?.v ?? "";
        return lineup !== "" && lineup !== "lineup";
      })
      .map((row: any) => {
        const lineup = row.c[0]?.v ?? "";
        const diaRaw = String(row.c[1]?.v ?? "");
        const partes = diaRaw.split("/");
        const dia = partes[0] ?? "01";
        const mes = partes[1] ?? "01";
        const ano = partes[2] ?? String(new Date().getFullYear());
        const dataEvento = new Date(Number(ano), Number(mes) - 1, Number(dia));
        dataEvento.setHours(24, 0, 0, 0);
        return { lineup, dia: `${dia}/${mes}`, dataEvento };
      })
      .filter((ev: any) => ev.dataEvento > agora)
      .map(({ lineup, dia }: any) => ({ lineup, dia }));

    return NextResponse.json(eventos);
  } catch (e) {
    console.error(e);
    return NextResponse.json([]);
  }
}
