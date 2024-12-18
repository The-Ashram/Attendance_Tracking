import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import userRouter from "./modules/routes/users-routes";
import authRouter from "./modules/routes/auth-routes";
import attendanceRouter from "./modules/routes/attendance-routes";
import logRouter from "./modules/routes/logs-routes";

dotenv.config({
  path: path.join(__dirname, "./../.env"),
});

const app = express();
const port = process.env.PORT || "8080";

console.log(process.env.POSTGRES_HOST);

app.use(
  cors({
    origin: "*", // Allow requests from all origins (modify for production)
    credentials: true,
  })
);
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/log", logRouter)

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello, backend server is now live!");
});

export default app;
