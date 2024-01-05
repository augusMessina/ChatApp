import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const getChats: RequestHandler = async (req, res) => {
  const chats = await chatsCollection.find({}).toArray();

  res.send({
    chats,
  });
};
