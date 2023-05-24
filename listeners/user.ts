/* eslint-disable no-console */
import { Socket, Server } from 'socket.io';
import { User, Message } from '../types';

class UserConnection {
  io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  users: Array<User> = [];

  // Objects of requested Player with array of player that made requests
  gameRequestsUsers: Array<User> = [];

  player1: User | null = null; // Initiates the initial start game

  player2: User | null = null; // the other player

  socket: Socket | null = null;

  addNewUser(data: User) {
    if (this.socket?.connected) {
      if (!data?.socketID)
        return this.messagePlayerHandler({
          message: `You Left the waiting room. Join Again 😁`,
          status: 'error',
        });
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
          isRequestDeclined: false,
          acceptedRequest: false,
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
          return this.messagePlayerHandler({
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

  acceptPlayerRequest(data: User) {
    if (this.socket?.connected) {
      // Player that accepted the request
      const acceptRequestPlayer = this.gameRequestsUsers.find(
        (user) => user.socketID === this.socket?.id
      ) as User;

      if (!acceptRequestPlayer) return;
      this.updateUsersBySocketId(acceptRequestPlayer.socketID, {
        acceptedRequest: true,
      });

      console.log(acceptRequestPlayer);

      // Player that made the initial request
      const requestPlayer = acceptRequestPlayer.requests.find(
        (user) => user.socketID === data.socketID
      ) as User;

      if (!requestPlayer) return;
      this.updateUsersBySocketId(requestPlayer.socketID, {
        isRequestAccepted: true,
        isRequestDeclined: false,
      });

      // populates the modal open button used in frontend
      this.emitToConnectedPlayer(
        requestPlayer,
        acceptRequestPlayer,
        'acceptPlayerRequest'
      );

      this.emitToSelf(requestPlayer, 'requestedPlayer');

      this.messagePlayerHandler(
        {
          title: 'Accepted Game Request',
          message: `${acceptRequestPlayer.userName} accepted your game request. Do you still want to play.`,
          status: 'success',
        },
        requestPlayer.socketID,
        acceptRequestPlayer.socketID
      );

      // this.emitAvailablePlayerToIdlePlayer();
    } else {
      console.error('Socket is not connected!');
    }
  }

  acceptAcceptedPlayerRequest(data: User) {
    if (this.socket?.connected) {
      // Player that accepted the request
      const acceptRequestPlayer = this.gameRequestsUsers.find(
        (user) => user.socketID === data.socketID
      ) as User;

      if (!acceptRequestPlayer.acceptedRequest) return;
      this.updateUsersBySocketId(acceptRequestPlayer.socketID, {
        isPlaying: true,
      });

      // Player that made the initial request
      const requestPlayer = acceptRequestPlayer.requests.find(
        (user) => user.socketID === this.socket?.id
      ) as User;

      if (!requestPlayer) return;
      this.updateUsersBySocketId(requestPlayer.socketID, {
        isPlaying: true,
      });

      this.emitToConnectedPlayers(
        [acceptRequestPlayer, requestPlayer],
        'acceptAcceptedPlayerRequest'
      );

      this.messagePlayerHandler(
        {
          message: `${requestPlayer.userName} accepted your game request. Game starting ...`,
          status: 'success',
        },
        acceptRequestPlayer.socketID
      );

      // this.emitAvailablePlayerToIdlePlayer();
    } else {
      console.error('Socket is not connected!');
    }
  }

  declinePlayerRequest(data: User) {
    if (this.socket?.connected) {
      // Player that declined the request
      const declineRequestPlayer = this.gameRequestsUsers.find(
        (user) => user.socketID === this.socket?.id
      ) as User;

      if (declineRequestPlayer) {
        this.updateUsersBySocketId(declineRequestPlayer.socketID, {
          acceptedRequest: false,
        });

        // Player that made the initial request
        const declinePlayer = declineRequestPlayer.requests.find(
          (user) => user.socketID === data.socketID
        ) as User;

        if (declinePlayer) {
          this.updateUsersBySocketId(declinePlayer.socketID, {
            isRequestAccepted: false,
            isRequestDeclined: true,
          });
        }

        // Removes the open button
        this.emitToConnectedPlayer(
          declinePlayer,
          declineRequestPlayer,
          'declinePlayerRequest'
        );

        // Enables the disabled request button after request cancelled
        this.emitToSelf(declinePlayer, 'declinePlayerResetRequest');

        this.messagePlayerHandler(
          {
            message: `${declineRequestPlayer.userName} declined your game request.`,
            status: 'warning',
          },
          declinePlayer.socketID
        );

        this.removeGameRequestsUser(
          declineRequestPlayer.socketID,
          declinePlayer.socketID
        );

        this.emitAllConnectedUsers();
      }
    } else {
      console.error('Socket is not connected!');
    }
  }

  declineAcceptedPlayerRequest(data: User) {
    if (this.socket?.connected) {
      // Player that accepted initial request
      const acceptRequestPlayer = this.gameRequestsUsers.find(
        (user) => user.socketID === data.socketID
      ) as User;

      if (!acceptRequestPlayer.acceptedRequest) return;
      this.updateUsersBySocketId(acceptRequestPlayer.socketID, {
        acceptedRequest: false,
        isPlaying: false,
      });

      // Player that made the initial request
      const requestPlayer = acceptRequestPlayer.requests.find(
        (user) => user.socketID === this.socket?.id
      ) as User;

      if (!requestPlayer) return;
      this.updateUsersBySocketId(requestPlayer.socketID, {
        isRequestAccepted: false,
        isRequestDeclined: false,
        isPlaying: false,
      });

      // Removes the open button
      this.emitToSelf(acceptRequestPlayer, 'declinePlayerRequest');

      // Enables the disabled request button after request cancelled
      this.emitToConnectedPlayer(
        acceptRequestPlayer,
        requestPlayer,
        'declinePlayerResetRequest'
      );

      this.messagePlayerHandler(
        {
          message: `${acceptRequestPlayer.userName} declined your start game request. Look for another Player.`,
          status: 'warning',
        },
        acceptRequestPlayer.socketID
      );

      this.removeGameRequestsUser(
        acceptRequestPlayer.socketID,
        requestPlayer.socketID
      );

      this.emitAllConnectedUsers();
    } else {
      console.error('Socket is not connected!');
    }
  }

  messagePlayerHandler(
    message: Message,
    socketId?: string,
    messageSocketId?: string
  ) {
    if (this.socket?.connected) {
      if (socketId)
        return this.io.to(socketId).emit('status', {
          ...message,
          ...(messageSocketId ? { messageSocketId } : {}),
        });

      this.socket.emit('status', message);
    } else {
      console.error('Socket is not connected!');
    }
  }

  updateUsersBySocketId(
    socketIdToUpdate: string,
    updateItems: object,
    users = this.users,
    gameRequestsUsers = this.gameRequestsUsers
  ) {
    this.users = users.map((user) => {
      if (user.socketID === socketIdToUpdate) {
        return { ...user, ...updateItems };
      }
      return user;
    });

    this.gameRequestsUsers = gameRequestsUsers.map((user) => {
      if (user.socketID === socketIdToUpdate) {
        return { ...user, ...updateItems };
      }
      return user;
    });
  }

  // findPlayer(socketId: Socket) {
  //   console.log(socketId);
  // }

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

  emitToConnectedPlayer(reqData: User, resData: User, socketName: string) {
    this.io.to(reqData.socketID).emit(socketName, resData);
  }

  emitAvailablePlayerToIdlePlayer() {
    const idleUsers = this.users.filter(
      (user) =>
        ![user.isRequestAccepted, user.isPlaying, user.acceptedRequest].some(
          Boolean
        )
    );

    idleUsers.forEach((user) => {
      this.io.to(user.socketID).emit('allConnectedUsers', idleUsers);
    });
  }

  emitToConnectedPlayers(
    users: Array<User>,
    socketName: string,
    resData?: User
  ) {
    users.forEach((user) => {
      this.io.to(user.socketID).emit(socketName, resData || {});
    });
  }

  emitToSelf(data: User, socketName: string) {
    if (this.socket?.connected) {
      this.socket.emit(socketName, data);
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

  addUser(addUsers: Array<User>) {
    if (this?.socket) {
      this.users = this.users.filter((user) => !addUsers.includes(user));
      this.emitAllConnectedUsers();
    } else {
      console.error('Socket is not connected!');
    }
  }

  emitAllConnectedUsers() {
    this.io.emit('allConnectedUsers', this.users);
  }

  emitAllGameRequestsUsers() {
    this.gameRequestsUsers.forEach((user) => {
      this.io.to(user.socketID).emit('allGameRequestsUsers', user);
    });
  }

  removeGameRequestsUser(searchSocketID: string, removeSocketID: string) {
    if (this?.socket) {
      this.gameRequestsUsers = this.gameRequestsUsers.map((user) => {
        if (user.socketID === searchSocketID) {
          const filterUserRequests = user.requests.filter(
            (u) => u.socketID !== removeSocketID
          );
          return { ...user, requests: filterUserRequests };
        }
        return user;
      });
      this.emitAllGameRequestsUsers();
    } else {
      console.error('Socket is not connected!');
    }
  }

  removeUsers(removeUsers: Array<User>) {
    if (this?.socket) {
      this.users = this.users.filter(
        (user) => !removeUsers.some((u) => u.socketID === user.socketID)
      );
      this.emitAllConnectedUsers();
    } else {
      console.error('Socket is not connected!');
    }
  }

  removeDiscountedUser() {
    if (this?.socket) {
      this.users = this.users.filter(
        (user) => user.socketID !== this.socket?.id
      );

      this.gameRequestsUsers = this.gameRequestsUsers
        .filter((user) => user.socketID !== this.socket?.id)
        .map((user) => {
          if (user.requests) {
            const filteredRequests = user.requests.filter(
              (u) => u.socketID !== this.socket?.id
            );
            return { ...user, requests: filteredRequests };
          }
          return user;
        });
      this.emitAllConnectedUsers();
      this.emitAllGameRequestsUsers();
      console.log(`User and Requests Removed: ${this.socket.id} ❌`);
    } else {
      console.error('Socket is not connected!');
    }
  }
}

export default UserConnection;
