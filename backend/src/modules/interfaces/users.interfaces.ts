import { JwtPayload } from "jsonwebtoken";
import { UsersSchema } from "../../db/schema/users.schema";

// backend/src/modules/interfaces/users.interfaces.ts
interface LoginRequestBody {
  email: string;
  password: string;
}

// types/User.ts
interface User {
  id: string;
  username: string;
  email: string;
}

interface PayloadWithIdUpdate {
  id: string;
  updateData: Partial<UsersSchema>;
  jwtData: JwtPayload; 
}

interface PayloadWithIdData {
  id: string;
  jwtData: JwtPayload;
}

export {
  User,
  LoginRequestBody,
  PayloadWithIdUpdate,
  PayloadWithIdData
}
