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

export {
  PayloadWithIdUpdate,
  PayloadWithDataCreateBody,
}