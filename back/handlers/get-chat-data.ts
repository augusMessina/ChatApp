import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const getChatData: RequestHandler = async (req, res) => {
  const { chat_id, user_id } = req.body;
  if (!chat_id) {
    res.status(400).send({});
    return;
  }

  const chat = await chatsCollection.findOne({
    _id: new ObjectId(chat_id),
  });

  if (!chat) {
    res.status(400).send();
    return;
  }

  res.send({
    messages: chat.messages,
    chatname:
      chat.chatname ??
      chat.members
        .filter((member) => member.id !== user_id)
        .map((member) => member.username)
        .join(", "),
    members: chat.members,
    allowedLanguages: chat.allowedLanguages,
    languages: chat.languages,
    password: chat.password,
    isFriendChat: chat.isFriendChat,
  });
};
