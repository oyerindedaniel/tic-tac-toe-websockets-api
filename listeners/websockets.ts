/* eslint-disable no-console */
import { Server, Socket } from 'socket.io';
import { User } from '../types';

class WebSocketConnection {
  users: Array<User> = [];

  socket: Socket | null = null;

  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  connect() {
    this.io.on('connection', (socket: Socket) => {
      this.socket = socket;
      console.log(`User Connected: ${socket.id} 👋🏼`);

      this.socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id} 👋🏼`);
        if (this.socket) {
          this.socket.disconnect();
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default WebSocketConnection;
