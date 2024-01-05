import { Notif, OutgoingRequest } from "./notif";

export type User = {
  username: string;
  id: string;
  email: string;
  password?: string;
  friendList: { friendId: string; friendName: string }[];
  chats: { chatname?: string; id: string }[];
  mailbox: Notif[];
  outgoingRequests: OutgoingRequest[];
  language?: string;
};
