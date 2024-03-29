// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import pusher from "@/lib/pusher";
import clientPromise from "@/lib/mongodb";
import { ChatSchema, UserSchema } from "@/lib/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chatId, userId, chatname, password } = req.body;
  if (!userId || (!chatId && (!chatname || !password))) {
    res.status(400).send({});
    return;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);
  const usersCollection = db.collection<UserSchema>("Users");
  const chatsCollection = db.collection<ChatSchema>("Chats");

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  let chat: ChatSchema | null;
  if (chatId) {
    chat = await chatsCollection.findOne({
      _id: new ObjectId(chatId),
    });
  } else {
    chat = await chatsCollection.findOne({
      chatname,
      password,
    });
  }

  if (!user || !chat) {
    res.status(400).send({});
    return;
  }

  if (chat.members.some((member) => member.id === user._id.toString())) {
    res.status(200).send({ message: "user already in chat" });
    return;
  }

  if (chat.languages.includes(user.language!)) {
    await chatsCollection.updateOne(
      { _id: chat._id },
      {
        $push: {
          members: { username: user.username, id: user._id.toString() },
        },
      }
    );
  } else {
    await chatsCollection.updateOne(
      { _id: chat._id },
      {
        $push: {
          members: { username: user.username, id: user._id.toString() },
          languages: user.language,
        },
      }
    );
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $push: {
        chats: {
          $each: [
            { chatname: chat.chatname, id: chat._id.toString(), unreads: 0 },
          ],
          $position: 0,
        },
      },
    }
  );

  await pusher.trigger(chat._id.toString(), "new-member", {
    memberId: userId,
    memberName: user.username,
    memberLan: user.language,
  });

  res.status(200).send({ id: chat._id.toString(), chatname: chat.chatname });
}
