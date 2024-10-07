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

const formatGetUserById = (req: Request) => {
  return {
      source: "getUserByName",
      payload: {
        id: req.params.id,
        data: req.body
      }
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
        updateData: req.body
      }
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
        data: req.body
      }
  };
};

userRouter.post('/register', routerEnclose(handler.createNewUser, formatCreateUserRequest));
userRouter.get('/', routerEnclose(handler.getUsers, formatGetAllUsersRequest));
userRouter.get('/:id', routerEnclose(handler.getUsers, formatGetUserById));
userRouter.patch('/:id', routerEnclose(handler.updateUser, formatUpdateUserRequest));
userRouter.delete('/', routerEnclose(handler.deleteUsers, formatDeleteAllUsersRequest));
userRouter.delete('/:id', routerEnclose(handler.deleteUsers, formatDeleteUserById));

export default userRouter