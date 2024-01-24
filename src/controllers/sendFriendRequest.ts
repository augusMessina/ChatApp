import { NotifType, OutgoingRequest } from "@/types/notif";

export const sendFriendRequest = (
  userId: string,
  otherUserId: string,
  outgoingRequests: OutgoingRequest[],
  setOutgoingRequests: (newReqs: OutgoingRequest[]) => void
) => {
  fetch("/api/sendFriendRequest", {
    method: "POST",
    body: JSON.stringify({
      id_sender: userId,
      id_receiver: otherUserId,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  setOutgoingRequests([
    ...outgoingRequests,
    { type: NotifType.FRIEND, id_receiver: otherUserId },
  ]);
};
