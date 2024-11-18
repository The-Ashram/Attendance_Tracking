import { AttendanceSchema } from "../../db/schema/attendance.schema";
import { JwtPayload } from "jsonwebtoken";


interface PayloadWithIdUpdate {
  id: string;
  jwtData: JwtPayload;
  updateData: Partial<AttendanceSchema>;
}

interface PayloadWithDataCreateBody {
  jwtData: JwtPayload;
  createData: AttendanceSchema;
}

interface PayloadWithIdData {
  id: string;
  jwtData: JwtPayload;
}

interface PayloadWithIdDataDate {
  id: string;
  date: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  jwtData: JwtPayload;

}

export {
  PayloadWithIdUpdate,
  PayloadWithDataCreateBody,
  PayloadWithIdDataDate,
  PayloadWithIdData,
}