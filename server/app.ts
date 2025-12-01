// server/app.ts
import express, {
  type Request,
  type Response,
  type NextFunction,
  type Express,
} from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import jwt from "jsonwebtoken";
import { registerRoutes } from "./routes";
import { registerAuthRoutes } from "./auth-routes";
import consignmentPdfRouter from "./routes/consignment-pdf.route";
import passport from "./auth";
import { pool } from "./db/connection";
import authRoutes from "./routes/authRoutes";

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
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://lr-consignment-client.s3-website-ap-southeast-1.amazonaws.com/",
  ];
  app.use(
    cors({
      origin: allowedOrigins,
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
  // Session configuration
  // ------------------------------------
  const PgSession = connectPgSimple(session);
  app.use(
    session({
      store: new PgSession({
        pool,
        createTableIfMissing: true,
        tableName: 'session',
      }),
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
    })
  );

  // ------------------------------------
  // Passport authentication
  // ------------------------------------
  app.use(passport.initialize());
  app.use(passport.session());

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
  // Public routes (no authentication required)
  // ------------------------------------
  
  // Register all auth routes including OTP endpoints
  app.use("/api/auth", authRoutes); // This will handle /api/auth/login, /api/auth/send-otp, /api/auth/verify-otp
  
  // Also register other auth routes if needed
  registerAuthRoutes(app);

  // ------------------------------------
  // JWT Authentication middleware for protected routes
  // ------------------------------------
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip auth for public routes
    if (
      req.path.startsWith("/api/auth/") ||
      req.path === "/" ||
      req.path === "/health"
    ) {
      return next();
    }

    // Require JWT authentication for all other API routes
    if (req.path.startsWith("/api/")) {
      const authHeader = req.headers.authorization;
      
      console.log("🛡️ JWT Auth Check - URL:", req.path);
      console.log("🛡️ Auth Header:", authHeader);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("❌ No Bearer token found");
        return res.status(401).json({ 
          message: "Authorization header with Bearer token required" 
        });
      }

      const token = authHeader.split(' ')[1];
      console.log("🔑 Token received, length:", token.length);
      
      try {
        const user = jwt.verify(token, process.env.JWT_SECRET as string);
        console.log("✅ JWT Token verified - User ID:", user.id);
        (req as any).user = user;
        return next();
      } catch (err: any) {
        console.log("❌ JWT verification failed:", err.message);
        return res.status(401).json({ 
          message: "Invalid or expired token - Please log in again" 
        });
      }
    }

    next();
  });

  // ------------------------------------
  // Protected Routes
  // ------------------------------------
  await registerRoutes(app);
  app.use("/api/consignments", consignmentPdfRouter);

  // ------------------------------------
  // Health check route
  // ------------------------------------
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

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