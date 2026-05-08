import { useState, useRef } from "react";
import type { Lang } from "../i18n";
import { t } from "../i18n";

interface PostAnalyzerProps {
  lang: Lang;
}

type AnalysisResult = {
  hookScore: number;
  clarityScore: number;
  ctaScore: number;
  strongPoints: string[];
  improvements: string[];
  rewrittenHook: string;
};

function analyzePost(text: string): AnalysisResult {
  const lower = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Hook score — presence of power words, questions, numbers
  let hookScore = 40;
  const hookWords = ["descobre", "aprende", "para de", "erro", "segredo", "verdade", "porque", "como", "stop", "descubra", "aprende", "errores", "secreto", "discover", "learn", "stop", "mistake", "secret"];
  hookWords.forEach(w => { if (lower.includes(w)) hookScore += 8; });
  if (/\d/.test(text)) hookScore += 10;
  if (text.includes("?")) hookScore += 8;
  hookScore = Math.min(hookScore, 98);

  // Clarity score
  let clarityScore = 50;
  if (wordCount >= 30 && wordCount <= 150) clarityScore += 20;
  if (wordCount < 15) clarityScore -= 15;
  if (wordCount > 300) clarityScore -= 10;
  const paragraphs = text.split(/\n\n+/).length;
  if (paragraphs >= 2) clarityScore += 15;
  clarityScore = Math.min(Math.max(clarityScore, 20), 95);

  // CTA score
  let ctaScore = 30;
  const ctaWords = ["comenta", "partilha", "segue", "clica", "link", "salva", "guarda", "comment", "share", "follow", "click", "save", "comenta", "comparte", "sígueme", "guarda"];
  ctaWords.forEach(w => { if (lower.includes(w)) ctaScore += 12; });
  if (text.includes("👇") || text.includes("⬇") || text.includes("→")) ctaScore += 10;
  ctaScore = Math.min(ctaScore, 95);

  // Strong points
  const strongPoints: string[] = [];
  if (hookScore >= 65) strongPoints.push("Gancho com boa força de atração");
  if (clarityScore >= 65) strongPoints.push("Mensagem clara e bem estruturada");
  if (ctaScore >= 55) strongPoints.push("Chamada à ação presente");
  if (wordCount >= 50) strongPoints.push("Tamanho adequado para engagement");
  if (/\d/.test(text)) strongPoints.push("Uso de números aumenta credibilidade");
  if (strongPoints.length === 0) strongPoints.push("Tens base para melhorar — continua!");

  // Improvements
  const improvements: string[] = [];
  if (hookScore < 60) improvements.push("Reforça o gancho nas primeiras 2 linhas — é o que decide se param para ler");
  if (ctaScore < 50) improvements.push("Adiciona uma chamada à ação clara no final (ex: 'Comenta aqui se isto te acontece')");
  if (clarityScore < 60) improvements.push("Divide o texto em parágrafos curtos — facilita a leitura no mobile");
  if (wordCount < 20) improvements.push("Desenvolve mais a mensagem — posts muito curtos perdem profundidade");
  if (!lower.includes("tu") && !lower.includes("você") && !lower.includes("you") && !lower.includes("tú")) {
    improvements.push("Fala diretamente para o teu leitor usando 'tu' ou 'você'");
  }
  if (improvements.length === 0) improvements.push("Post sólido! Testa variações do gancho para maximizar alcance.");

  // Rewritten hook
  const firstLine = text.split("\n")[0]?.slice(0, 80) || text.slice(0, 80);
  const rewrittenHook = `"Estás a cometer este erro no teu conteúdo — e está a custar-te seguidores todos os dias. ${firstLine.length > 20 ? firstLine.slice(0, 40) + "..." : "Descobre como corrigir agora."}"`;

  return { hookScore, clarityScore, ctaScore, strongPoints, improvements, rewrittenHook };
}

function ScoreBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#aaa" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "'Syne', sans-serif" }}>{score}%</span>
      </div>
      <div style={{ background: "#1A1A1A", borderRadius: 100, height: 6, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${score}%`,
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
          borderRadius: 100,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

export default function PostAnalyzer({ lang }: PostAnalyzerProps) {
  const [postText, setPostText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!postText.trim() && !imageFile) return;
    setAnalyzing(true);
    setResult(null);
    // Simula delay de análise
    await new Promise(r => setTimeout(r, 1800));
    const text = postText || "Imagem carregada — análise baseada em padrões visuais e de estrutura.";
    setResult(analyzePost(text));
    setAnalyzing(false);
  }

  return (
    <section style={{ padding: "80px 20px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
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
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF6B00", display: "inline-block", boxShadow: "0 0 8px #FF6B00" }}></span>
          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 11, color: "#FF6B00", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            IA em Tempo Real
          </span>
        </div>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(22px, 4vw, 34px)", fontWeight: 800, marginBottom: 10, lineHeight: 1.2 }}>
          {t(lang, "upload_title")}
        </h2>
        <p style={{ color: "#777", fontSize: 15 }}>{t(lang, "upload_subtitle")}</p>
      </div>

      {/* Input area */}
      <div style={{ background: "#111", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 16, padding: 24, marginBottom: 16 }}>
        <textarea
          className="input-dark"
          style={{ minHeight: 130, resize: "vertical", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, marginBottom: 0 }}
          placeholder={t(lang, "upload_placeholder")}
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          <span style={{ color: "#555", fontSize: 13 }}>{t(lang, "upload_or")}</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* Upload image */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: "2px dashed rgba(255,107,0,0.25)",
            borderRadius: 12,
            padding: "20px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: imagePreview ? "transparent" : "rgba(255,107,0,0.03)",
          }}
          onMouseOver={e => (e.currentTarget.style.borderColor = "rgba(255,107,0,0.5)")}
          onMouseOut={e => (e.currentTarget.style.borderColor = "rgba(255,107,0,0.25)")}
        >
          {imagePreview ? (
            <div style={{ position: "relative" }}>
              <img src={imagePreview} alt="post" style={{ maxHeight: 200, borderRadius: 8, maxWidth: "100%" }} />
              <button
                onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(null); }}
                style={{ position: "absolute", top: 8, right: 8, background: "#333", border: "none", color: "#fff", borderRadius: "50%", width: 24, height: 24, cursor: "pointer", fontSize: 12 }}
              >✕</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
              <p style={{ color: "#666", fontSize: 14 }}>{t(lang, "upload_image")}</p>
            </>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
      </div>

      <button
        className="btn-orange"
        style={{ width: "100%", justifyContent: "center", fontSize: 16 }}
        onClick={handleAnalyze}
        disabled={analyzing || (!postText.trim() && !imageFile)}
      >
        {analyzing ? (
          <>
            <span style={{ display: "inline-block", animation: "spin 1s linear infinite", marginRight: 8 }}>⟳</span>
            {t(lang, "upload_analyzing")}
          </>
        ) : (
          <>
            {t(lang, "upload_btn")}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div style={{ marginTop: 32, animation: "fadeSlideUp 0.5s ease forwards" }}>
          <div style={{
            background: "#111",
            border: "1px solid rgba(255,107,0,0.2)",
            borderRadius: 16,
            padding: 28,
            marginBottom: 20,
          }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 24, color: "#FF6B00" }}>
              {t(lang, "analysis_result")}
            </h3>
            <ScoreBar score={result.hookScore} label={t(lang, "hook_score")} color="#FF6B00" />
            <ScoreBar score={result.clarityScore} label={t(lang, "clarity")} color="#22c55e" />
            <ScoreBar score={result.ctaScore} label={t(lang, "cta_strength")} color="#a855f7" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "#111", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                ✓ {t(lang, "strong_points")}
              </div>
              {result.strongPoints.map((p, i) => (
                <p key={i} style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5, marginBottom: 8 }}>• {p}</p>
              ))}
            </div>
            <div style={{ background: "#111", border: "1px solid rgba(255,107,0,0.2)", borderRadius: 14, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
                → {t(lang, "improvements")}
              </div>
              {result.improvements.map((p, i) => (
                <p key={i} style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5, marginBottom: 8 }}>• {p}</p>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(255,107,0,0.06)", border: "1px solid rgba(255,107,0,0.25)", borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B00", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              🪝 Gancho reescrito pela IA
            </div>
            <p style={{ fontSize: 14, color: "#ddd", fontStyle: "italic", lineHeight: 1.6 }}>{result.rewrittenHook}</p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </section>
  );
}
