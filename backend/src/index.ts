import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import db from './config/db';
import userRouter from './modules/routes/users-routes';

// Your other imports
import express, { Request, Response } from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import asyncHandler from "express-async-handler";
import { generateToken } from "./utils/jwt";
import db from "./config/db";
import { users } from "./db/schema";
import { comparePassword } from "./utils/hashing";

dotenv.config({
  path: path.join(__dirname, "./../.env"),
});

const app = express();
const port = process.env.PORT || "8080";

console.log(process.env.POSTGRES_HOST);

app.use(
  cors({
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/api/user', userRouter);

app.post(
  "/login",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    try {
      const usersResult = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const user = usersResult[0];
      // const user = await mockDb.findUserByEmail(email);
      // console.log(`User found: ${user}`);

      if (!user) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid email or password" });
        return;
      }

      const token = generateToken({ id: user.id, role: user.role });

      res.json({ token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  })
);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


app.get('/', (req, res) => {
  res.send('Hello, backend server is now live!');
});
