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

const app = express();
const port = process.env.PORT || '8080';

dotenv.config({
  path: path.join(__dirname, './../.env'),
});

console.log(process.env.POSTGRES_HOST)

app.use(cors({
  credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/user', userRouter);


const server = http.createServer(app)

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


app.get('/', (req, res) => {
  res.send('Hello, TypeScript with Express!');
});

