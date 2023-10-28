import { Notif } from "./notif";

export type User = {
  username: string;
  id: string;
  email: string;
  friendList: string;
  chats: { chatname: string; id: string };
  mailbox: Notif[];
  language: string;
};
