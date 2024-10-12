import { Request, Router } from "express";
import handler from "../handlers/auth";
import {
  routerEnclose,
  routerEncloseAuthentication,
} from "../../utils/routerEnclose";
import { extractBothJWT, extractRefreshJWT } from "../../middleware/auth";
import { DecodedJWTObj } from "../interfaces/auth.interfaces";

const NAMESPACE = "Auth-Route";

const authRouter = Router();

// backend/src/modules/routes/users-routes.ts
const formatLoginRequest = (req: Request) => {
  return {
    source: "login",
    payload: req.body,
  };
};

authRouter.get(
  "/validate",
  routerEncloseAuthentication(extractBothJWT, (req: Request) => {
    const accessToken: string | undefined =
      req.headers.authorization?.split(" ")[1];
    const refreshToken: string | undefined =
      req.headers.authorization?.split(" ")[2];
    return {
      source: "express",
      payload: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
  }),
  routerEnclose(handler.validateToken, (req: Request) => ({
    source: "express",
    payload: req.body.data,
  }))
);

authRouter.get(
  "/refresh",
  routerEncloseAuthentication(extractRefreshJWT, (req: Request) => {
    const refreshToken = req.headers.authorization?.split(" ")[2];
    return {
      source: "express",
      payload: {
        refreshToken: refreshToken,
      },
    };
  }),
  routerEnclose(handler.refreshAccessToken, (req: Request) => {
    const body: DecodedJWTObj = req.body.data;
    return {
      source: "express",
      payload: body,
    };
  })
);

export default authRouter;

// backend/src/modules/routes/users-routes.ts
authRouter.post("/login", routerEnclose(handler.loginUser, formatLoginRequest));
