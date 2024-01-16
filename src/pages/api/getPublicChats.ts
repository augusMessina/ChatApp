// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chatsCollection, usersCollection } from "@/db/connectMongo";
import { ChatSchema, UserSchema } from "@/db/schema";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chatname } = req.body;

  let chats: ChatSchema[];

  if (chatname) {
    chats = await chatsCollection
      .find({
        password: undefined,
        chatname: { $regex: `^${chatname}`, $options: "i" },
      })
      .toArray();
  } else {
    chats = await chatsCollection.find({ password: undefined }).toArray();
  }

  res.send({
    chats: chats
      .filter((chat) => chat.chatname)
      .map((chat) => ({
        chatname: chat.chatname,
        id: chat._id,
        languages: chat.languages,
        members: chat.members.length,
      })),
  });
}
