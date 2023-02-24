/* eslint-disable no-console */
import http from 'http';
import { Server } from 'socket.io';
import { CORS_ORIGINS, PORT } from './config';
import app from './app';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id} 👋🏼`);
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🤡✈️`);
});
