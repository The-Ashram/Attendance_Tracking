import { JwtPayload } from "jsonwebtoken";
import { UsersSchema } from "../../db/schema/users.schema";

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

export interface PayloadWithDataCreateBody {
  jwtData: JwtPayload;
  createData: UsersSchema;
}
