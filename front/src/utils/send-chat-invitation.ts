import { NotifType, OutgoingRequest } from "@/types/notif";
import { Socket } from "socket.io-client";

export const sendChatInvitation = async (
  userId: string,
  otherUserId: string,
  chatId: string,
  chatname: string,
  socket: Socket,
  outgoingRequests: OutgoingRequest[],
  setOutgoingRequests: (newReqs: OutgoingRequest[]) => void
) => {
  const res = await fetch("http://localhost:8080/sendChatInvitation", {
    method: "POST",
    body: JSON.stringify({
      id_sender: userId,
      id_receiver: otherUserId,
      id_chat: chatId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (res.ok) {
    setOutgoingRequests([
      ...outgoingRequests,
      { type: NotifType.CHAT, id_receiver: otherUserId, id_chat: chatId },
    ]);
    const newNotif = {
      id_sender: userId,
      type: NotifType.CHAT,
      id_receiver: otherUserId,
      id_chat: chatId,
      chatname,
    };
    socket.emit("new-notif", newNotif);
  }
};
