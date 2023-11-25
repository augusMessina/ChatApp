import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const createChat: RequestHandler = async (req, res) => {
  const { user_id, chatname, password, allowedLanguages } = req.body;
  if (!user_id || !chatname) {
    res.status(400);
    return;
  }

  const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });

  if (!user) {
    res.status(400);
    return;
  }

  await chatsCollection.insertOne({
    _id: new ObjectId(),
    chatname,
    members: [{ id: user_id, username: user.username! }],
    password,
    allowedLanguages,
    languages: [user.language!],
    messages: [],
  });

  res.status(200);
};
