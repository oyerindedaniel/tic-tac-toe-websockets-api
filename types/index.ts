export interface User {
  userName: string;
  userPhotoId: string;
  socketID: string;
  isPlaying: boolean;
  isRequestAccepted: boolean;
  requests: Array<User>;
}

export interface Message {
  message: string;
  status: string;
}
