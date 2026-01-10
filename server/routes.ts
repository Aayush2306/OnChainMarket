import type { Express } from "express";
import type { Server } from "http";
import { createProxyMiddleware, type Options } from "http-proxy-middleware";
import type { IncomingMessage, ServerResponse, ClientRequest } from "http";

const RAILWAY_API_URL = "https://price-production-c1cb.up.railway.app";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const proxyOptions: Options = {
    target: RAILWAY_API_URL,
    changeOrigin: true,
    cookieDomainRewrite: "",
    on: {
      proxyReq: (proxyReq: ClientRequest, req: IncomingMessage) => {
        // Forward cookies from the original request
        const cookie = req.headers.cookie;
        if (cookie) {
          proxyReq.setHeader("Cookie", cookie);
        }
      },
      proxyRes: (proxyRes: IncomingMessage) => {
        // Handle cookies from Railway backend
        const cookies = proxyRes.headers["set-cookie"];
        if (cookies) {
          // Remove secure flag and domain for local development
          const modifiedCookies = cookies.map((cookie: string) => {
            return cookie
              .replace(/;\s*Secure/gi, "")
              .replace(/;\s*Domain=[^;]*/gi, "")
              .replace(/;\s*SameSite=[^;]*/gi, "; SameSite=Lax");
          });
          proxyRes.headers["set-cookie"] = modifiedCookies;
        }
      },
    },
  };

  // Proxy all /api requests to the Railway backend
  app.use("/api", createProxyMiddleware(proxyOptions));

  // Proxy logout endpoint
  app.use("/logout", createProxyMiddleware({
    target: RAILWAY_API_URL,
    changeOrigin: true,
    cookieDomainRewrite: "",
  }));

  return httpServer;
}
