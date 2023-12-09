import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";

export const clearChats: RequestHandler = async (req, res) => {
  await chatsCollection.deleteMany({});
  res.send("chats removed");
};
