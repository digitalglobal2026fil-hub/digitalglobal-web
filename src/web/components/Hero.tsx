import type { Lang } from "../i18n";
import { t } from "../i18n";

interface HeroProps {
  onStart: () => void;
  lang: Lang;
}

export default function Hero({ onStart, lang }: HeroProps) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "100px 20px 60px",
      textAlign: "center",
    }}>
      {/* Badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.3)",
        borderRadius: 100, padding: "7px 18px", marginBottom: 28,
        animation: "fadeSlideUp 0.5s ease forwards",
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6B00", display: "inline-block", boxShadow: "0 0 8px #FF6B00" }}></span>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: "#FF6B00", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {t(lang, "hero_badge")}
        </span>
      </div>

      <h1 style={{
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        fontSize: "clamp(30px, 5.5vw, 62px)",
        lineHeight: 1.1,
        marginBottom: 14,
        maxWidth: 780,
        letterSpacing: "-0.02em",
        animation: "fadeSlideUp 0.6s ease 0.1s both",
      }}>
        {t(lang, "hero_title")}
      </h1>

      <p style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 600,
        fontSize: "clamp(17px, 2.5vw, 24px)", color: "#FF6B00",
        marginBottom: 20, animation: "fadeSlideUp 0.6s ease 0.15s both",
      }}>
        {t(lang, "hero_subtitle")}
      </p>

      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "clamp(14px, 1.8vw, 17px)", color: "#777",
        lineHeight: 1.6, maxWidth: 500, margin: "0 auto 36px",
        animation: "fadeSlideUp 0.6s ease 0.2s both",
      }}>
        {t(lang, "hero_desc")}
      </p>

      <div style={{ animation: "fadeSlideUp 0.6s ease 0.3s both" }}>
        <button className="btn-orange" onClick={onStart} style={{ fontSize: 17, padding: "15px 36px" }}>
          {lang === "pt" ? "Começar o Diagnóstico" : lang === "es" ? "Comenzar el Diagnóstico" : "Start the Diagnosis"}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>

      <div style={{
        position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "700px", height: "300px",
        background: "radial-gradient(ellipse at center bottom, rgba(255,107,0,0.1) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}
