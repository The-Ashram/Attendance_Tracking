import { Request, Router } from "express";
import handler from "../handlers/users"
import { routerEnclose } from "utils/routerEnclose";

const NAMESPACE = "Users-Route";

const userRouter = Router();

const formatCreateUserRequest = (req: Request) => {
  return {
      source: "createUser",
      payload: req.body,
  };
};

userRouter.post('/create', routerEnclose(handler.createNewUser, formatCreateUserRequest));


export default userRouter