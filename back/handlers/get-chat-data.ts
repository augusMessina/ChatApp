import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const getChatData: RequestHandler = async (req, res) => {
  const { id } = req.body;
  if (!id) {
    res.status(400).send({});
    return;
  }

  const chat = await chatsCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!chat) {
    res.status(400).send();
    return;
  }

  res.send({
    messages: chat.messages,
    chatname:
      chat.chatname ?? chat.members.map((member) => member.username).join(", "),
    members: chat.members,
    allowedLanguages: chat.allowedLanguages,
    languages: chat.languages,
    password: chat.password,
  });
};
