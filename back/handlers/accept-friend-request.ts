import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";
import { NotifType } from "../types/notif";

export const acceptFriendRequest: RequestHandler = async (req, res) => {
  const { id_sender, user_id } = req.body;
  if (!id_sender || !user_id) {
    res.status(400);
    return;
  }

  const sender = await usersCollection.findOne({
    _id: new ObjectId(id_sender),
  });

  const user = await usersCollection.findOne({
    _id: new ObjectId(user_id),
  });

  if (!sender || !user) {
    res.status(400);
    return;
  }

  const chatId = new ObjectId();

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $pull: { mailbox: { id_sender, type: NotifType.FRIEND } },
      $push: {
        friendList: { friendId: id_sender, friendName: sender.username! },
        chats: { $each: [{ id: chatId.toString(), unreads: 0 }] },
      },
    }
  );

  await usersCollection.updateOne(
    { _id: sender._id },
    {
      $push: {
        friendList: { friendId: user_id, friendName: user.username! },
        chats: { $each: [{ id: chatId.toString(), unreads: 0 }] },
      },
    }
  );

  await chatsCollection.insertOne({
    _id: chatId,
    members: [
      { id: id_sender, username: sender.username! },
      { id: user_id, username: user.username! },
    ],
    messages: [],
    languages: Array.from(new Set([sender.language!, user.language!])),
    isFriendChat: true,
  });

  res.status(200).send({ chat_id: chatId });
};
