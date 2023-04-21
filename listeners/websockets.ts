/* eslint-disable no-console */
import { Server, Socket } from 'socket.io';
import UserConnection from './user';
import { User } from '../types';
// import GameConnection from './game';

class WebSocketConnection extends UserConnection {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(io: Server) {
    super(io);
  }

  connectSocket() {
    this.io.on('connection', (socket: Socket) => {
      this.socket = socket;
      console.log(`User Connected: ${this.socket.id} 👋🏼`);

      this.socket.on('newUser', (data: User) => {
        this.socket = socket;
        this.addNewUser(data);
      });

      this.socket.on('requestPlayer', (data: User) => {
        this.socket = socket;
        this.requestStartGame(data);
      });

      this.socket.on('acceptRequestPlayer', (data: User) => {
        this.socket = socket;
        this.acceptRequestPlayer(data);
      });

      this.socket.on('declineRequestPlayer', (data: User) => {
        this.socket = socket;
        this.declineRequestPlayer(data);
      });

      this.socket.on('disconnect', () => {
        this.socket = socket;
        this.disconnectSocket();
      });
    });
  }

  disconnectSocket() {
    if (this.socket) {
      this.removeDiscountedUser();
      this.socket.disconnect();
      console.log(`User Disconnected: ${this.socket.id} ❌`);
    }
  }
}

export default WebSocketConnection;
