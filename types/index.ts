export interface User {
  userName: string;
  userPhotoId: string;
  socketID: string;
  isPlaying: boolean;
  isRequestAccepted?: boolean;
  isRequestDeclined?: boolean;
  requests: Array<User>;
  acceptedRequest?: boolean;
}

export interface Message {
  title?: string;
  message: string;
  status: string;
  messageSocketId?: string;
}
