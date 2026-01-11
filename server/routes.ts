import type { Express, Request, Response } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

const RAILWAY_API_URL = "https://price-production-c1cb.up.railway.app";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth BEFORE other routes
  await setupAuth(app);
  registerAuthRoutes(app);

  // Forward all /api requests to Railway backend (except auth routes which are handled above)
  app.all("/api/*", async (req: Request, res: Response) => {
    // Skip if it's an auth route (already handled by Replit Auth)
    if (req.path.startsWith("/api/login") || 
        req.path.startsWith("/api/logout") || 
        req.path.startsWith("/api/callback") ||
        req.path.startsWith("/api/auth")) {
      return;
    }
    try {
      const targetPath = req.originalUrl;
      const targetUrl = `${RAILWAY_API_URL}${targetPath}`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Forward cookies
      if (req.headers.cookie) {
        headers["Cookie"] = req.headers.cookie;
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers,
      };

      // Add body for POST/PUT/PATCH requests
      if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      const response = await fetch(targetUrl, fetchOptions);

      // Forward response headers
      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        // Modify cookie for local development
        const modifiedCookie = setCookieHeader
          .replace(/;\s*Secure/gi, "")
          .replace(/;\s*Domain=[^;]*/gi, "")
          .replace(/;\s*SameSite=[^;]*/gi, "; SameSite=Lax");
        res.setHeader("Set-Cookie", modifiedCookie);
      }

      // Get response body
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        res.status(response.status).send(text);
      }
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Proxy request failed" });
    }
  });

  // Forward logout endpoint
  app.all("/logout", async (req: Request, res: Response) => {
    try {
      const targetUrl = `${RAILWAY_API_URL}/logout`;

      const headers: HeadersInit = {};
      if (req.headers.cookie) {
        headers["Cookie"] = req.headers.cookie;
      }

      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
      });

      const setCookieHeader = response.headers.get("set-cookie");
      if (setCookieHeader) {
        res.setHeader("Set-Cookie", setCookieHeader);
      }

      if (response.headers.get("content-type")?.includes("application/json")) {
        const data = await response.json();
        res.status(response.status).json(data);
      } else {
        const text = await response.text();
        res.status(response.status).send(text);
      }
    } catch (error) {
      console.error("Logout proxy error:", error);
      res.status(500).json({ error: "Logout request failed" });
    }
  });

  return httpServer;
}
