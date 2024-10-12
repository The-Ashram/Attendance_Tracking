import { UsersSchema } from "../../db/schema/users.schema";
import { JwtPayload } from "jsonwebtoken";

// backend/src/modules/interfaces/users.interfaces.ts
export interface LoginRequestBody {
  email: string;
  password: string;
}

// types/User.ts
export interface User {
  id: string;
  username: string;
  email: string;
  // Add other fields as per your schema
}
interface PayloadWithData {
  data: JwtPayload;
}

interface PayloadWithIdData {
  id: string;
  data: JwtPayload;
}

interface PayloadWithIdDataBody {
  id: string;
  data: JwtPayload;
  body: object;
}

interface PayloadWithId {
  id: string;
}

interface PayloadWithIdUpdate {
  id: string;
  updateData: Partial<UsersSchema>;
}

export {
  PayloadWithData,
  PayloadWithIdData,
  PayloadWithIdDataBody,
  PayloadWithId,
  PayloadWithIdUpdate,
};
