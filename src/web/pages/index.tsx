import { useState, useEffect } from "react";
import Header from "../components/Header";
import AccessGate from "../components/AccessGate";
import Hero from "../components/Hero";
import PostAnalyzer from "../components/PostAnalyzer";
import Modules from "../components/Modules";
import Testimonials from "../components/Testimonials";
import Quiz from "../components/Quiz";
import Result from "../components/Result";
import type { Lang } from "../i18n";

export type QuizAnswer = {
  questionId: number;
  answer: string;
};

export type LeadData = {
  name: string;
  email: string;
  instagram?: string;
};

export type AppState = "home" | "quiz" | "result";

export default function Index() {
  const [lang, setLang] = useState<Lang>("pt");
  const [state, setState] = useState<AppState>("home");
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [lead, setLead] = useState<LeadData | null>(null);

  // Acesso — verifica sessão existente
  const [hasAccess, setHasAccess] = useState(false);
  const [accessUser, setAccessUser] = useState({ name: "", email: "" });

  useEffect(() => {
    // Verifica se já tem acesso desta sessão
    const saved = sessionStorage.getItem("dg_access");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAccessUser({ name: parsed.name || "", email: parsed.email || "" });
        setHasAccess(true);
      } catch {}
    }
  }, []);

  function handleAccess(name: string, email: string) {
    setAccessUser({ name, email });
    setHasAccess(true);
  }

  // Sem acesso → mostra gate
  if (!hasAccess) {
    return (
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
        <Header lang={lang} onLangChange={setLang} />
        <AccessGate lang={lang} onAccess={handleAccess} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh" }}>
      <Header lang={lang} onLangChange={setLang} />

      {state === "home" && (
        <>
          <Hero lang={lang} onStart={() => setState("quiz")} />
          <PostAnalyzer lang={lang} />
          <Modules lang={lang} />
          <Testimonials lang={lang} />

          {/* Footer CTA */}
          <section style={{ padding: "60px 20px 80px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(20px, 3.5vw, 30px)", fontWeight: 800, marginBottom: 12 }}>
              {lang === "pt" ? "Pronto para o teu diagnóstico?" : lang === "es" ? "¿Listo para tu diagnóstico?" : "Ready for your diagnosis?"}
            </h2>
            <p style={{ color: "#555", marginBottom: 28, fontSize: 15 }}>
              {lang === "pt" ? "2 minutos. Resultado 100% personalizado." : lang === "es" ? "2 minutos. Resultado 100% personalizado." : "2 minutes. 100% personalized result."}
            </p>
            <button className="btn-orange" style={{ fontSize: 16 }} onClick={() => { setState("quiz"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              {lang === "pt" ? "Fazer o Diagnóstico" : lang === "es" ? "Hacer el Diagnóstico" : "Take the Diagnosis"}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </section>

          {/* Footer */}
          <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "24px 20px", textAlign: "center" }}>
            <p style={{ color: "#2a2a2a", fontSize: 12 }}>
              © 2026 Digital Global · {lang === "pt" ? "Todos os direitos reservados" : lang === "es" ? "Todos los derechos reservados" : "All rights reserved"}
            </p>
          </footer>
        </>
      )}

      {state === "quiz" && (
        <Quiz
          lang={lang}
          onComplete={(ans, leadData) => {
            setAnswers(ans);
            // Pré-preenche com dados do utilizador que fez login
            const finalLead = {
              ...leadData,
              name: leadData.name || accessUser.name,
              email: leadData.email || accessUser.email,
            };
            setLead(finalLead);
            setState("result");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {state === "result" && (
        <Result answers={answers} lead={lead} lang={lang} />
      )}
    </div>
  );
}
