import { Request, Router } from "express";
import handler from "../handlers/users"
import { routerEnclose } from "../../utils/routerEnclose";
import { UsersSchema } from "db/schema/users.schema";

const NAMESPACE = "Users-Route";

const userRouter = Router();

const formatCreateUserRequest = (req: Request) => {
  return {
      source: "createUser",
      payload: req.body,
  };
};

userRouter.post('/create', routerEnclose(handler.createNewUser, formatCreateUserRequest));

userRouter.get('/', routerEnclose(handler.getUserByName, formatCreateUserRequest));

export default userRouter