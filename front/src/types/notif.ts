export type Notif = {
  type: NotifType;
  id_sender: string;
  username_sender: string;
  id_chat?: string;
};

enum NotifType {
  "FRIEND" = "FRIEND",
  "CHAT" = "CHAT",
}
