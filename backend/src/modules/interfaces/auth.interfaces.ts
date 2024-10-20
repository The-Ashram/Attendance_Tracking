import { JwtPayload } from "jsonwebtoken";

type Roles = "admin" | "user" | "resident";

export interface DecodedJWTObj extends JwtPayload {
  id: string;
  name: string;
  email: string;
  role: Roles;
  iat: number;
  exp: number;
  iss: string;
}

export interface extractJWTReq {
  accessToken?: string | undefined;
  refreshToken: string | undefined;
}
