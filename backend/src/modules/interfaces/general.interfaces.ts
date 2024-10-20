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

export {
  PayloadWithData,
  PayloadWithIdData,
  PayloadWithIdDataBody,
  PayloadWithId,
}