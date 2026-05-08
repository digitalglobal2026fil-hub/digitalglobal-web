import type { QuizAnswer, LeadData } from "../pages/index";
import type { Lang } from "../i18n";
import { t } from "../i18n";

interface ResultProps {
  answers: QuizAnswer[];
  lead: LeadData | null;
  lang: Lang;
}

type Profile = {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  score: number;
  color: string;
  problems: string[];
  actions: { title: string; description: string; icon: string }[];
};

function calculateProfile(answers: QuizAnswer[], lang: Lang): Profile {
  const map: Record<string, string> = {};
  answers.forEach((a) => { map[String(a.questionId)] = a.answer; });

  let score = 0;
  if (map["1"] === "diario") score += 20; else if (map["1"] === "regular") score += 15; else if (map["1"] === "irregular") score += 8; else score += 2;
  if (map["2"] === "claro") score += 20; else if (map["2"] === "vago") score += 12; else if (map["2"] === "geral") score += 6; else score += 2;
  if (map["3"] === "crescendo") score += 20; else if (map["3"] === "estavel") score += 13; else if (map["3"] === "variavel") score += 8; else score += 3;
  if (map["4"] === "estruturado") score += 20; else if (map["4"] === "semi") score += 13; else if (map["4"] === "espontaneo") score += 7; else score += 4;
  if (map["6"] === "analiso_sempre") score += 20; else if (map["6"] === "vejo_as_vezes") score += 12; else if (map["6"] === "ocasional") score += 6; else score += 1;

  const profiles: Record<string, Record<"pt" | "es" | "en", Profile>> = {
    alto: {
      pt: {
        title: "Criador de Alto Impacto", subtitle: "Tens a base certa — agora é escalar", icon: "🚀", score, color: "#22c55e",
        description: "Tens uma estratégia sólida. Consistência, público definido, métricas analisadas. Agora é hora de monetizar com inteligência e escalar.",
        problems: ["Podes estar a perder oportunidades de monetização", "Estratégia pode estar estagnada sem inovação", "Falta de automação para escalar"],
        actions: [
          { icon: "💡", title: "Cria um funil de conteúdo", description: "Mapeia conteúdo para consciência, consideração e decisão. Guia os seguidores para produtos naturalmente." },
          { icon: "🤝", title: "Colaborações estratégicas", description: "5 criadores do teu nicho, colabs mensais. Duplicas alcance sem duplicar esforço." },
          { icon: "💰", title: "Lança um produto digital", description: "Com a tua autoridade, um ebook ou curso de entrada gera receita passiva. Valida rápido." },
        ],
      },
      es: {
        title: "Creador de Alto Impacto", subtitle: "Tienes la base correcta — ahora es escalar", icon: "🚀", score, color: "#22c55e",
        description: "Tienes una estrategia sólida. Consistencia, público definido, métricas analizadas. Ahora es hora de monetizar con inteligencia y escalar.",
        problems: ["Puedes estar perdiendo oportunidades de monetización", "La estrategia puede estar estancada sin innovación", "Falta de automatización para escalar"],
        actions: [
          { icon: "💡", title: "Crea un embudo de contenido", description: "Mapea contenido para conciencia, consideración y decisión." },
          { icon: "🤝", title: "Colaboraciones estratégicas", description: "5 creadores de tu nicho, colabs mensuales. Duplicas alcance sin duplicar esfuerzo." },
          { icon: "💰", title: "Lanza un producto digital", description: "Con tu autoridad, un ebook o curso de entrada genera ingresos pasivos." },
        ],
      },
      en: {
        title: "High-Impact Creator", subtitle: "You have the right foundation — now scale", icon: "🚀", score, color: "#22c55e",
        description: "You have a solid strategy. Consistency, defined audience, analyzed metrics. Now it's time to monetize intelligently and scale.",
        problems: ["You may be missing monetization opportunities", "Strategy may be stagnating without innovation", "Lack of automation to scale"],
        actions: [
          { icon: "💡", title: "Create a content funnel", description: "Map content for awareness, consideration, and decision stages." },
          { icon: "🤝", title: "Strategic collaborations", description: "5 creators in your niche, monthly collabs. Double your reach without doubling effort." },
          { icon: "💰", title: "Launch a digital product", description: "With your authority, an ebook or entry course generates passive income." },
        ],
      },
    },
    medio: {
      pt: {
        title: "Criador em Desenvolvimento", subtitle: "Potencial enorme — falta apenas estrutura", icon: "⚡", score, color: "#FF6B00",
        description: "Estás no bom caminho mas há inconsistências que travam o crescimento. Com pequenos ajustes, os resultados mudam completamente.",
        problems: ["Inconsistência na publicação reduz o alcance orgânico", "Público não totalmente definido dilui a mensagem", "Falta de análise impede otimização"],
        actions: [
          { icon: "📅", title: "Cria um calendário editorial", description: "Define 3 dias fixos por semana para publicar. O algoritmo premia consistência acima de tudo." },
          { icon: "🎯", title: "Define o teu avatar", description: "Uma pessoa específica: idade, profissão, dor principal, sonho. Todo o conteúdo fala diretamente para ela." },
          { icon: "📊", title: "15 min de análise por semana", description: "Os 3 melhores posts do mês — o que têm em comum? Faz mais disso." },
        ],
      },
      es: {
        title: "Creador en Desarrollo", subtitle: "Potencial enorme — solo falta estructura", icon: "⚡", score, color: "#FF6B00",
        description: "Estás en el buen camino pero hay inconsistencias que frenan el crecimiento. Con pequeños ajustes, los resultados cambian completamente.",
        problems: ["Inconsistencia en publicación reduce el alcance orgánico", "Público no bien definido diluye el mensaje", "Falta de análisis impide la optimización"],
        actions: [
          { icon: "📅", title: "Crea un calendario editorial", description: "Define 3 días fijos por semana para publicar. El algoritmo premia la consistencia." },
          { icon: "🎯", title: "Define tu avatar", description: "Una persona específica: edad, profesión, dolor principal, sueño. Todo el contenido habla directamente a ella." },
          { icon: "📊", title: "15 min de análisis por semana", description: "Los 3 mejores posts del mes — ¿qué tienen en común? Haz más de eso." },
        ],
      },
      en: {
        title: "Creator in Development", subtitle: "Huge potential — just need structure", icon: "⚡", score, color: "#FF6B00",
        description: "You're on the right track but inconsistencies are slowing growth. With small adjustments, the results change completely.",
        problems: ["Publishing inconsistency reduces organic reach", "Undefined audience dilutes the message", "Lack of analysis prevents optimization"],
        actions: [
          { icon: "📅", title: "Create an editorial calendar", description: "Set 3 fixed days per week to publish. The algorithm rewards consistency above all." },
          { icon: "🎯", title: "Define your avatar", description: "One specific person: age, profession, main pain, dream. All content speaks directly to them." },
          { icon: "📊", title: "15 min of weekly analysis", description: "Top 3 posts of the month — what do they have in common? Do more of that." },
        ],
      },
    },
    baixo: {
      pt: {
        title: "Criador em Recomeço", subtitle: "A hora certa para construir a fundação", icon: "🌱", score, color: "#a855f7",
        description: "Todos começam aqui. O que diferencia os que crescem é construir a fundação certa agora. Com os passos abaixo, vês resultados em 30 dias.",
        problems: ["Sem consistência, o algoritmo não mostra o teu conteúdo", "Sem público definido, a mensagem não ressoa com ninguém", "Sem processo, cada post é uma batalha desnecessária"],
        actions: [
          { icon: "🌟", title: "1 post por dia durante 21 dias", description: "Não precisa de ser perfeito. Precisa de ser publicado. 21 dias constroem o hábito e ensinam o algoritmo." },
          { icon: "👤", title: "Escolhe 1 nicho específico", description: "Resiste à tentação de falar de tudo. Escolhe 1 tema e sê a pessoa mais útil nesse tema." },
          { icon: "🔍", title: "Estuda 3 criadores do teu nicho", description: "1 hora por semana a analisar o que eles fazem. Não para copiar — para entender padrões." },
        ],
      },
      es: {
        title: "Creador en Reinicio", subtitle: "El momento correcto para construir los cimientos", icon: "🌱", score, color: "#a855f7",
        description: "Todos empiezan aquí. Lo que diferencia a los que crecen es construir la base correcta ahora. Con los pasos de abajo, verás resultados en 30 días.",
        problems: ["Sin consistencia, el algoritmo no muestra tu contenido", "Sin público definido, el mensaje no resuena con nadie", "Sin proceso, cada post es una batalla innecesaria"],
        actions: [
          { icon: "🌟", title: "1 post al día durante 21 días", description: "No necesita ser perfecto. Necesita ser publicado." },
          { icon: "👤", title: "Elige 1 nicho específico", description: "Resiste la tentación de hablar de todo. Elige 1 tema y sé la persona más útil en ese tema." },
          { icon: "🔍", title: "Estudia 3 creadores de tu nicho", description: "1 hora por semana analizando lo que hacen. No para copiar — para entender patrones." },
        ],
      },
      en: {
        title: "Creator Restarting", subtitle: "The right time to build the foundation", icon: "🌱", score, color: "#a855f7",
        description: "Everyone starts here. What differentiates those who grow is building the right foundation now. With the steps below, you'll see results in 30 days.",
        problems: ["Without consistency, the algorithm won't show your content", "Without a defined audience, the message doesn't resonate with anyone", "Without a process, every post is an unnecessary battle"],
        actions: [
          { icon: "🌟", title: "1 post per day for 21 days", description: "It doesn't need to be perfect. It needs to be published." },
          { icon: "👤", title: "Choose 1 specific niche", description: "Resist the urge to talk about everything. Choose 1 topic and be the most helpful person in that space." },
          { icon: "🔍", title: "Study 3 creators in your niche", description: "1 hour per week analyzing what they do. Not to copy — to understand patterns." },
        ],
      },
    },
  };

  const category = score >= 80 ? "alto" : score >= 55 ? "medio" : "baixo";
  return profiles[category][lang];
}

export default function Result({ answers, lead, lang }: ResultProps) {
  const profile = calculateProfile(answers, lang);

  return (
    <div style={{ minHeight: "100vh", padding: "100px 20px 60px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: 680, animation: "fadeSlideUp 0.5s ease forwards" }}>

        {/* Badge */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)",
            borderRadius: 100, padding: "6px 16px", marginBottom: 16,
          }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, color: "#FF6B00", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {t(lang, "result_title")}
            </span>
          </div>
          {lead?.name && <p style={{ color: "#666", fontSize: 14 }}>{lead.name},</p>}
        </div>

        {/* Profile card */}
        <div style={{
          background: "#111", border: `1px solid ${profile.color}30`,
          borderRadius: 20, padding: "36px", marginBottom: 24,
          boxShadow: `0 0 40px ${profile.color}12`, textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{profile.icon}</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px, 3.5vw, 34px)", fontWeight: 800, color: profile.color, marginBottom: 6, letterSpacing: "-0.02em" }}>
            {profile.title}
          </h1>
          <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>{profile.subtitle}</p>

          {/* Score bar */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: "#555" }}>{t(lang, "result_score")}</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: profile.color, fontSize: 16 }}>{profile.score}/100</span>
            </div>
            <div style={{ background: "#1A1A1A", borderRadius: 100, height: 6, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${profile.score}%`, background: `linear-gradient(90deg, ${profile.color}, ${profile.color}99)`, borderRadius: 100 }} />
            </div>
          </div>

          <p style={{ color: "#999", lineHeight: 1.65, fontSize: 14, textAlign: "left" }}>{profile.description}</p>
        </div>

        {/* Problems */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span>⚠️</span> {t(lang, "result_problems")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {profile.problems.map((p, i) => (
              <div key={i} style={{ background: "#111", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: "#FF6B00", flexShrink: 0 }}>→</span>
                <span style={{ color: "#bbb", fontSize: 14, lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🎯</span> {t(lang, "result_actions")}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {profile.actions.map((action, i) => (
              <div key={i} style={{
                background: "#111", border: "1px solid rgba(255,107,0,0.12)", borderRadius: 14, padding: "20px 22px",
                display: "flex", gap: 14, alignItems: "flex-start",
              }}>
                <div style={{ width: 42, height: 42, background: "rgba(255,107,0,0.1)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {action.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{action.title}</h3>
                  <p style={{ color: "#777", fontSize: 13, lineHeight: 1.6 }}>{action.description}</p>
                </div>
                <div style={{ width: 26, height: 26, background: "#FF6B00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 800, flexShrink: 0, color: "white" }}>
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg, rgba(255,107,0,0.12), rgba(255,107,0,0.04))", border: "1px solid rgba(255,107,0,0.25)", borderRadius: 18, padding: "36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 3vw, 26px)", fontWeight: 800, marginBottom: 10 }}>
            {t(lang, "result_cta_title")}
          </h2>
          <p style={{ color: "#888", marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>{t(lang, "result_cta_desc")}</p>
          <button className="btn-orange" style={{ fontSize: 15, padding: "13px 32px" }} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            {t(lang, "result_cta_btn")}
          </button>
          <p style={{ marginTop: 10, color: "#444", fontSize: 12 }}>
            {t(lang, "sent_to")} {lead?.email || "email"} {t(lang, "in_5min")}
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => window.location.reload()} style={{ background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 13, textDecoration: "underline", fontFamily: "'DM Sans', sans-serif" }}>
            {t(lang, "result_restart")}
          </button>
        </div>
      </div>

      <div style={{ position: "fixed", top: "30%", right: "-80px", width: "350px", height: "350px", background: "radial-gradient(circle, rgba(255,107,0,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
    </div>
  );
}
