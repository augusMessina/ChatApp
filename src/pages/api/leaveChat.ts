// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chatsCollection, usersCollection } from "@/db/connectMongo";
import { pusher } from "@/pusher/pusher";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user_id, chat_id } = req.body;
  if (!user_id || !chat_id) {
    res.status(400);
    return;
  }

  const user = await usersCollection.findOne({
    _id: new ObjectId(user_id),
  });

  const chat = await chatsCollection.findOne({ _id: new ObjectId(chat_id) });

  if (!user || !chat) {
    res.status(400).send({});
    return;
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $pull: {
        chats: { id: chat_id },
      },
    }
  );

  if (chat.members.length <= 1) {
    await chatsCollection.deleteOne({ _id: chat._id });
  } else {
    const newChatLangs: string[] = [];
    chat.members.forEach(async (member) => {
      const memberInDB = await usersCollection.findOne({
        _id: new ObjectId(member.id),
      });
      if (
        memberInDB?.language &&
        !newChatLangs.includes(memberInDB?.language)
      ) {
        newChatLangs.push(memberInDB.language);
      }
    });

    await chatsCollection.updateOne(
      { _id: chat._id },
      {
        $pull: {
          members: { id: user_id },
        },
        $set: { languages: newChatLangs },
      }
    );
  }
  await pusher.trigger(chat_id, "left-chat", user_id);

  res.status(200).send({});
}
