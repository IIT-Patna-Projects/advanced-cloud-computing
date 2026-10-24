/**
 * ShopScale Frontend Server.
 *
 * Serves static assets, exposes /healthz readiness endpoint, and
 * reverse-proxies /api/* requests to the FastAPI backend service.
 */

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});

// Operational health endpoint
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "frontend",
    timestamp: new Date().toISOString()
  });
});

// Reverse proxy: /api/* -> BACKEND_URL/*
app.use(
  "/api",
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api": ""
    },
    onError: (err, req, res) => {
      res.status(502).json({
        error: "Bad Gateway",
        message: "Backend service unreachable"
      });
    }
  })
);

// Serve static frontend assets
app.use(express.static(path.join(__dirname, "public")));

// Fallback error handler masking internal stack traces
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({
    error: "Internal Server Error"
  });
});

app.listen(PORT, () => {
  console.log(`Frontend server listening on port ${PORT}`);
});

export default app;
