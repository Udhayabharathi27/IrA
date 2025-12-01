import type { Express, Request, Response, NextFunction } from "express";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import argon2 from "argon2";
import { storage } from "./storage";
import passport from "./auth";
import rateLimit from "express-rate-limit";

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { error: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to check if user is authenticated
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

export function registerAuthRoutes(app: Express) {
  // Handle preflight OPTIONS requests for auth routes
  app.options("/api/auth/*", (_req, res) => {
    res.sendStatus(200);
  });

  // Register with email/password
  app.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await argon2.hash(validatedData.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        googleId: null, // Explicitly set to null for non-Google registrations
      });

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          // Still return success but without session
          const { password, ...userWithoutPassword } = user;
          return res.status(201).json({ 
            success: true,
            message: "Registration successful",
            user: userWithoutPassword 
          });
        }

        const { password, ...userWithoutPassword } = user;
        res.status(201).json({ 
          success: true,
          message: "Registration successful",
          user: userWithoutPassword 
        });
      });

    } catch (error: any) {
      if (error.name === "ZodError") {
        const firstError = error.errors[0];
        return res.status(400).json({ 
          error: firstError.message,
          field: firstError.path[0]
        });
      }
      
      res.status(500).json({ 
        error: "Registration failed",
        message: error.message 
      });
    }
  });

  // Login with email/password
  app.post("/api/auth/login", authLimiter, (req, res, next) => {
    try {
      loginUserSchema.parse(req.body);
    } catch (error: any) {
      return res.status(400).json({ error: error.errors[0].message });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return res.status(500).json({ error: "Authentication failed" });
      if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });

      req.login(user, (err) => {
        if (err) return res.status(500).json({ error: "Login failed" });
        const { password, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  // Google OAuth
  app.get("/api/auth/google", (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(503).json({ error: "Google OAuth is not configured" });
    }
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
  });

  app.get("/api/auth/google/callback", 
    passport.authenticate("google", { 
      failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login?error=google_auth_failed` 
    }),
    (req, res) => {
      // Successful authentication
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`);
    }
  );

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = req.user as any;
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ error: "Logout failed" });
      res.json({ message: "Logged out successfully" });
    });
  });
}