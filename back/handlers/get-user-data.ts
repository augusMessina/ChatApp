import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const getUserData: RequestHandler = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400);
    return;
  }

  const user = await usersCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!user) {
    res.status(400);
    return;
  }

  user.chats = await Promise.all(
    user.chats.map(async (chat) => {
      if (chat.chatname) return chat;
      const chatObj = await chatsCollection.findOne({
        _id: new ObjectId(chat.id),
      });
      return {
        id: chat.id,
        chatname: chatObj!.members
          .filter((member) => member.id !== id)
          .join(", "),
      };
    })
  );

  res.send({
    chats: user.chats,
    friendList: user.friendList,
    mailbox: user?.mailbox,
  });
};
