import { JwtPayload } from "jsonwebtoken";

type roles = "admin" | "user";

export interface DecodedJWTObj extends JwtPayload {
  id: string;
  name: string;
  email: string;
  role: roles;
  iat: number;
  exp: number;
  iss: string;
}

export interface extractJWTReq {
  accessToken?: string | undefined;
  refreshToken: string | undefined;
}
