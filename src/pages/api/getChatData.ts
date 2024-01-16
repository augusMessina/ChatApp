// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chatsCollection, usersCollection } from "@/db/connectMongo";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chat_id, user_id } = req.body;
  if (!chat_id) {
    res.status(400).send({});
    return;
  }

  const chat = await chatsCollection.findOne({
    _id: new ObjectId(chat_id),
  });

  const user = await usersCollection.findOne({
    _id: new ObjectId(user_id),
  });

  if (!chat || !user) {
    res.status(400).send({});
    return;
  }

  const chatUnreads = user.chats.find((chat) => chat.id === chat_id)?.unreads;

  await usersCollection.updateOne(
    { _id: new ObjectId(user_id) },
    {
      $set: {
        chats: user.chats.map((chat) =>
          chat.id === chat_id ? { ...chat, unreads: 0 } : chat
        ),
      },
    }
  );

  res.send({
    messages: chat.messages,
    chatname:
      chat.chatname ??
      chat.members
        .filter((member) => member.id !== user_id)
        .map((member) => member.username)
        .join(", "),
    members: chat.members,
    languages: chat.languages,
    password: chat.password,
    isFriendChat: chat.isFriendChat,
    chatUnreads,
  });
}
