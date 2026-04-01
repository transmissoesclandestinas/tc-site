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
      .map((row: any) => {
        const lineup = row.c[0]?.v ?? "";
        const diaRaw = row.c[1]?.v ?? "";
        const [dia, mes, ano] = String(diaRaw).split("/");
        const dataEvento = new Date(Number(ano), Number(mes) - 1, Number(dia));
        dataEvento.setHours(24, 0, 0, 0);
        return { lineup, dia: `${dia}/${mes}`, dataEvento };
      })
      .filter((ev: any) => ev.dataEvento > agora && ev.lineup !== "")
      .map(({ lineup, dia }: any) => ({ lineup, dia }));

    return NextResponse.json(eventos);
  } catch (e) {
    console.error(e);
    return NextResponse.json([]);
  }
}
