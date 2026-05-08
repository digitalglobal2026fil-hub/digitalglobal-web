import type { Lang } from "../i18n";
import { t } from "../i18n";

const modules = [
  {
    num: "01",
    icon: "🔍",
    title: { pt: "Diagnóstico Rápido do Conteúdo", es: "Diagnóstico Rápido del Contenido", en: "Quick Content Diagnosis" },
    desc: { pt: "Perguntas simples para identificar exatamente o que está errado no teu post.", es: "Preguntas simples para identificar exactamente qué está mal en tu post.", en: "Simple questions to identify exactly what's wrong with your post." },
  },
  {
    num: "02",
    icon: "💀",
    title: { pt: "Os 7 Erros que Fazem um Post Morrer", es: "Los 7 Errores que Matan un Post", en: "The 7 Mistakes That Kill a Post" },
    desc: { pt: "Os erros mais comuns que destroem o alcance — e como evitá-los hoje.", es: "Los errores más comunes que destruyen el alcance — y cómo evitarlos hoy.", en: "The most common mistakes that destroy reach — and how to avoid them today." },
  },
  {
    num: "03",
    icon: "🪝",
    title: { pt: "Biblioteca de Ganchos Prontos", es: "Biblioteca de Ganchos Listos", en: "Ready-to-Use Hooks Library" },
    desc: { pt: "Frases prontas para usar em posts, reels e legendas — adaptadas ao teu nicho.", es: "Frases listas para usar en posts, reels y leyendas — adaptadas a tu nicho.", en: "Ready phrases to use in posts, reels and captions — adapted to your niche." },
  },
  {
    num: "04",
    icon: "🎯",
    title: { pt: "Como Adaptar o Gancho ao Teu Nicho", es: "Cómo Adaptar el Gancho a Tu Nicho", en: "How to Adapt the Hook to Your Niche" },
    desc: { pt: "O mesmo gancho não funciona para todos. Aprende a personalizá-lo à tua audiência.", es: "El mismo gancho no funciona para todos. Aprende a personalizarlo para tu audiencia.", en: "The same hook doesn't work for everyone. Learn to customize it for your audience." },
  },
  {
    num: "B",
    icon: "✅",
    title: { pt: "Bónus: Checklist Final Antes de Publicar", es: "Bonus: Checklist Final Antes de Publicar", en: "Bonus: Final Checklist Before Publishing" },
    desc: { pt: "Nunca mais publiques sem verificar esta lista. Garante que cada post tem o máximo impacto.", es: "Nunca más publiques sin revisar esta lista. Asegura que cada post tenga el máximo impacto.", en: "Never publish without checking this list. Ensures every post has maximum impact." },
    bonus: true,
  },
];

export default function Modules({ lang }: { lang: Lang }) {
  return (
    <section style={{ padding: "80px 20px", maxWidth: 800, margin: "0 auto" }}>
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
            Conteúdo que Converte
          </span>
        </div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, lineHeight: 1.2 }}>
          {t(lang, "modules_title")}
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {modules.map((m, i) => (
          <div key={i} style={{
            background: m.bonus ? "rgba(255,107,0,0.06)" : "#111",
            border: m.bonus ? "1px solid rgba(255,107,0,0.3)" : "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: "24px 28px",
            display: "flex",
            gap: 20,
            alignItems: "flex-start",
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: m.bonus ? "rgba(255,107,0,0.15)" : "#1A1A1A",
              border: m.bonus ? "1px solid rgba(255,107,0,0.3)" : "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}>
              {m.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: m.bonus ? "#FF6B00" : "#555",
                  fontWeight: 500,
                }}>
                  {m.bonus ? "BÓNUS" : `Módulo ${m.num}`}
                </span>
              </div>
              <h3 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 17,
                fontWeight: 700,
                color: m.bonus ? "#FF6B00" : "#fff",
                marginBottom: 6,
                lineHeight: 1.3,
              }}>
                {m.title[lang]}
              </h3>
              <p style={{ fontSize: 14, color: "#777", lineHeight: 1.6 }}>{m.desc[lang]}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
