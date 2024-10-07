import { UsersSchema } from "db/schema/users.schema";
import { JwtPayload } from "jsonwebtoken";

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
  PayloadWithIdUpdate
}