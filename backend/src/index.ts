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
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/attendance", attendanceRouter);

app.use(cors({
    origin: '*', // Replace '*' with your frontend's domain for better security
    methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers in requests
    exposedHeaders: ['Content-Disposition'], // Expose the Content-Disposition header to the browser
}));


const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello, backend server is now live!");
});
