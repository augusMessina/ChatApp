import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";
import { ChatSchema } from "../db/schema";

export const createMessage: RequestHandler = async (req, res) => {
  const { chat_id, message, author } = req.body;
  if (!chat_id || !message || author) {
    res.status(400);
    return;
  }

  const chat = await chatsCollection.findOne({ _id: new ObjectId(chat_id) });

  if (!chat) {
    res.status(400).send({});
    return;
  }

  await chatsCollection.updateOne(
    { _id: chat._id },
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

  const chatMembers = chat.members.map((member) => new ObjectId(member.id));
  const members = await usersCollection
    .find({ _id: { $in: chatMembers } })
    .toArray();

  members.forEach(async (member) => {
    let newChats = member.chats;
    newChats.splice(
      newChats.findIndex((memberChat) => memberChat.id === chat_id),
      1
    );
    newChats.unshift({ id: chat_id, chatname: chat.chatname });
    await usersCollection.updateOne(
      { _id: member._id },
      { $set: { chats: newChats } }
    );
  });

  res.status(200).send({});
};
