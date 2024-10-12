// middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../modules/interfaces/users.interfaces";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ message: "Invalid token" });
    return;
  }

  (req as any).user = decoded as User;
  next();
  next();
};
