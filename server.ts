/**
 * Production server — serves the built frontend (dist/) and the Hono API.
 * Used by the Runable platform instead of the Vite dev server.
 */
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";
import app from "./src/api/index";

const server = new Hono();

// Permite embedding no iframe do Runable
server.use("*", async (c, next) => {
  await next();
  c.res.headers.delete("X-Frame-Options");
  c.res.headers.set("Content-Security-Policy", "frame-ancestors *");
});

// API routes
server.route("/", app);

// Static assets from dist/
server.use("*", serveStatic({ root: "./dist" }));

// SPA fallback
server.get("*", serveStatic({ path: "./dist/index.html" }));

const PORT = Number(process.env.PORT || 8080);

serve({ fetch: server.fetch, port: PORT }, () => {
  console.log(`✓ Digital Global running at http://localhost:${PORT}`);
});
