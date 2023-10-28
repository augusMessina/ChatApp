import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";
import { NotifType } from "../types/notif";

export const acceptFriendRequest: RequestHandler = async (req, res) => {
  const { id_sender, id } = req.body;
  if (!id_sender || !id) {
    res.status(400);
    return;
  }

  const sender = await usersCollection.findOne({
    _id: new ObjectId(id_sender),
  });

  const user = await usersCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!sender || !user) {
    res.status(400);
    return;
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $pull: { mailbox: { id_sender, type: NotifType.FRIEND } },
      $push: {
        friendList: { friendId: id_sender, friendName: sender.username },
      },
    }
  );

  await usersCollection.updateOne(
    { _id: sender._id },
    {
      $push: {
        friendList: { friendId: id, friendName: user.username },
      },
    }
  );

  await chatsCollection.insertOne({
    _id: new ObjectId(),
    members: [
      { id: id_sender, username: sender.username },
      { id: id, username: user.username },
    ],
    messages: [],
    languages: Array.from(new Set([...sender.language, ...user.language])),
  });

  res.status(200);
};
