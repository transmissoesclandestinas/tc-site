"use client";

import { useEffect, useState } from "react";

interface Evento {
  lineup: string;
  dia: string;
}

const CORES = ["#008FFF", "#41FB73", "#D7F91B", "#ED8CEA"];

function getTextColor(cor: string) {
  return cor === "#008FFF" ? "white" : "#111";
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [cor, setCor] = useState("#bababa");

  useEffect(() => {
    const corAleatoria = CORES[Math.floor(Math.random() * CORES.length)];
    setCor(corAleatoria);
    fetch("/api/eventos")
      .then((res) => res.json())
      .then((data) => {
        setEventos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const textColor = getTextColor(cor);
  const border = `1px solid ${textColor}`;

  if (loading) return <main style={{ background: cor, minHeight: "100vh" }} />;

  return (
    <main
      style={{
        background: cor,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {eventos.length > 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            padding: "10px 20px",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px" }}>
            {["TRAUMA", "PROXIMOS SHOWS", "2026"].map((label) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  paddingRight: "10px",
                  paddingTop: "8px",
                  borderRight: border,
                  borderTop: border,
                }}
              >
                <div
                  style={{
                    fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                    fontSize: "8px",
                    fontWeight: 500,
                    color: textColor,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>

          {eventos.map((ev, i) => {
            const [dia, mes] = ev.dia.split("/");
            return (
              <div
                key={i}
                style={{ display: "flex", alignItems: "flex-start" }}
              >
                <div
                  style={{
                    paddingRight: "8px",
                    paddingTop: "8px",
                    borderRight: border,
                    borderTop: border,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        "Helvetica Neue, Helvetica, Arial, sans-serif",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: textColor,
                      lineHeight: 1.1,
                    }}
                  >
                    {dia}
                  </div>
                  <div
                    style={{
                      fontFamily:
                        "Helvetica Neue, Helvetica, Arial, sans-serif",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: textColor,
                      lineHeight: 1.1,
                    }}
                  >
                    /
                  </div>
                  <div
                    style={{
                      fontFamily:
                        "Helvetica Neue, Helvetica, Arial, sans-serif",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: textColor,
                      lineHeight: 1.1,
                    }}
                  >
                    {mes}
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    minHeight: "96px",
                    padding: "8px",
                    borderTop: border,
                  }}
                >
                  <div
                    style={{
                      fontFamily:
                        "Helvetica Neue, Helvetica, Arial, sans-serif",
                      fontSize: "36px",
                      fontWeight: 500,
                      color: textColor,
                      lineHeight: 0.95,
                      wordBreak: "break-word",
                    }}
                  >
                    {ev.lineup}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
