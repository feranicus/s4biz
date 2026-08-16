import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The dev server's /api target. `python preview.py` sets these.
const TARGET = process.env.S4_API_TARGET || "http://localhost:8000";
const READONLY = process.env.S4_API_READONLY === "1";

// -------------------------------------------------------------------------------------------
// STRIP HTML COMMENTS FROM THE SHIPPED SHELL (production builds only).
//
// index.html is delivered to EVERY visitor, and view-source is a browser feature that cannot be
// turned off, so whatever is in that file is public by definition. The comments stay in the
// SOURCE, because explaining WHY is the whole point of them and the dev server still shows them.
// They are removed on the way into dist/ instead. `apply: "build"` keeps that split honest.
//
// Deliberately NOT touched: <script type="application/ld+json"> is an element, not a comment, so
// the structured data that earns the rich search result survives. Asserted by shipped_shell.mjs.
// -------------------------------------------------------------------------------------------
const stripHtmlComments = {
  name: "strip-html-comments",
  apply: "build",
  transformIndexHtml(html) {
    return html.replace(/<!--[\s\S]*?-->/g, "").replace(/\n{3,}/g, "\n\n");
  },
};

export default defineConfig({
  base: "/",
  plugins: [react(), stripHtmlComments],
  server: {
    port: Number(process.env.S4_PORT || 5174),
    host: true, // also serve on the LAN, so the page can be opened on a phone
    proxy: {
      "/api": {
        target: TARGET,
        changeOrigin: true,
        secure: true,
        // ------------------------------------------------------------------------------------
        // READ-ONLY GUARD. When the preview points at the LIVE site so the public pages have
        // real data, a local page must not be able to CHANGE anything up there. GET and HEAD
        // pass; everything else is refused HERE, before it leaves the machine, and says why.
        // Refusing locally rather than relying on the server's auth is deliberate: the browser
        // may still hold a valid session cookie for the live site.
        // ------------------------------------------------------------------------------------
        configure: (proxy) => {
          if (!READONLY) return;
          proxy.on("proxyReq", (proxyReq, req, res) => {
            const m = (req.method || "GET").toUpperCase();
            if (m === "GET" || m === "HEAD") return;
            proxyReq.destroy();
            res.writeHead(405, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({
                error: "blocked by the local preview",
                detail:
                  `${m} ${req.url} was not sent. The preview proxies /api to ${TARGET} in ` +
                  "READ-ONLY mode so a local page cannot send a real enquiry or change anything " +
                  "on the live site. Read-only pages work; anything that writes does not.",
              })
            );
          });
        },
      },
    },
  },
  build: { outDir: "dist" },
});
