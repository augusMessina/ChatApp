// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chatsCollection, usersCollection } from "@/db/connectMongo";
import { NotifType } from "@/types/notif";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id_chat, user_id } = req.body;
  if (!id_chat || !user_id) {
    res.status(400);
    return;
  }

  const chat = await chatsCollection.findOne({
    _id: new ObjectId(id_chat),
  });

  const user = await usersCollection.findOne({
    _id: new ObjectId(user_id),
  });

  if (!chat || !user) {
    res.status(400);
    return;
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $pull: { mailbox: { id_chat, type: NotifType.CHAT } },
      $push: {
        chats: {
          $each: [{ id: id_chat, chatname: chat.chatname!, unreads: 0 }],
          $position: 0,
        },
      },
    }
  );

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

  res.status(200).send({});
}
