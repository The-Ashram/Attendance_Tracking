// utils/jwt.ts
import jwt, { JwtPayload } from "jsonwebtoken";

const secret = "your-secret-key"; // Use environment variable for production

export const generateToken = (payload: object): string => {
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};

const isJwtPayload = (payload: string | JwtPayload): payload is JwtPayload => {
  return (payload as JwtPayload).exp !== undefined;
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, secret);
    if (isJwtPayload(decoded)) {
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
};
