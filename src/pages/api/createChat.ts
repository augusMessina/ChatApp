// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chatsCollection, usersCollection } from "@/db/connectMongo";
import { UserSchema } from "@/db/schema";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user_id, chatname, password } = req.body;
  if (!user_id || !chatname) {
    res.status(400).send({});
    return;
  }

  const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });

  if (!user) {
    res.status(400).send({});
    return;
  }

  let key: number | undefined = undefined;
  if (!password) {
    const chat = await chatsCollection.findOne({ chatname });
    if (chat) {
      res.status(200).send({ message: "chatname already taken" });
      return;
    }
  } else {
    key = Math.floor(Math.random() * 90000) + 10000;
  }

  const newChatId = new ObjectId();

  await chatsCollection.insertOne({
    _id: newChatId,
    chatname,
    members: [{ id: user_id, username: user.username! }],
    password: key !== undefined ? `${key}` : key,
    languages: [user.language!],
    messages: [],
    isFriendChat: false,
  });

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $push: {
        chats: {
          $each: [{ id: newChatId.toString(), chatname, unreads: 0 }],
          $position: 0,
        },
      },
    }
  );

  res.status(200).send({ chatname, id: newChatId });
}
