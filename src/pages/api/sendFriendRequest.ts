// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { usersCollection } from "@/db/connectMongo";
import { pusher } from "@/pusher/pusher";
import { Notif, NotifType } from "@/types/notif";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id_receiver, id_sender } = req.body;
  if (!id_receiver || !id_sender) {
    res.status(400);
    return;
  }

  const sender = await usersCollection.findOne({
    _id: new ObjectId(id_sender),
  });
  const receiver = await usersCollection.findOne({
    _id: new ObjectId(id_receiver),
  });

  if (!sender || !receiver) {
    res.status(400);
    return;
  }

  if (
    !receiver.mailbox.some(
      (notif) =>
        notif.id_sender === id_sender && notif.type === NotifType.FRIEND
    ) &&
    !sender.outgoingRequests.some(
      (request) =>
        request.type === NotifType.FRIEND && request.id_receiver === id_receiver
    )
  ) {
    await usersCollection.updateOne(
      { _id: new ObjectId(id_receiver) },
      {
        $push: {
          mailbox: {
            id_sender,
            username_sender: sender.username,
            type: NotifType.FRIEND,
          },
        },
      }
    );
    await usersCollection.updateOne(
      { _id: new ObjectId(id_sender) },
      {
        $push: {
          outgoingRequests: {
            id_receiver,
            type: NotifType.FRIEND,
          },
        },
      }
    );
  }

  const forwardedNotif: Notif = {
    id_sender,
    type: NotifType.FRIEND,
    username_sender: sender.username,
  };

  await pusher.trigger(id_receiver, "new-notif", forwardedNotif);

  res.status(200).send({});
}
