/* eslint-disable no-console */
import http from 'http';
import { Server } from 'socket.io';
import { CORS_ORIGINS, PORT } from './config';
import app from './app';
import WebSocketConnection from './listeners/websockets';

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ['GET', 'POST'],
  },
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} 🤡✈️`);
});

const webSocketConnection = new WebSocketConnection(io);
webSocketConnection.connect();
