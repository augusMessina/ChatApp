import { Notif } from "./notif";

export type User = {
  username: string;
  id: string;
  email: string;
  friendList: { friendId: string; friendName: string }[];
  chats: { chatname: string; id: string }[];
  mailbox: Notif[];
  language: string;
};
