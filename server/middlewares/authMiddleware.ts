import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}


export const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Unauthorized" });

  const token = auth.split(" ")[1];
  const jwt_secret = process.env.JWT_SECRET;
  try {
    req.user = jwt.verify(token, jwt_secret);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid Token" });
  }
};

