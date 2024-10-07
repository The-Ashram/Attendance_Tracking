import { users } from "../../db/schema/users.schema";

declare global {
  namespace Express {
    interface Request {
      user?: Users;
    }
  }
}
