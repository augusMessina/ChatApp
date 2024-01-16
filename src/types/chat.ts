import { Message } from "./message";

export type Chat = {
  chatname?: string;
  id: string;
  members: { username: string; id: string }[];
  languages: string[];
  messages: Message[];
  password?: string;
  isFriendChat: boolean;
};
