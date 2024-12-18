import { JwtPayload } from "jsonwebtoken";

interface PayloadWithIdDataDate {
  id: string;
  date: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  jwtData: JwtPayload;
}

export {
  PayloadWithIdDataDate,
}