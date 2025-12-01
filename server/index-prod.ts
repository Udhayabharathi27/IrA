import fs from "node:fs";
import path from "node:path";
import { createServer, type Server } from "node:http";

import express, { type Express } from "express";
import runApp from "./app";

// Static file serving for production
export async function serveStatic(app: Express, _server: Server) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    console.error("PUBLIC folder not found:", distPath);
    console.error("Build your frontend before starting the server.");
    return;
  }

  console.log("Serving static files from:", distPath);

  // Serve static assets
  app.use(express.static(distPath));

  // Fallback for SPA routing
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

(async () => {
  try {
    // Start the express app (middleware, routes, auth, all setup)
    const app = await runApp();

    // Create the HTTP server
    const server = createServer(app);

    // Setup static file serving
    await serveStatic(app, server);

    // Start server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Production server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start production server:", err);
    process.exit(1);
  }
})();
