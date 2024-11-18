import { Request, Router } from "express";
import handler from "../handlers/attendance";
import { routerEnclose, routerEncloseAuthentication } from "../../utils/routerEnclose";
import { authenticateAccessJWT } from "../../middleware/auth";
import { DecodedJWTObj } from "../interfaces/auth.interfaces";
import log from "../../config/log.config";

const attendanceRouter = Router();

const formatAuthenticateRequest = (req: Request) => {
  const accessToken: string | undefined = req.headers.authorization?.split(' ')[1];
  return {
    source: "express",
    payload: {
      accessToken: accessToken,
    }
  };
};

const formatCreateRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      createData: req.body,
      jwtData: req.body.data as DecodedJWTObj
    }
  };
};

const formatExportCSVRequest = (req: Request) => {
  let { date, from, to } = req.query;
  let dateNew, startDateNew, endDateNew = null;
  if (date) {
    dateNew = new Date(date as string);
  }
  if (from && to) {
    startDateNew = new Date(from as string);
    endDateNew = new Date(to as string);
  }
  log.info("attendance-route", "Date: " + dateNew + "\nStart Date: " + startDateNew + "\nEnd Date: " + endDateNew);
  return {
    source: "express",
    payload: {
      date: dateNew,
      startDate: startDateNew,
      endDate: endDateNew,
      jwtData: req.body.data as DecodedJWTObj
    }
  };
};

const formatGetAllAttendancesRequest = (req: Request) => {
  let { date, from, to } = req.query;
  let dateNew, startDateNew, endDateNew = null;
  if (date) {
    dateNew = new Date(date as string);
  }
  if (from && to) {
    startDateNew = new Date(from as string);
    endDateNew = new Date(to as string);
  }
  return {
    source: "express",
    payload: {
      date: dateNew,
      startDate: startDateNew,
      endDate: endDateNew,
      jwtData: req.body.data as DecodedJWTObj
    }
  };
};

const formatGetAttendanceByIdRequest = (req: Request) => {
  const { date } = req.query;
  let dateNew = null;
  if (date) {
    dateNew = new Date(date as string);
  }
  return {
    source: "express",
    payload: {
      id: req.params.id,
      date: dateNew,
      jwtData: req.body.data as DecodedJWTObj,
    }
  };
};

const formatUpdateAttendanceRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      id: req.params.id,
      updateData: req.body,
      jwtData: req.body.data
    }
  };
};

const formatDeleteAllAttendancesRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      jwtData: req.body.data as DecodedJWTObj
    }
  };
};

const formatDeleteAttendanceByIdRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      id: req.params.id,
      jwtData: req.body.data as DecodedJWTObj
    }
  };
};

attendanceRouter.post(
  "/",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.createAttendance, formatCreateRequest)
);

attendanceRouter.get(
  "/export",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.exportAttendanceToCSV, formatExportCSVRequest)
);

attendanceRouter.get(
  "/",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.getAttendances, formatGetAllAttendancesRequest)
);

attendanceRouter.get(
  "/:id",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.getAttendances, formatGetAttendanceByIdRequest)
);

// For update queries must add updatedAt field with current timestamp to update database
attendanceRouter.patch(
  "/:id",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.updateAttendance, formatUpdateAttendanceRequest)
);

attendanceRouter.delete(
  "/",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.deleteAttendances, formatDeleteAllAttendancesRequest)
);

attendanceRouter.delete(
  "/:id",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.deleteAttendances, formatDeleteAttendanceByIdRequest)
);

export default attendanceRouter;