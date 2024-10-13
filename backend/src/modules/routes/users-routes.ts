import { Request, Router } from "express";
import handler from "../handlers/users";
import { routerEnclose, routerEncloseAuthentication } from "../../utils/routerEnclose";
import { authenticateAccessJWT } from "../../middleware/auth";

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

const formatGetUserByIdRequest = (req: Request) => {
  return {
    source: "getUserByName",
    payload: {
      id: req.params.id,
      data: req.body,
    },
  };
};

const formatGetAllUsersRequest = (req: Request) => {
  return {
    source: "getAllUsers",
    payload: req.body,
  };
};

const formatUpdateUserRequest = (req: Request) => {
  return {
    source: "updateUser",
    payload: {
      id: req.params.id,
      updateData: req.body,
    },
  };
};

const formatDeleteAllUsersRequest = (req: Request) => {
  return {
    source: "deleteAllUsers",
    payload: req.body,
  };
};

const formatDeleteUserById = (req: Request) => {
  return {
    source: "deleteUser",
    payload: {
      id: req.params.id,
      data: req.body,
    },
  };
};

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
