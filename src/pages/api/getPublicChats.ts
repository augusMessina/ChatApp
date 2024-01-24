// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ChatSchema } from "@/lib/schema";
import clientPromise from "@/lib/mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chatname } = req.body;

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);
  const chatsCollection = db.collection<ChatSchema>("Chats");

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
