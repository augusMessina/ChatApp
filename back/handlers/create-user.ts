import { RequestHandler } from "express";
import { usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const createUser: RequestHandler = async (req, res) => {
  const { username, email, language } = req.body;
  if (!username || !email || language) {
    res.status(400);
    return;
  }

  await usersCollection.insertOne({
    _id: new ObjectId(),
    username,
    email,
    chats: [],
    friendList: [],
    mailbox: [],
    language,
  });
};
