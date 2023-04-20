/* eslint-disable no-console */
// import { Socket, Server } from 'socket.io';
import { User } from '../types';
import UserConnection from './user';

class GameConnection extends UserConnection {
  addDemoGamePlayer() {
    if (this.socket?.connected) {
      this.socket.on('requestGamePlay', (data: User) => {
        console.log(data);
      });
    } else {
      console.error('Socket is not connected!');
    }
  }
}

export default GameConnection;
