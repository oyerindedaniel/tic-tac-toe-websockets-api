/* eslint-disable no-console */
import { Socket, Server } from 'socket.io';
import { User } from '../types';

class UserConnection {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  users: Array<User> = [];

  player1: (User & { isPlay: boolean }) | null = null; // Initiates the initial start game

  player2: (User & { isPlay: boolean }) | null = null; // the other player

  socket: Socket | null = null;

  addUser() {
    if (this.socket?.connected) {
      this.socket.on('newUser', (data: User) => {
        const isUserExists = this.users.find(
          (user) => user.socketID === this.socket?.id
        );
        if (!isUserExists) {
          this.users.push({
            userName: data.userName,
            socketID: data.socketID,
            userPhotoId: data.userPhotoId,
          });
          this.emitAllConnectedUsers();
          // this.emitActiveUsers();
        }
      });
    } else {
      console.error('Socket is not connected!');
    }
  }

  requestStartGame() {
    if (this.socket?.connected) {
      this.socket.on('requestStartGame', (data: User) => {
        console.log(this.socket?.id);
        const player1User = this.users.find(
          (user) => user.socketID === this.socket?.id
        );
        if (player1User) this.player1 = { ...player1User, isPlay: true };
        this.player2 = { ...data, isPlay: false };
        this.requestGamePlayer2();
      });
    } else {
      console.error('Socket is not connected!');
    }
  }

  requestGamePlayer2() {
    if (this.socket?.connected && this.player2) {
      console.log(this.player1);
      console.log(this.player2);
      this.io.to(this.player2?.socketID).emit('requestPlayer2', this.player1);
    } else {
      console.error('Socket is not connected!');
    }
  }

  emitActiveUsers() {
    if (this.socket?.connected) {
      // Active Users does not include the user that emitted this
      const activeUsers = this.users.filter(
        (user) => user.socketID !== this.socket?.id
      );
      console.log('AllUsersAfterFilter', activeUsers);
      this.socket.emit('activeUsers', activeUsers);
    } else {
      console.error('Socket is not connected!');
    }
  }

  emitUsers() {
    if (this.socket?.connected) {
      // Active Users does not include the user that emitted this
      const activeUsers = this.users.filter(
        (user) => user.socketID !== this.socket?.id
      );
      console.log('AllUsersAfterFilter', activeUsers);
      this.socket.emit('activeUsers', activeUsers);
    } else {
      console.error('Socket is not connected!');
    }
  }

  emitAllConnectedUsers() {
    this.io.emit('allConnectedUsers', this.users);
  }

  removeUser() {
    if (this?.socket) {
      this.users = this.users.filter(
        (user) => user.socketID !== this.socket?.id
      );
      console.log(`User Removed: ${this.socket.id} ❌`);
      console.log(this.users);
    } else {
      console.error('Socket is not connected!');
    }
  }
}

export default UserConnection;
