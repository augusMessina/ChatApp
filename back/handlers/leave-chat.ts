import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";
import { NotifType } from "../types/notif";

export const leaveChat: RequestHandler = async (req, res) => {
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

  res.status(200).send({});
};
