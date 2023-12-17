import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";
import { ChatSchema } from "../db/schema";

export const getPublicChats: RequestHandler = async (req, res) => {
  const { chatname } = req.body;

  let chats: ChatSchema[];

  if (chatname) {
    chats = await chatsCollection
      .find({
        password: undefined,
        chatname: { $regex: `^${chatname}`, $options: "i" },
      })
      .toArray();
  } else {
    chats = await chatsCollection.find({ password: undefined }).toArray();
  }

  res.send({
    chats: chats.map((chat) => ({
      chatname: chat.chatname,
      id: chat._id,
      languages: chat.languages,
      allowedLanguages: chat.allowedLanguages,
      members: chat.members.length,
    })),
  });
};
