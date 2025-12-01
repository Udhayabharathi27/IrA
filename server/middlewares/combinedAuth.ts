import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Accepts either a Passport session (req.isAuthenticated())
 * OR an Authorization: Bearer <jwt> header.
 */
export const combinedAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // 1) Passport session (browser)
    if (typeof (req as any).isAuthenticated === "function" && (req as any).isAuthenticated()) {
      // Passport attaches user on req.user already
      return next();
    }

    // 2) JWT token (mobile)
    const authHeader = req.headers.authorization || req.headers.Authorization as string | undefined;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const secret = process.env.JWT_SECRET as string;
        const decoded = jwt.verify(token, secret);
        // attach decoded user payload to req.user so controllers can use it
        req.user = decoded;
        return next();
      } catch (err) {
        console.log("combinedAuth: invalid token", err);
        return res.status(401).json({ message: "Unauthorized - Invalid token" });
      }
    }

    // Nothing matched
    return res.status(401).json({ message: "Unauthorized - Please log in to access this resource" });
  } catch (err: any) {
    console.error("combinedAuth error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
