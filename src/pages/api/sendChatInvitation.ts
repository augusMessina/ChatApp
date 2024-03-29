// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Notif, NotifType } from "@/types/notif";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import pusher from "@/lib/pusher";
import clientPromise from "@/lib/mongodb";
import { ChatSchema, UserSchema } from "@/lib/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id_receiver, id_sender, id_chat } = req.body;
  if (!id_receiver || !id_sender || !id_chat) {
    res.status(400);
    return;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);
  const usersCollection = db.collection<UserSchema>("Users");
  const chatsCollection = db.collection<ChatSchema>("Chats");

  const sender = await usersCollection.findOne({
    _id: new ObjectId(id_sender),
  });
  const receiver = await usersCollection.findOne({
    _id: new ObjectId(id_receiver),
  });

  const chat = await chatsCollection.findOne({ _id: new ObjectId(id_chat) });

  if (!sender || !receiver) {
    res.status(400);
    return;
  }

  if (
    !receiver.mailbox.some(
      (notif) =>
        notif.id_sender === id_sender &&
        notif.type === NotifType.CHAT &&
        notif.id_chat === id_chat
    ) &&
    !sender.outgoingRequests.some(
      (request) =>
        request.type === NotifType.CHAT &&
        request.id_receiver === id_receiver &&
        request.id_chat === id_chat
    )
  ) {
    await usersCollection.updateOne(
      { _id: new ObjectId(id_receiver) },
      {
        $push: {
          mailbox: {
            id_sender,
            username_sender: sender.username!,
            type: NotifType.CHAT,
            id_chat,
            chatname: chat?.chatname,
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
            type: NotifType.CHAT,
          },
        },
      }
    );
  }

  const forwardedNotif: Notif = {
    id_sender,
    type: NotifType.CHAT,
    username_sender: sender.username,
    chatname: chat?.chatname,
    id_chat,
  };

  await pusher.trigger(id_receiver, "new-notif", forwardedNotif);

  res.status(200).send({});
}
