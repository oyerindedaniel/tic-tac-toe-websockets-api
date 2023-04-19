/* eslint-disable no-console */
import { Socket, Server } from 'socket.io';
import { User } from '../types';

class UserConnection {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  users: Array<User> = [];

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
          this.emitActiveUsers();
        }
      });
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

  removeUser() {
    if (this?.socket) {
      this.users = this.users.filter(
        (user) => user.socketID !== this.socket?.id
      );
      console.log(`User Removed: ${this.socket.id} 👋🏼`);
      console.log(this.users);
    } else {
      console.error('Socket is not connected!');
    }
  }
}

export default UserConnection;
