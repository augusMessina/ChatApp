import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";
import { NotifType } from "../types/notif";

export const deleteFriend: RequestHandler = async (req, res) => {
  const { user_id, friend_id, chat_id } = req.body;
  if (!user_id || !friend_id || !chat_id) {
    res.status(400).send({});
    return;
  }

  const friend = await usersCollection.findOne({
    _id: new ObjectId(friend_id),
  });

  const user = await usersCollection.findOne({
    _id: new ObjectId(user_id),
  });

  const chat = await chatsCollection.findOne({ _id: new ObjectId(chat_id) });

  if (!friend || !user || !chat) {
    console.log();
    res.status(400).send({});
    return;
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $pull: {
        friendList: { friendId: friend_id, friendName: friend.username! },
        chats: { id: chat_id },
      },
    }
  );

  await usersCollection.updateOne(
    { _id: friend._id },
    {
      $pull: {
        friendList: { friendId: user_id, friendName: user.username! },
        chats: { id: chat_id },
      },
    }
  );

  await chatsCollection.deleteOne({ _id: chat._id });

  res.status(200).send({});
};
