import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const PORT = process.env.PORT || 8000;

export const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',').map((el) =>
  RegExp(el)
);

export const FRONTEND_URL = process.env.FRONTEND_URL || '';
