import { Request, Router } from "express";
import handler from "../handlers/auth";
import {
  routerEnclose,
  routerEncloseAuthentication,
} from "../../utils/routerEnclose";
import { authenticateAccessJWT, authenticateBothJWT, authenticateRefreshJWT } from "../../middleware/auth";
import { DecodedJWTObj } from "../interfaces/auth.interfaces";

const authRouter = Router();

const formatValidateAuthRequest = (req: Request) => {
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
};

const formatValidateRequest = (req: Request) => ({
  source: "express",
  payload: req.body.data,
});

const formatRefreshAuthRequest = (req: Request) => {
  const refreshToken = req.headers.authorization?.split(" ")[2];
  return {
    source: "express",
    payload: {
      refreshToken: refreshToken,
    },
  };
};

const formatRefreshRequest = (req: Request) => {
  const body: DecodedJWTObj = req.body.data;
  return {
    source: "express",
    payload: body,
  };
};

const formatLoginRequest = (req: Request) => {
  return {
    source: "express",
    payload: req.body,
  };
};

const formatRegisterUserRequest = (req: Request) => {
  const jwtData = req.body.data;
  return {
    source: "express",
    payload: {
      createData: req.body,
      jwtData: jwtData,
    },
  };
};

const formatAuthenticateRequest = (req: Request) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  return {
    source: "express",
    payload: {
      accessToken: accessToken,
    },
  };
};

authRouter.get(
  "/validate",
  routerEncloseAuthentication(authenticateBothJWT, formatValidateAuthRequest),
  routerEnclose(handler.validateToken, formatValidateRequest)
);

authRouter.get(
  "/refresh",
  routerEncloseAuthentication(authenticateRefreshJWT, formatRefreshAuthRequest),
  routerEnclose(handler.refreshAccessToken, formatRefreshRequest)
);

authRouter.post(
  "/login", 
  routerEnclose(handler.loginUser, formatLoginRequest)
);

authRouter.post(
  "/register",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.registerNewUser, formatRegisterUserRequest)
);

export default authRouter;