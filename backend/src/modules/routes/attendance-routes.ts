import { Request, Router } from "express";
import handler from "../handlers/attendance";
import { routerEnclose, routerEncloseAuthentication } from "../../utils/routerEnclose";
import { authenticateAccessJWT } from "../../middleware/auth";
import { DecodedJWTObj } from "../interfaces/auth.interfaces";
import { Payload } from "aws-sdk/clients/iotdata";
import { PayloadWithIdDataBody } from "../interfaces/general.interfaces";

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
      jwtData: req.body.data
    }
  };
};

const formatGetAllAttendancesRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      data: req.body.data as DecodedJWTObj
    }
  };
};

const formatGetAttendanceByIdRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      id: req.params.id,
      data: req.body.data as DecodedJWTObj,
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
      data: req.body.data as DecodedJWTObj
    }
  };
};

const formatDeleteAttendanceByIdRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      id: req.params.id,
      data: req.body.data as DecodedJWTObj
    }
  };
};

attendanceRouter.post(
  "/create",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.createAttendance, formatCreateRequest)
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