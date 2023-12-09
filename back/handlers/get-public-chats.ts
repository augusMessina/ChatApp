import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const getPublicChats: RequestHandler = async (req, res) => {
  const chats = await chatsCollection.find({ password: undefined }).toArray();

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
