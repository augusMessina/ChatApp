import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";
import { ChatSchema } from "../db/schema";

export const joinChat: RequestHandler = async (req, res) => {
  const { chatId, userId, chatname, password } = req.body;
  if (!userId || (!chatId && (!chatname || !password))) {
    res.status(400).send({});
    return;
  }

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  let chat: ChatSchema | null;
  if (chatId) {
    chat = await chatsCollection.findOne({
      _id: new ObjectId(chatId),
    });
  } else {
    chat = await chatsCollection.findOne({
      chatname,
      password,
    });
  }

  if (!user || !chat) {
    res.status(400).send({});
    return;
  }

  if (chat.languages.includes(user.language!)) {
    await chatsCollection.updateOne(
      { _id: chat._id },
      {
        $push: {
          members: { username: user.username, id: user._id.toString() },
        },
      }
    );
  } else {
    await chatsCollection.updateOne(
      { _id: chat._id },
      {
        $push: {
          members: { username: user.username, id: user._id.toString() },
          languages: user.language,
        },
      }
    );
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $push: {
        chats: {
          $each: [{ chatname: chat.chatname, id: chat._id.toString() }],
          $position: 0,
        },
      },
    }
  );

  res.status(200).send({ id: chat._id.toString(), chatname: chat.chatname });
};
