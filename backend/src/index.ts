import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';


const app = express();
const port = 8080;

app.use(cors({
  credentials: true,
}));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello, TypeScript with Express!');
});

const server = http.createServer(app)

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});