import type { Lang } from "../i18n";
import { t } from "../i18n";

const testimonials = [
  {
    name: "Ana Rodrigues",
    handle: "@ana.cria",
    flag: "🇵🇹",
    avatar: "AR",
    color: "#FF6B00",
    text: "Fiz o diagnóstico e percebi logo o que estava errado. Em 2 semanas o meu alcance duplicou. Simples assim.",
    stars: 5,
  },
  {
    name: "Carlos Mendez",
    handle: "@carlosmendez_",
    flag: "🇪🇸",
    avatar: "CM",
    color: "#a855f7",
    text: "La herramienta de análisis de posts es increíble. Me reescribió el gancho y ese post llegó a 50K impresiones.",
    stars: 5,
  },
  {
    name: "Sofia Alves",
    handle: "@sofiaalves.digital",
    flag: "🇵🇹",
    avatar: "SA",
    color: "#22c55e",
    text: "Estava a postar todos os dias sem resultados. O diagnóstico mostrou-me exatamente o que faltava. Game changer.",
    stars: 5,
  },
  {
    name: "Laura García",
    handle: "@lauragarcia.c",
    flag: "🇪🇸",
    avatar: "LG",
    color: "#FF6B00",
    text: "Pasé de 200 a 2000 seguidores en 30 días aplicando exactamente lo que me recomendó. No puedo creerlo.",
    stars: 5,
  },
  {
    name: "Mike Thompson",
    handle: "@mikethompson",
    flag: "🇬🇧",
    avatar: "MT",
    color: "#3b82f6",
    text: "The real-time post analysis is something else. It caught issues I never would have noticed. My engagement went up 3x.",
    stars: 5,
  },
  {
    name: "Beatriz Costa",
    handle: "@beatriz.costa_",
    flag: "🇧🇷",
    avatar: "BC",
    color: "#22c55e",
    text: "Achei que sabia criar conteúdo. O diagnóstico me mostrou que estava errando em tudo. Agora tenho um processo.",
    stars: 5,
  },
];

export default function Testimonials({ lang }: { lang: Lang }) {
  return (
    <section style={{ padding: "80px 20px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,107,0,0.1)",
          border: "1px solid rgba(255,107,0,0.3)",
          borderRadius: 100,
          padding: "6px 16px",
          marginBottom: 16,
        }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, color: "#FF6B00", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Resultados reais
          </span>
        </div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, lineHeight: 1.2 }}>
          {t(lang, "testimonials_title")}
        </h2>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 20,
      }}>
        {testimonials.map((t_, i) => (
          <div key={i} style={{
            background: "#111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: 24,
            transition: "all 0.2s ease",
          }}
            onMouseOver={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = `${t_.color}40`;
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            }}
          >
            {/* Stars */}
            <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
              {"★★★★★".split("").map((s, j) => (
                <span key={j} style={{ color: "#FF6B00", fontSize: 14 }}>{s}</span>
              ))}
            </div>

            {/* Quote */}
            <p style={{ color: "#ccc", fontSize: 14, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
              "{t_.text}"
            </p>

            {/* Author */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: `${t_.color}22`,
                border: `1px solid ${t_.color}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 13,
                color: t_.color,
                flexShrink: 0,
              }}>
                {t_.avatar}
              </div>
              <div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                  {t_.name} <span>{t_.flag}</span>
                </div>
                <div style={{ fontSize: 12, color: "#555" }}>{t_.handle}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
