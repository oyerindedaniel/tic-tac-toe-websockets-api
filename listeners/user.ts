/* eslint-disable no-console */
import { Socket, Server } from 'socket.io';
import { User, Message } from '../types';

class UserConnection {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  users: Array<User> = [];

  gameRequestsUsers: Array<User> = [];

  player1: User | null = null; // Initiates the initial start game

  player2: User | null = null; // the other player

  socket: Socket | null = null;

  addUser(data: User) {
    if (this.socket?.connected) {
      const isUserExists = this.users.find(
        (user) => user.socketID === this.socket?.id
      );
      if (!isUserExists) {
        this.users.push({
          userName: data.userName.toUpperCase(),
          socketID: data.socketID,
          userPhotoId: data.userPhotoId,
          isPlaying: false,
          isRequestAccepted: false,
          requests: [],
        });
        this.emitAllConnectedUsers();
        // this.emitActiveUsers();
      }
    } else {
      console.error('Socket is not connected!');
    }
  }

  requestStartGame(data: User) {
    if (this.socket?.connected) {
      // Player that made the request for start game
      const requestPlayer = this.users.find(
        (user) => user.socketID === this.socket?.id
      ) as User;

      // Check if requested Player exists
      const foundOpponent = this.gameRequestsUsers.find(
        (user: User) => user.socketID === data.socketID
      ) as User;

      if (foundOpponent) {
        // Check if request by player as been made already .
        const foundRequestPlayer = foundOpponent.requests.find(
          (user) => user.socketID === requestPlayer.socketID
        );
        if (foundRequestPlayer)
          return this.errorPlayerHandler({
            message: `You have already sent a game request to ${foundOpponent.userName}. Please wait for their response.`,
            status: 'warning',
          });
        foundOpponent.requests.push({ ...requestPlayer });
      } else {
        const addPlayer = {
          ...data,
          requests: [{ ...requestPlayer } as User],
        };
        this.gameRequestsUsers.push(addPlayer);
      }

      this.requestGamePlayer2(data);
    } else {
      console.error('Socket is not connected!');
    }
  }

  errorPlayerHandler(message: Message) {
    if (this.socket?.connected) {
      this.socket.emit('status', message);
    } else {
      console.error('Socket is not connected!');
    }
  }

  requestGamePlayer2(data: User) {
    if (this.socket?.connected) {
      const requestedUser = this.gameRequestsUsers.find(
        (user) => user.socketID === data.socketID
      ) as User;
      this.io.to(data.socketID).emit('requestPlayer2', requestedUser);
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
      this.emitAllConnectedUsers();
      console.log(`User Removed: ${this.socket.id} ❌`);
    } else {
      console.error('Socket is not connected!');
    }
  }
}

export default UserConnection;
