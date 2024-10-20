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
  // Add other fields as per your schema
}

interface PayloadWithIdUpdate {
  id: string;
  updateData: Partial<UsersSchema>;
}

export {
  User,
  LoginRequestBody,
  PayloadWithIdUpdate,
};
