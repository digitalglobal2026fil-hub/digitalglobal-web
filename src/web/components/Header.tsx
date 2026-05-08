import type { Lang } from "../i18n";

interface HeaderProps {
  lang: Lang;
  onLangChange: (l: Lang) => void;
}

export default function Header({ lang, onLangChange }: HeaderProps) {
  const langs: { code: Lang; flag: string; label: string }[] = [
    { code: "pt", flag: "🇵🇹", label: "PT" },
    { code: "es", flag: "🇪🇸", label: "ES" },
    { code: "en", flag: "🇬🇧", label: "EN" },
  ];

  const isMobile = typeof window !== "undefined" && window.innerWidth < 480;

  return (
    <header style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 100,
      background: "rgba(10,10,10,0.92)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(255,107,0,0.12)",
      padding: "0 24px",
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      {/* Logo + Nome */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <img
          src="/logo.png"
          alt="Digital Global"
          style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }}
          onError={(e) => {
            // fallback se logo não carregar
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: 17,
          color: "#fff",
          letterSpacing: "-0.02em",
        }}>
          Digital <span style={{ color: "#FF6B00" }}>Global</span>
        </span>
      </div>

      {/* Seletor de idioma */}
      <div style={{ display: "flex", gap: 3 }}>
        {langs.map((l) => (
          <button
            key={l.code}
            onClick={() => onLangChange(l.code)}
            title={l.label}
            style={{
              background: lang === l.code ? "rgba(255,107,0,0.15)" : "transparent",
              border: lang === l.code ? "1px solid rgba(255,107,0,0.4)" : "1px solid transparent",
              borderRadius: 6,
              color: lang === l.code ? "#FF6B00" : "#555",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 6px",
              display: "flex",
              alignItems: "center",
              gap: 3,
              transition: "all 0.15s ease",
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 14 }}>{l.flag}</span>
            <span style={{ display: isMobile ? "none" : "inline" }}>{l.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
