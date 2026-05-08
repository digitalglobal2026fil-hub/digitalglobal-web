import { Hono } from 'hono';
import { cors } from "hono/cors";
import { eq, and } from "drizzle-orm";
import { leads, accessCodes, otpCodes } from "./database/schema";
import { db, client } from "./database/index";

// Envia email via Resend
async function sendEmail(opts: { to: string; subject: string; html: string; url?: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.warn("[email] RESEND_API_KEY em falta"); return; }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Digital Global <onboarding@resend.dev>",
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      }),
    });
    const data = await res.json() as any;
    if (!res.ok) console.error("[email] Resend erro:", data);
    else console.log("[email] Enviado para", opts.to, "id:", data.id);
  } catch (err) {
    console.error("[email] Falha:", err);
  }
}

const app = new Hono().basePath('api');
app.use(cors({ origin: "*" }));

app.get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }));

// ─────────────────────────────────────────────
// WEBHOOK HOTMART
// POST /api/hotmart/webhook
// ─────────────────────────────────────────────
app.post('/hotmart/webhook', async (c) => {
  try {
    const body = await c.req.json();

    const event = body?.event || body?.data?.purchase?.status || "";
    const buyerEmail = body?.data?.buyer?.email || body?.buyer?.email;
    const buyerName  = body?.data?.buyer?.name  || body?.buyer?.name || "";
    const orderId    = body?.data?.purchase?.transaction || body?.id || "";

    if (!buyerEmail) return c.json({ error: "Email não encontrado" }, 400);

    const approvedEvents = ["PURCHASE_APPROVED", "PURCHASE_COMPLETE", "APPROVED"];
    const isApproved = approvedEvents.some(e =>
      String(event).toUpperCase().includes(e)
    );
    if (!isApproved) return c.json({ status: "ignored", event });

    const code = generateCode();

    await db.insert(accessCodes).values({
      code,
      email: buyerEmail.toLowerCase(),
      name: buyerName,
      hotmartOrderId: String(orderId),
      used: false,
      createdAt: new Date().toISOString(),
    });

    const firstName = buyerName.split(" ")[0] || "Olá";
    await sendEmail({ url: process.env.RUNABLE_URL || "http://localhost:8080",
      to: buyerEmail,
      subject: "O teu acesso à Digital Global está aqui 🎯",
      html: buildAccessEmail(firstName, code),
    });

    return c.json({ success: true, code });
  } catch (err) {
    console.error("Hotmart webhook error:", err);
    return c.json({ error: "Erro interno" }, 500);
  }
});

// ─────────────────────────────────────────────
// PASSO 1 — Valida código XXXX-XXXX e envia OTP
// POST /api/access/request-otp
// ─────────────────────────────────────────────
app.post('/access/request-otp', async (c) => {
  try {
    const { code } = await c.req.json();
    if (!code) return c.json({ success: false, error: "Código em falta" }, 400);

    const result = await db.select()
      .from(accessCodes)
      .where(eq(accessCodes.code, code.toUpperCase().trim()))
      .limit(1);

    if (!result.length) {
      return c.json({ success: false, error: "Código inválido. Verifica o email que recebeste após a compra." });
    }

    const record = result[0];
    const isAdmin = record.code === 'DIGI-GLOB';

    if (record.used && !isAdmin) {
      return c.json({ success: false, error: "Este código já foi utilizado." });
    }

    if (isAdmin && record.used) {
      await db.update(accessCodes)
        .set({ used: false, usedAt: null })
        .where(eq(accessCodes.code, 'DIGI-GLOB'));
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.delete(otpCodes).where(eq(otpCodes.accessCode, code.toUpperCase().trim()));

    await db.insert(otpCodes).values({
      accessCode: code.toUpperCase().trim(),
      email: record.email,
      otp,
      verified: false,
      expiresAt,
      createdAt: new Date().toISOString(),
    });

    const firstName = (record.name || "").split(" ")[0] || "Olá";
    const maskedEmail = maskEmail(record.email);

    await sendEmail({ url: process.env.RUNABLE_URL || "http://localhost:8080",
      to: record.email,
      subject: `${otp} — O teu código de confirmação Digital Global`,
      html: buildOTPEmail(firstName, otp),
    });

    return c.json({ success: true, maskedEmail });
  } catch (err) {
    console.error(err);
    return c.json({ success: false, error: "Erro interno" }, 500);
  }
});

// ─────────────────────────────────────────────
// PASSO 2 — Verifica OTP e dá acesso
// POST /api/access/verify-otp
// ─────────────────────────────────────────────
app.post('/access/verify-otp', async (c) => {
  try {
    const { code, otp } = await c.req.json();
    if (!code || !otp) return c.json({ valid: false, error: "Dados em falta" }, 400);

    const result = await db.select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.accessCode, code.toUpperCase().trim()),
          eq(otpCodes.otp, otp.trim()),
          eq(otpCodes.verified, false)
        )
      )
      .limit(1);

    if (!result.length) {
      return c.json({ valid: false, error: "Código incorreto. Tenta novamente." });
    }

    const otpRecord = result[0];

    if (new Date() > new Date(otpRecord.expiresAt)) {
      return c.json({ valid: false, error: "Código expirado. Volta atrás e tenta novamente." });
    }

    await db.update(otpCodes)
      .set({ verified: true })
      .where(eq(otpCodes.id, otpRecord.id));

    const isAdmin = code.toUpperCase().trim() === 'DIGI-GLOB';
    if (!isAdmin) {
      await db.update(accessCodes)
        .set({ used: true, usedAt: new Date().toISOString() })
        .where(eq(accessCodes.code, code.toUpperCase().trim()));
    }

    const accessRecord = await db.select()
      .from(accessCodes)
      .where(eq(accessCodes.code, code.toUpperCase().trim()))
      .limit(1);

    const user = accessRecord[0];

    return c.json({ valid: true, name: user?.name || "", email: user?.email || "" });
  } catch (err) {
    console.error(err);
    return c.json({ valid: false, error: "Erro interno" }, 500);
  }
});

// ─────────────────────────────────────────────
// GUARDAR LEAD
// POST /api/lead
// ─────────────────────────────────────────────
app.post('/lead', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, instagram, answers, accessCode } = body;
    if (!name || !email) return c.json({ error: "Nome e email obrigatórios" }, 400);

    const profile = calculateProfile(answers || []);

    await db.insert(leads).values({
      name, email,
      instagram: instagram || null,
      answers: JSON.stringify(answers || []),
      profile,
      accessCode: accessCode || null,
      createdAt: new Date().toISOString(),
    });

    const firstName = name.split(" ")[0];
    await sendEmail({ url: process.env.RUNABLE_URL || "http://localhost:8080",
      to: email,
      subject: `${firstName}, o teu diagnóstico Digital Global está aqui 🎯`,
      html: buildDiagnosisEmail(firstName, profile),
    });

    return c.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Erro interno" }, 500);
  }
});

// ─────────────────────────────────────────────
// DEBUG — apenas para desenvolvimento local
// ─────────────────────────────────────────────
app.get('/debug/otp', async (c) => {
  if (process.env.NODE_ENV === 'production') return c.json({ error: "Não disponível em produção" }, 403);

  const code = c.req.query("code");
  if (!code) return c.json({ error: "?code= obrigatório" }, 400);

  const result = await db.select()
    .from(otpCodes)
    .where(eq(otpCodes.accessCode, code.toUpperCase().trim()))
    .limit(1);

  if (!result.length) return c.json({ error: "Nenhum OTP encontrado para este código" });

  const rec = result[0];
  return c.json({
    otp: rec.otp,
    email: rec.email,
    expiresAt: rec.expiresAt,
    verified: rec.verified,
    expired: new Date() > new Date(rec.expiresAt),
  });
});

app.post('/debug/reset-admin', async (c) => {
  if (process.env.NODE_ENV === 'production') return c.json({ error: "Não disponível em produção" }, 403);

  await db.update(accessCodes)
    .set({ used: false, usedAt: null })
    .where(eq(accessCodes.code, 'DIGI-GLOB'));
  await db.delete(otpCodes).where(eq(otpCodes.accessCode, 'DIGI-GLOB'));

  return c.json({ success: true, message: "DIGI-GLOB resetado para testes" });
});

// ─────────────────────────────────────────────
// SETUP — insere código admin
// POST /api/setup/admin?secret=XXXX
// ─────────────────────────────────────────────
app.post('/setup/admin', async (c) => {
  const secret = process.env.HOTMART_SECRET;
  if (!secret || c.req.query("secret") !== secret) return c.json({ error: "Não autorizado" }, 401);

  try {
    // Cria tabelas se não existirem
    await client.executeMultiple(`
      CREATE TABLE IF NOT EXISTS access_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        name TEXT,
        hotmart_order_id TEXT,
        used INTEGER NOT NULL DEFAULT 0,
        used_at TEXT,
        expires_at TEXT,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        instagram TEXT,
        answers TEXT NOT NULL DEFAULT '[]',
        profile TEXT,
        access_code TEXT,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        access_code TEXT NOT NULL,
        email TEXT NOT NULL,
        otp TEXT NOT NULL,
        verified INTEGER NOT NULL DEFAULT 0,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);
    // Insere código admin
    await client.execute({
      sql: `INSERT OR IGNORE INTO access_codes (code, email, name, hotmart_order_id, used, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      args: ['DIGI-GLOB', 'digitalglobal2026fil@gmail.com', 'Admin Digital Global', null, 0, new Date().toISOString()]
    });
    return c.json({ success: true, message: "DIGI-GLOB inserido com sucesso" });
  } catch (err: any) {
    return c.json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────
app.get('/admin/leads', async (c) => {
  const secret = process.env.HOTMART_SECRET;
  if (!secret || c.req.query("secret") !== secret) return c.json({ error: "Não autorizado" }, 401);
  return c.json({ leads: await db.select().from(leads) });
});

app.get('/admin/codes', async (c) => {
  const secret = process.env.HOTMART_SECRET;
  if (!secret || c.req.query("secret") !== secret) return c.json({ error: "Não autorizado" }, 401);
  return c.json({ codes: await db.select().from(accessCodes) });
});

export type AppType = typeof app;
export default app;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  const masked = user.slice(0, 2) + "***";
  return `${masked}@${domain}`;
}

function calculateProfile(answers: { questionId: number; answer: string }[]): string {
  const map: Record<string, string> = {};
  answers.forEach((a) => { map[String(a.questionId)] = a.answer; });
  let score = 0;
  if (map["1"] === "diario") score += 20; else if (map["1"] === "regular") score += 15; else if (map["1"] === "irregular") score += 8; else score += 2;
  if (map["2"] === "claro") score += 20; else if (map["2"] === "vago") score += 12; else if (map["2"] === "geral") score += 6; else score += 2;
  if (map["3"] === "crescendo") score += 20; else if (map["3"] === "estavel") score += 13; else if (map["3"] === "variavel") score += 8; else score += 3;
  if (map["4"] === "estruturado") score += 20; else if (map["4"] === "semi") score += 13; else if (map["4"] === "espontaneo") score += 7; else score += 4;
  if (map["6"] === "analiso_sempre") score += 20; else if (map["6"] === "vejo_as_vezes") score += 12; else if (map["6"] === "ocasional") score += 6; else score += 1;
  if (score >= 80) return "alto-impacto";
  if (score >= 55) return "em-desenvolvimento";
  return "em-recomeco";
}

function buildAccessEmail(firstName: string, code: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center"><table style="max-width:560px;width:100%;">
<tr><td style="padding-bottom:28px;text-align:center;">
  <span style="font-size:20px;font-weight:900;color:#fff;">Digital <span style="color:#FF6B00;">Global</span></span>
</td></tr>
<tr><td style="background:#111;border:1px solid rgba(255,107,0,0.25);border-radius:16px;padding:36px 32px;">
  <h1 style="font-size:24px;font-weight:800;color:#fff;margin:0 0 12px;">Olá, ${firstName}! 👋</h1>
  <p style="color:#aaa;font-size:15px;line-height:1.7;margin:0 0 24px;">
    O teu acesso ao <strong style="color:#fff;">Conteúdo que Converte</strong> está pronto.<br>
    Usa o código abaixo para entrar na plataforma.
  </p>
  <div style="background:#0A0A0A;border:2px solid #FF6B00;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
    <p style="color:#888;font-size:11px;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.1em;">Código de acesso</p>
    <p style="font-size:32px;font-weight:900;color:#FF6B00;margin:0;letter-spacing:0.15em;font-family:'Courier New',monospace;">${code}</p>
  </div>
  <div style="text-align:center;">
    <a href="${process.env.WEBSITE_URL || ''}" style="display:inline-block;background:#FF6B00;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">
      Entrar agora →
    </a>
  </div>
</td></tr>
<tr><td style="padding-top:20px;text-align:center;">
  <p style="color:#2a2a2a;font-size:12px;margin:0;">© 2026 Digital Global</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

function buildOTPEmail(firstName: string, otp: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center"><table style="max-width:560px;width:100%;">
<tr><td style="padding-bottom:28px;text-align:center;">
  <span style="font-size:20px;font-weight:900;color:#fff;">Digital <span style="color:#FF6B00;">Global</span></span>
</td></tr>
<tr><td style="background:#111;border:1px solid rgba(255,107,0,0.25);border-radius:16px;padding:36px 32px;text-align:center;">
  <div style="font-size:44px;margin-bottom:16px;">🔐</div>
  <h1 style="font-size:22px;font-weight:800;color:#fff;margin:0 0 8px;">Confirmação de acesso</h1>
  <p style="color:#aaa;font-size:14px;margin:0 0 28px;">Olá ${firstName}, introduz este código para confirmar a tua identidade:</p>
  <div style="background:#0A0A0A;border:2px solid #FF6B00;border-radius:14px;padding:28px;margin-bottom:24px;display:inline-block;min-width:220px;">
    <p style="color:#888;font-size:11px;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.12em;">Código de confirmação</p>
    <p style="font-size:42px;font-weight:900;color:#FF6B00;margin:0;letter-spacing:0.2em;font-family:'Courier New',monospace;">${otp}</p>
    <p style="color:#555;font-size:12px;margin:10px 0 0;">Válido durante 10 minutos</p>
  </div>
  <p style="color:#555;font-size:13px;margin:0;">Se não foste tu, ignora este email.</p>
</td></tr>
<tr><td style="padding-top:20px;text-align:center;">
  <p style="color:#2a2a2a;font-size:12px;margin:0;">© 2026 Digital Global</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}

function buildDiagnosisEmail(firstName: string, profile: string): string {
  const profiles: Record<string, { title: string; color: string; icon: string }> = {
    "alto-impacto": { title: "Criador de Alto Impacto", color: "#22c55e", icon: "🚀" },
    "em-desenvolvimento": { title: "Criador em Desenvolvimento", color: "#FF6B00", icon: "⚡" },
    "em-recomeco": { title: "Criador em Recomeço", color: "#a855f7", icon: "🌱" },
  };
  const p = profiles[profile] || profiles["em-desenvolvimento"];
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center"><table style="max-width:560px;width:100%;">
<tr><td style="padding-bottom:28px;text-align:center;">
  <span style="font-size:20px;font-weight:900;color:#fff;">Digital <span style="color:#FF6B00;">Global</span></span>
</td></tr>
<tr><td style="background:#111;border:1px solid rgba(255,107,0,0.2);border-radius:16px;padding:36px 32px;text-align:center;">
  <div style="font-size:44px;margin-bottom:12px;">${p.icon}</div>
  <h1 style="font-size:22px;font-weight:800;color:${p.color};margin:0 0 8px;">${p.title}</h1>
  <p style="color:#888;font-size:13px;margin:0 0 20px;">O teu perfil de criador</p>
  <p style="color:#aaa;font-size:15px;line-height:1.7;margin:0 0 28px;">
    <strong style="color:#fff;">${firstName}</strong>, o teu diagnóstico está completo.<br>
    Volta à plataforma para ver o teu plano de ação personalizado.
  </p>
  <a href="${process.env.WEBSITE_URL || ''}" style="display:inline-block;background:#FF6B00;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;text-decoration:none;">
    Ver o meu plano →
  </a>
</td></tr>
<tr><td style="padding-top:20px;text-align:center;">
  <p style="color:#2a2a2a;font-size:12px;margin:0;">© 2026 Digital Global</p>
</td></tr>
</table></td></tr></table>
</body></html>`;
}
