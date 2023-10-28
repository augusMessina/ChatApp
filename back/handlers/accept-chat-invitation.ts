import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";
import { NotifType } from "../types/notif";

export const acceptFriendRequest: RequestHandler = async (req, res) => {
  const { id_chat, id } = req.body;
  if (!id_chat || !id) {
    res.status(400);
    return;
  }

  const chat = await chatsCollection.findOne({
    _id: new ObjectId(id_chat),
  });

  const user = await usersCollection.findOne({
    _id: new ObjectId(id),
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
        chats: { id: id_chat, chatname: chat.chatname! },
      },
    }
  );

  await chatsCollection.updateOne(
    { _id: new ObjectId(id_chat) },
    { $push: { members: { id, username: user.username } } }
  );
  res.status(200);
};
