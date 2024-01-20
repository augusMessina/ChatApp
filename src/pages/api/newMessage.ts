// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chatsCollection, usersCollection } from "@/db/connectMongo";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import { pusher } from "../../pusher/pusher";
import { Message } from "@/types/message";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { chatId, authorId, chatname, message } = req.body;
  if (!authorId || (!chatId && (!chatname || !message))) {
    res.status(400).send({});
    return;
  }

  const user = await usersCollection.findOne({
    _id: new ObjectId(authorId),
  });

  const chat = await chatsCollection.findOne({
    _id: new ObjectId(chatId),
  });

  if (user && chat) {
    const newMessage: Message = {
      author: {
        authorId,
        authorName: user?.username,
      },
      id: new ObjectId().toString(),
      message: message,
      timestamp: new Date().getTime(),
    };
    await chatsCollection.updateOne(
      { _id: new ObjectId(chatId) },
      { $push: { messages: newMessage } }
    );

    const chatMembers = chat.members.map((member) => new ObjectId(member.id));
    const members = await usersCollection
      .find({ _id: { $in: chatMembers } })
      .toArray();

    members.forEach(async (member) => {
      let newChats = member.chats;
      const chatUnreads =
        newChats[newChats.findIndex((memberChat) => memberChat.id === chatId)]
          .unreads;
      newChats.splice(
        newChats.findIndex((memberChat) => memberChat.id === chatId),
        1
      );

      newChats.unshift({
        id: chatId,
        chatname: chat.chatname,
        unreads: chatUnreads + 1,
      });
      await usersCollection.updateOne(
        { _id: member._id },
        { $set: { chats: newChats } }
      );
    });

    await pusher.trigger(chatId, "new-message", newMessage);

    members.forEach(
      async (member) =>
        await pusher.trigger(member._id.toString(), "chat-new-message", {
          chatId,
          chatname:
            chat.chatname ??
            chat.members
              .filter((chatmember) => chatmember.id !== member._id.toString())
              .map((member) => member.username)
              .join(", "),
        })
    );
  }

  res.status(200).send({});
}
