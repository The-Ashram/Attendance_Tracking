import handler from "../handlers/logs";
import { Request, Router } from "express";
import { DecodedJWTObj } from "../interfaces/auth.interfaces";
import { routerEnclose, routerEncloseAuthentication } from "../../utils/routerEnclose";
import { authenticateAccessJWT } from "../../middleware/auth";
import log from "../../config/log.config";

const logRouter = Router();

const NAMESPACE = 'log-route'

const formatAuthenticateRequest = (req: Request) => {
  const accessToken: string | undefined = req.headers.authorization?.split(' ')[1];
  return {
    source: "express",
    payload: {
      accessToken: accessToken,
    }
  }
};
const formatExportLogsToCSV = (req: Request) => {
  let { date, from, to } = req.query;
  let dateNew, startDateNew, endDateNew = null;
  if (date) {
    dateNew = new Date(date as string);
  }
  if (from && to) {
    startDateNew = new Date(from as string);
    endDateNew = new Date(to as string);
  }
  log.info(NAMESPACE, "Date: " + dateNew + "\nStart Date: " + startDateNew + "\nEnd Date: " + endDateNew);
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

logRouter.get("/export",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.exportLogsToCSV, formatExportLogsToCSV)
);

export default logRouter;