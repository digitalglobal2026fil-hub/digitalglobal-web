import { useState, useRef } from "react";
import type { Lang } from "../i18n";

interface AccessGateProps {
  lang: Lang;
  onAccess: (name: string, email: string) => void;
}

const copy = {
  pt: {
    title: "Acesso Exclusivo",
    step1_sub: "Introduz o código que recebeste por email após a compra.",
    code_label: "Código de acesso",
    code_placeholder: "XXXX-XXXX",
    btn_next: "Continuar",
    btn_loading: "A verificar...",
    step2_sub: "Enviámos um código de 6 dígitos para",
    otp_label: "Código de confirmação",
    btn_verify: "Confirmar e Entrar",
    btn_verifying: "A confirmar...",
    btn_resend: "Reenviar código",
    btn_back: "← Voltar",
    buy: "Ainda não és cliente?",
    buy_link: "Adquirir acesso",
    err_empty_code: "Introduz o teu código de acesso.",
    err_empty_otp: "Introduz o código de 6 dígitos.",
    err_generic: "Erro ao verificar. Tenta novamente.",
    resent: "Código reenviado!",
  },
  es: {
    title: "Acceso Exclusivo",
    step1_sub: "Introduce el código que recibiste por email después de la compra.",
    code_label: "Código de acceso",
    code_placeholder: "XXXX-XXXX",
    btn_next: "Continuar",
    btn_loading: "Verificando...",
    step2_sub: "Enviamos un código de 6 dígitos a",
    otp_label: "Código de confirmación",
    btn_verify: "Confirmar y Entrar",
    btn_verifying: "Confirmando...",
    btn_resend: "Reenviar código",
    btn_back: "← Volver",
    buy: "¿Aún no eres cliente?",
    buy_link: "Obtener acceso",
    err_empty_code: "Introduce tu código de acceso.",
    err_empty_otp: "Introduce el código de 6 dígitos.",
    err_generic: "Error al verificar. Inténtalo de nuevo.",
    resent: "¡Código reenviado!",
  },
  en: {
    title: "Exclusive Access",
    step1_sub: "Enter the code you received by email after your purchase.",
    code_label: "Access code",
    code_placeholder: "XXXX-XXXX",
    btn_next: "Continue",
    btn_loading: "Verifying...",
    step2_sub: "We sent a 6-digit code to",
    otp_label: "Confirmation code",
    btn_verify: "Confirm & Enter",
    btn_verifying: "Confirming...",
    btn_resend: "Resend code",
    btn_back: "← Back",
    buy: "Not a customer yet?",
    buy_link: "Get access",
    err_empty_code: "Enter your access code.",
    err_empty_otp: "Enter the 6-digit code.",
    err_generic: "Error verifying. Please try again.",
    resent: "Code resent!",
  },
};

const HOTMART_5DIAS  = "https://pay.hotmart.com/A105734433D?off=s78x2i7f";
const HOTMART_30DIAS = "https://pay.hotmart.com/A105734433D?off=0jtg3cz3";

function formatCode(val: string) {
  const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
  if (clean.length > 4) return clean.slice(0, 4) + "-" + clean.slice(4);
  return clean;
}

export default function AccessGate({ lang, onAccess }: AccessGateProps) {
  const c = copy[lang];
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── PASSO 1: valida código e pede OTP
  async function handleRequestOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.replace(/-/g, "").length < 8) { setError(c.err_empty_code); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/access/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMaskedEmail(data.maskedEmail || "");
        setStep(2);
      } else {
        setError(data.error || c.err_generic);
      }
    } catch {
      setError(c.err_generic);
    }
    setLoading(false);
  }

  // ── PASSO 2: verifica OTP
  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const otpStr = otp.join("");
    if (otpStr.length < 6) { setError(c.err_empty_otp); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/access/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), otp: otpStr }),
      });
      const data = await res.json();
      if (data.valid) {
        sessionStorage.setItem("dg_access", JSON.stringify({ name: data.name || "", email: data.email || "", code: code.trim() }));
        onAccess(data.name || "", data.email || "");
      } else {
        setError(data.error || c.err_generic);
      }
    } catch {
      setError(c.err_generic);
    }
    setLoading(false);
  }

  // ── Reenviar OTP
  async function handleResend() {
    setError("");
    setResent(false);
    try {
      await fetch("/api/access/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      setResent(true);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      setTimeout(() => setResent(false), 3000);
    } catch { setError(c.err_generic); }
  }

  // ── Input OTP individual
  function handleOtpInput(index: number, val: string) {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      otpRefs.current[5]?.focus();
    }
    e.preventDefault();
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "80px 20px",
    }}>
      <div style={{ width: "100%", maxWidth: 440, animation: "fadeSlideUp 0.5s ease forwards" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/logo.png" alt="Digital Global" style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover", marginBottom: 12 }} />
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: "-0.02em" }}>
            Digital <span style={{ color: "#FF6B00" }}>Global</span>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "#111", border: "1px solid rgba(255,107,0,0.2)",
          borderRadius: 20, padding: "36px 30px",
          boxShadow: "0 0 50px rgba(255,107,0,0.07)",
        }}>

          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 28 }}>
            {[1, 2].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: step >= s ? "#FF6B00" : "#1A1A1A",
                  border: step >= s ? "none" : "1px solid #333",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 12,
                  color: step >= s ? "#fff" : "#555",
                  transition: "all 0.3s ease",
                }}>
                  {step > s ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : s}
                </div>
                {s < 2 && <div style={{ width: 40, height: 2, background: step > s ? "#FF6B00" : "#222", borderRadius: 2, transition: "background 0.3s ease" }} />}
              </div>
            ))}
          </div>

          {/* STEP 1 — Código de acesso */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
                  {c.title}
                </h1>
                <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{c.step1_sub}</p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: 8, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {c.code_label}
                </label>
                <input
                  className="input-dark"
                  type="text"
                  placeholder={c.code_placeholder}
                  value={code}
                  onChange={(e) => setCode(formatCode(e.target.value))}
                  style={{ textAlign: "center", fontSize: 20, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: "0.15em", padding: "16px" }}
                  maxLength={9}
                  autoComplete="off"
                  autoCapitalize="characters"
                />
              </div>

              {error && <ErrorBox msg={error} />}

              <button
                className="btn-orange"
                type="submit"
                disabled={loading || code.replace(/-/g, "").length < 8}
                style={{ width: "100%", justifyContent: "center", fontSize: 15, marginTop: 4 }}
              >
                {loading ? c.btn_loading : (
                  <>{c.btn_next} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                )}
              </button>
            </form>
          )}

          {/* STEP 2 — OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: "rgba(255,107,0,0.1)", border: "1px solid rgba(255,107,0,0.25)",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/>
                  </svg>
                </div>
                <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
                  Verifica o teu email
                </h1>
                <p style={{ color: "#666", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  {c.step2_sub} <strong style={{ color: "#FF6B00" }}>{maskedEmail}</strong>
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center" }}>
                  {c.otp_label}
                </label>
                {/* OTP boxes */}
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }} onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      style={{
                        width: 48, height: 56,
                        background: "#1A1A1A",
                        border: digit ? "2px solid #FF6B00" : "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        color: "#fff",
                        fontSize: 24,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 800,
                        textAlign: "center",
                        outline: "none",
                        transition: "border-color 0.15s ease",
                        caretColor: "#FF6B00",
                      }}
                    />
                  ))}
                </div>
              </div>

              {resent && (
                <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 8, padding: "8px 14px", marginBottom: 12, color: "#22c55e", fontSize: 13, textAlign: "center" }}>
                  {c.resent}
                </div>
              )}
              {error && <ErrorBox msg={error} />}

              <button
                className="btn-orange"
                type="submit"
                disabled={loading || otp.join("").length < 6}
                style={{ width: "100%", justifyContent: "center", fontSize: 15, marginBottom: 12 }}
              >
                {loading ? c.btn_verifying : (
                  <>{c.btn_verify} <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></>
                )}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button type="button" onClick={() => { setStep(1); setError(""); setOtp(["","","","","",""]); }}
                  style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", padding: 0 }}>
                  {c.btn_back}
                </button>
                <button type="button" onClick={handleResend}
                  style={{ background: "none", border: "none", color: "#FF6B00", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif", padding: 0, textDecoration: "underline" }}>
                  {c.btn_resend}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Buy links */}
        <div style={{ marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
          <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {c.buy}
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={HOTMART_5DIAS} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, display: "block", background: "rgba(255,107,0,0.08)",
                border: "1px solid rgba(255,107,0,0.3)", borderRadius: 10,
                padding: "12px 8px", textAlign: "center", textDecoration: "none",
                transition: "all 0.2s",
              }}>
              <div style={{ color: "#FF6B00", fontWeight: 800, fontSize: 15 }}>16€</div>
              <div style={{ color: "#888", fontSize: 11, marginTop: 2 }}>5 dias</div>
            </a>
            <a href={HOTMART_30DIAS} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, display: "block", background: "rgba(255,107,0,0.13)",
                border: "1px solid rgba(255,107,0,0.5)", borderRadius: 10,
                padding: "12px 8px", textAlign: "center", textDecoration: "none",
                transition: "all 0.2s",
              }}>
              <div style={{ color: "#FF6B00", fontWeight: 800, fontSize: 15 }}>32€</div>
              <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>30 dias ⭐</div>
            </a>
          </div>
        </div>
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "600px", height: "300px",
        background: "radial-gradient(ellipse at center bottom, rgba(255,107,0,0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div style={{
      background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: 8, padding: "10px 14px", marginBottom: 12,
      color: "#ef4444", fontSize: 13, textAlign: "center",
    }}>
      {msg}
    </div>
  );
}
