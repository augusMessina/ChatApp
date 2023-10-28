import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const createMessage: RequestHandler = async (req, res) => {
  const { chat_id, message, author } = req.body;
  if (!chat_id || !message || author) {
    res.status(400);
    return;
  }

  await chatsCollection.updateOne(
    { _id: new ObjectId(chat_id) },
    {
      $push: {
        messages: {
          id: new ObjectId().toString(),
          author,
          message,
          timestamp: new Date().getTime(),
        },
      },
    }
  );

  res.status(200);
};
