import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import { CORS_ORIGINS } from './config';

dotenv.config({ path: path.resolve(__dirname, './.env') });

const app = express();

app.use(
  cors({
    origin: CORS_ORIGINS,
    credentials: true,
  })
);

const isDev = process.env.NODE_ENV;

if (isDev) {
  app.use(morgan('dev'));
}

export default app;
