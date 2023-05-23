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

      this.socket.on('acceptPlayerRequest', (data: User) => {
        this.socket = socket;
        this.acceptPlayerRequest(data);
      });

      this.socket.on('acceptAcceptedPlayerRequest', (data: User) => {
        this.socket = socket;
        this.acceptAcceptedPlayerRequest(data);
      });

      this.socket.on('declinePlayerRequest', (data: User) => {
        this.socket = socket;
        this.declinePlayerRequest(data);
      });

      this.socket.on('declineAcceptedPlayerRequest', (data: User) => {
        this.socket = socket;
        this.declineAcceptedPlayerRequest(data);
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
