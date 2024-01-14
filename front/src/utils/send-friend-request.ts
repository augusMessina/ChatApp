import { NotifType, OutgoingRequest } from "@/types/notif";
import { Socket } from "socket.io-client";

export const sendFriendRequest = async (
  userId: string,
  otherUserId: string,
  socket: Socket,
  outgoingRequests: OutgoingRequest[],
  setOutgoingRequests: (newReqs: OutgoingRequest[]) => void
) => {
  const res = await fetch(
    `http://${process.env.NEXT_PUBLIC_BACK_IP}:8080/sendFriendRequest`,
    {
      method: "POST",
      body: JSON.stringify({
        id_sender: userId,
        id_receiver: otherUserId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (res.ok) {
    setOutgoingRequests([
      ...outgoingRequests,
      { type: NotifType.FRIEND, id_receiver: otherUserId },
    ]);
    const newNotif = {
      id_sender: userId,
      type: NotifType.FRIEND,
      id_receiver: otherUserId,
    };
    socket.emit("new-notif", newNotif);
  }
};
