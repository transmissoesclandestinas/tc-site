import { NextResponse } from "next/server";

const SHEET_ID = "1NwXSG5vVFXudGvZpTTWnO1by-GGjf0W-DocUjniRVQ4";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Sheet1`;

export async function GET() {
  try {
    const res = await fetch(SHEET_URL, { cache: "no-store" });
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));
    const rows = json.table.rows;
    const agora = new Date();

    const eventos = rows
      .map((row: any) => {
        const evento = row.c[0]?.v ?? "";
        const lineup = row.c[1]?.v ?? "";
        const hora = row.c[3]?.v ?? "";

        // Google Sheets pode retornar data como número serial ou como string
        const diaRaw = row.c[2];
        let dataEvento: Date;

        if (diaRaw?.f) {
          // formato formatado: "08/04/2026"
          const partes = String(diaRaw.f).split("/");
          dataEvento = new Date(
            Number(partes[2]),
            Number(partes[1]) - 1,
            Number(partes[0]),
          );
        } else if (typeof diaRaw?.v === "number") {
          // número serial do Google (dias desde 30/12/1899)
          dataEvento = new Date(Math.round((diaRaw.v - 25569) * 86400 * 1000));
        } else {
          const partes = String(diaRaw?.v ?? "").split("/");
          dataEvento = new Date(
            Number(partes[2]),
            Number(partes[1]) - 1,
            Number(partes[0]),
          );
        }

        dataEvento.setHours(24, 0, 0, 0);

        const dia = String(dataEvento.getDate()).padStart(2, "0");
        const mes = String(dataEvento.getMonth() + 1).padStart(2, "0");

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
