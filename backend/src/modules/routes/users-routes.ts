import { Router } from "express";
import handler from "../handlers/users"


const router = Router();

router.post('/create_user', handler.createNewUser)