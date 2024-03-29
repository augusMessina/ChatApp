// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "@/lib/mongodb";
import { ChatSchema, UserSchema } from "@/lib/schema";
import pusher from "@/lib/pusher";
import { NotifType } from "@/types/notif";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id_sender, user_id } = req.body;
  if (!id_sender || !user_id) {
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

  const user = await usersCollection.findOne({
    _id: new ObjectId(user_id),
  });

  if (!sender || !user) {
    res.status(400);
    return;
  }

  const chatId = new ObjectId();

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $pull: { mailbox: { id_sender, type: NotifType.FRIEND } },
      $push: {
        friendList: { friendId: id_sender, friendName: sender.username! },
        chats: { $each: [{ id: chatId.toString(), unreads: 0 }], $position: 0 },
      },
    }
  );

  await usersCollection.updateOne(
    { _id: sender._id },
    {
      $push: {
        friendList: { friendId: user_id, friendName: user.username! },
        chats: { $each: [{ id: chatId.toString(), unreads: 0 }], $position: 0 },
      },
    }
  );

  await chatsCollection.insertOne({
    _id: chatId,
    members: [
      { id: id_sender, username: sender.username! },
      { id: user_id, username: user.username! },
    ],
    messages: [],
    languages: Array.from(new Set([sender.language!, user.language!])),
    isFriendChat: true,
  });

  await pusher.trigger(id_sender, "accepted-fr", {
    chat_id: chatId,
    friend_id: user_id,
    friend_name: user.username,
  });

  res.status(200).send({ chat_id: chatId });
}
