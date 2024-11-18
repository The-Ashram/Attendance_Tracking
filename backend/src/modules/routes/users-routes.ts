import { Request, Router } from "express";
import handler from "../handlers/users";
import { routerEnclose, routerEncloseAuthentication } from "../../utils/routerEnclose";
import { authenticateAccessJWT } from "../../middleware/auth";
import { DecodedJWTObj } from "../interfaces/auth.interfaces";

const userRouter = Router();

const formatAuthenticateRequest = (req: Request) => {
  const accessToken: string | undefined = req.headers.authorization?.split(' ')[1];
  return {
    source: "express",
    payload: {
      accessToken: accessToken,
    }
  }
};

const formatExportUsersToCSV = (req: Request) => {
  return {
    source: "express",
    payload: req.body.data as DecodedJWTObj,
  };
}

const formatGetUserByIdRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      id: req.params.id,
      jwtData: req.body.data as DecodedJWTObj,
    },
  };
};

const formatGetAllUsersRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      jwtData: req.body.data as DecodedJWTObj,
    }
  };
};

const formatUpdateUserRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      id: req.params.id,
      updateData: req.body,
      jwtData: req.body.data as DecodedJWTObj
    },
  };
};

const formatDeleteAllUsersRequest = (req: Request) => {
  return {
    source: "express",
    payload: {
      jwtData: req.body.data as DecodedJWTObj,
    }
  };
};

const formatDeleteUserById = (req: Request) => {
  return {
    source: "express",
    payload: {
      id: req.params.id,
      jwtData: req.body,
    },
  };
};

userRouter.get(
  "/export",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.exportUsersToCSV, formatExportUsersToCSV)
)

userRouter.get(
  "/", 
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.getUsers, formatGetAllUsersRequest)
);

userRouter.get(
  "/:id", 
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.getUsers, formatGetUserByIdRequest)
);

// For update queries must add updatedAt field with current timestamp to update database
userRouter.patch(
  "/:id",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.updateUser, formatUpdateUserRequest)
);

userRouter.delete(
  "/",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.deleteUsers, formatDeleteAllUsersRequest)
);

userRouter.delete(
  "/:id",
  routerEncloseAuthentication(authenticateAccessJWT, formatAuthenticateRequest),
  routerEnclose(handler.deleteUsers, formatDeleteUserById)
);

export default userRouter;
