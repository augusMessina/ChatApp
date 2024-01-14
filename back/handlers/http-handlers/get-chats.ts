import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../../db/dbconnection";

export const getChats: RequestHandler = async (req, res) => {
  const chats = await chatsCollection.find({}).toArray();

  res.send({
    chats,
  });
};
