export type Notif = {
  type: NotifType;
  id_sender: string;
  username_sender: string;
  id_chat?: string;
};

export enum NotifType {
  "FRIEND" = "FRIEND",
  "CHAT" = "CHAT",
}
