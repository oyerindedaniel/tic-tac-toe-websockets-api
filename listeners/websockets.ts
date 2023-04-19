/* eslint-disable no-console */
import { Server, Socket } from 'socket.io';
import UserConnection from './user';
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

      this.addUser();

      this.requestStartGame();

      this.socket.on('disconnect', () => {
        this.disconnectSocket();
      });
    });
  }

  disconnectSocket() {
    if (this.socket) {
      this.removeUser();
      this.socket.disconnect();
      console.log(`User Disconnected: ${this.socket.id} ❌`);
    }
  }
}

export default WebSocketConnection;
