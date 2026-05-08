import { useState } from "react";
import type { QuizAnswer, LeadData } from "../pages/index";
import type { Lang } from "../i18n";
import { t } from "../i18n";

interface QuizProps {
  onComplete: (answers: QuizAnswer[], leadData: LeadData) => void;
  lang: Lang;
}

function getQuestions(lang: Lang) {
  return [
    {
      id: 1,
      question: t(lang, "q1"),
      options: [
        { label: t(lang, "q1a"), value: "diario", icon: "🔥" },
        { label: t(lang, "q1b"), value: "regular", icon: "📅" },
        { label: t(lang, "q1c"), value: "irregular", icon: "📌" },
        { label: t(lang, "q1d"), value: "raro", icon: "😅" },
      ],
    },
    {
      id: 2,
      question: t(lang, "q2"),
      options: [
        { label: t(lang, "q2a"), value: "claro", icon: "🎯" },
        { label: t(lang, "q2b"), value: "vago", icon: "🤔" },
        { label: t(lang, "q2c"), value: "geral", icon: "🌐" },
        { label: t(lang, "q2d"), value: "nenhum", icon: "🤷" },
      ],
    },
    {
      id: 3,
      question: t(lang, "q3"),
      options: [
        { label: t(lang, "q3a"), value: "crescendo", icon: "📈" },
        { label: t(lang, "q3b"), value: "estavel", icon: "➡️" },
        { label: t(lang, "q3c"), value: "variavel", icon: "📊" },
        { label: t(lang, "q3d"), value: "baixo", icon: "📉" },
      ],
    },
    {
      id: 4,
      question: t(lang, "q4"),
      options: [
        { label: t(lang, "q4a"), value: "estruturado", icon: "🗓️" },
        { label: t(lang, "q4b"), value: "semi", icon: "💡" },
        { label: t(lang, "q4c"), value: "espontaneo", icon: "⚡" },
        { label: t(lang, "q4d"), value: "copia", icon: "📋" },
      ],
    },
    {
      id: 5,
      question: t(lang, "q5"),
      options: [
        { label: t(lang, "q5a"), value: "ideias", icon: "🧠" },
        { label: t(lang, "q5b"), value: "alcance", icon: "👁️" },
        { label: t(lang, "q5c"), value: "conversao", icon: "💸" },
        { label: t(lang, "q5d"), value: "tempo", icon: "⏰" },
      ],
    },
    {
      id: 6,
      question: t(lang, "q6"),
      options: [
        { label: t(lang, "q6a"), value: "analiso_sempre", icon: "📊" },
        { label: t(lang, "q6b"), value: "vejo_as_vezes", icon: "🔍" },
        { label: t(lang, "q6c"), value: "ocasional", icon: "👀" },
        { label: t(lang, "q6d"), value: "nunca", icon: "🙈" },
      ],
    },
  ];
}

export default function Quiz({ onComplete, lang }: QuizProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [lead, setLead] = useState({ name: "", email: "", instagram: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const QUESTIONS = getQuestions(lang);
  const currentQuestion = QUESTIONS[step];
  const isLeadStep = step === QUESTIONS.length;

  function handleNext() {
    if (!selected) return;
    const newAnswers = [...answers, { questionId: currentQuestion.id, answer: selected }];
    setAnswers(newAnswers);
    setSelected(null);
    setStep(step + 1);
  }

  async function handleSubmitLead(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!lead.name.trim() || !lead.email.trim()) {
      setError(t(lang, "fill_name_email"));
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...lead, answers }),
      });
    } catch (_) {}
    setSubmitting(false);
    onComplete(answers, lead as LeadData);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "100px 20px 60px",
    }}>
      <div style={{ width: "100%", maxWidth: 600 }}>

        {/* Progress header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,107,0,0.1)",
            border: "1px solid rgba(255,107,0,0.25)",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 16,
          }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: "#FF6B00" }}>
              {isLeadStep ? t(lang, "almost") : `${t(lang, "question_of")} ${step + 1} ${t(lang, "of")} ${QUESTIONS.length}`}
            </span>
          </div>
          <div style={{ background: "#1A1A1A", borderRadius: 100, height: 3, overflow: "hidden" }}>
            <div className="progress-bar" style={{ height: "100%", width: `${isLeadStep ? 100 : ((step + 1) / QUESTIONS.length) * 100}%` }} />
          </div>
        </div>

        {/* Question */}
        {!isLeadStep && (
          <div key={step} style={{ animation: "fadeSlideUp 0.35s ease forwards" }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(20px, 3.5vw, 28px)",
              fontWeight: 700,
              lineHeight: 1.25,
              marginBottom: 24,
              textAlign: "center",
              letterSpacing: "-0.01em",
            }}>
              {currentQuestion.question}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentQuestion.options.map((option) => (
                <div
                  key={option.value}
                  className={`option-card ${selected === option.value ? "selected" : ""}`}
                  onClick={() => setSelected(option.value)}
                  style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{option.icon}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: selected === option.value ? 600 : 400 }}>
                    {option.label}
                  </span>
                  {selected === option.value && (
                    <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "#FF6B00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                className="btn-orange"
                onClick={handleNext}
                disabled={!selected}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {step < QUESTIONS.length - 1 ? t(lang, "quiz_next") : t(lang, "quiz_last")}
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Lead form */}
        {isLeadStep && (
          <div style={{ animation: "fadeSlideUp 0.35s ease forwards" }}>
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: "clamp(22px, 3.5vw, 30px)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: 10,
              textAlign: "center",
            }}>
              {t(lang, "lead_title")}
            </h2>
            <p style={{ color: "#777", textAlign: "center", marginBottom: 28, fontSize: 15 }}>
              {t(lang, "lead_subtitle")}
            </p>

            <form onSubmit={handleSubmitLead} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 7, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {t(lang, "lead_name")}
                </label>
                <input className="input-dark" type="text" placeholder={t(lang, "name_placeholder")} value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 7, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {t(lang, "lead_email")}
                </label>
                <input className="input-dark" type="email" placeholder={t(lang, "email_placeholder")} value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#666", marginBottom: 7, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {t(lang, "lead_instagram")}
                </label>
                <input className="input-dark" type="text" placeholder={t(lang, "instagram_placeholder")} value={lead.instagram} onChange={(e) => setLead({ ...lead, instagram: e.target.value })} />
              </div>

              {error && <p style={{ color: "#ef4444", fontSize: 13 }}>{error}</p>}

              <button className="btn-orange" type="submit" disabled={submitting} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
                {submitting ? t(lang, "lead_processing") : t(lang, "lead_cta")}
                {!submitting && (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                )}
              </button>
              <p style={{ textAlign: "center", color: "#444", fontSize: 12 }}>{t(lang, "lead_no_spam")}</p>
            </form>
          </div>
        )}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "500px", height: "200px",
        background: "radial-gradient(ellipse at center bottom, rgba(255,107,0,0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
    </div>
  );
}
