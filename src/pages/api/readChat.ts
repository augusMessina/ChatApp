// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { usersCollection } from "@/db/connectMongo";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chatId, userId } = req.body;
  if (!userId || !chatId) {
    res.status(400).send({});
    return;
  }

  const user = await usersCollection.findOne({
    _id: new ObjectId(userId),
  });
  if (user) {
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          chats: user.chats.map((chat) =>
            chat.id === chatId ? { ...chat, unreads: 0 } : chat
          ),
        },
      }
    );
  }

  res.status(200).send({});
}
