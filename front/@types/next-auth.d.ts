import { DefaultSession } from "next-auth";
import { Notif, OutgoingRequest } from "./notif";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      chats?: { id: string; chatname: string; unreads: number }[];
      friendList?: { friendId: string; friendName: string }[];
      mailbox?: Notif[];
      outgoingRequests?: OutgoingRequest[];
      language: string;
    } & DefaultSession["user"];
  }
}

type Notif = {
  type: NotifType;
  id_sender: string;
  username_sender: string;
  id_chat?: string;
  chatname?: string;
};

enum NotifType {
  "FRIEND" = "FRIEND",
  "CHAT" = "CHAT",
}
