import { NotifType, OutgoingRequest } from "@/types/notif";

export const sendChatInvitation = async (
  userId: string,
  otherUserId: string,
  chatId: string,
  outgoingRequests: OutgoingRequest[],
  setOutgoingRequests: (newReqs: OutgoingRequest[]) => void
) => {
  fetch("/api/sendChatInvitation", {
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
  setOutgoingRequests([
    ...outgoingRequests,
    { type: NotifType.CHAT, id_receiver: otherUserId, id_chat: chatId },
  ]);
};
