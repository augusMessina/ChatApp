// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chatsCollection, usersCollection } from "@/db/connectMongo";
import { UserSchema } from "@/db/schema";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user_id, friend_id, chat_id } = req.body;
  if (!user_id || !friend_id || !chat_id) {
    res.status(400).send({});
    return;
  }

  const friend = await usersCollection.findOne({
    _id: new ObjectId(friend_id),
  });

  const user = await usersCollection.findOne({
    _id: new ObjectId(user_id),
  });

  const chat = await chatsCollection.findOne({ _id: new ObjectId(chat_id) });

  if (!friend || !user || !chat) {
    res.status(400).send({});
    return;
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $pull: {
        friendList: { friendId: friend_id, friendName: friend.username! },
        chats: { id: chat_id },
      },
    }
  );

  await usersCollection.updateOne(
    { _id: friend._id },
    {
      $pull: {
        friendList: { friendId: user_id, friendName: user.username! },
        chats: { id: chat_id },
      },
    }
  );

  await chatsCollection.deleteOne({ _id: chat._id });

  res.status(200).send({});
}
