import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const createChat: RequestHandler = async (req, res) => {
  const { user_id, chatname, password, allowedLanguages } = req.body;
  if (!user_id || !chatname) {
    res.status(400).send({});
    return;
  }

  const user = await usersCollection.findOne({ _id: new ObjectId(user_id) });

  if (!user) {
    res.status(400).send({});
    return;
  }

  let key: number | undefined = undefined;
  if (!password) {
    const chat = await chatsCollection.findOne({ chatname });
    if (chat) {
      res.status(400).send("Chatname already taken");
      return;
    }
  } else {
    key = Math.floor(Math.random() * 90000) + 10000;
  }

  const newChatId = new ObjectId();

  await chatsCollection.insertOne({
    _id: newChatId,
    chatname,
    members: [{ id: user_id, username: user.username! }],
    password: key !== undefined ? `${key}` : key,
    languages: [user.language!],
    messages: [],
    isFriendChat: false,
  });

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $push: {
        chats: { $each: [{ id: newChatId.toString(), chatname, unreads: 0 }] },
      },
    }
  );

  res.status(200).send({ chatname, id: newChatId });
};
