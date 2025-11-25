// server/app.ts
import express, {
  type Request,
  type Response,
  type NextFunction,
  type Express,
} from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import consignmentPdfRouter from "./routes/consignment-pdf.route";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export default async function runApp(): Promise<Express> {
  const app = express();

  // ------------------------------------
  // CORS
  // ------------------------------------
  app.use(
    cors({
      origin: "http://localhost:3000", // your client
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // ------------------------------------
  // JSON parsing
  // ------------------------------------
  app.use(
    express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: false }));

  // ------------------------------------
  // Logging middleware
  // ------------------------------------
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const path = req.path;

    let capturedJsonResponse: Record<string, any> | undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.call(this, bodyJson, ...args);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";

        log(logLine);
      }
    });

    next();
  });

  // ------------------------------------
  // Routes
  // ------------------------------------
  await registerRoutes(app);
  app.use("/api/consignments", consignmentPdfRouter);

  // ------------------------------------
  // Error handler
  // ------------------------------------
  app.use(
    (err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      log(message, "error");
    }
  );

  return app;
}
