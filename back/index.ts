import express from "express";
import { router } from "./router";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { chatsCollection, usersCollection } from "./db/dbconnection";
import { ObjectId } from "mongodb";
import { Message } from "./types/message";
import { Notif, NotifType } from "./types/notif";

const PORT = 8080;

// HTTP SERVER
const app = express();

app.use(express.json());
app.use(router);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

// WEBSOCKET SERVER

const server = createServer(app);

const io = new Server(server);

type MessageEvent = {
  chatId: string;
  authorId: string;
  message: {
    language: string;
    content: string;
  }[];
};

type NotifEvent = {
  id_sender: string;
  id_receiver: string;
  type: NotifType;
  id_chat?: string;
};

io.on("connection", (socket) => {
  console.log("Client connected!");

  socket.on("login", (userId: string) => {
    socket.join(userId);
  });

  socket.on("join", (chatId: string) => {
    socket.join(chatId);
  });

  socket.on("leave", (chatId: string) => {
    socket.leave(chatId);
  });

  socket.on(
    "new-message",
    async ({ chatId, authorId, message }: MessageEvent) => {
      console.log("new message", chatId);
      const user = await usersCollection.findOne({
        _id: new ObjectId(authorId),
      });

      const chat = await chatsCollection.findOne({ _id: new ObjectId(chatId) });

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

        const chatMembers = chat.members.map(
          (member) => new ObjectId(member.id)
        );
        const members = await usersCollection
          .find({ _id: { $in: chatMembers } })
          .toArray();

        members.forEach(async (member) => {
          let newChats = member.chats;
          newChats.splice(
            newChats.findIndex((memberChat) => memberChat.id === chatId),
            1
          );

          newChats.unshift({ id: chatId, chatname: chat.chatname });
          await usersCollection.updateOne(
            { _id: member._id },
            { $set: { chats: newChats } }
          );
        });

        io.to(chatId).emit("new-message", newMessage);

        members.forEach((member) =>
          io
            .to(member._id.toString())
            .emit("chat-new-message", { chatId, chatname: chat.chatname })
        );
      }
    }
  );

  socket.on("new-notif", async (newNotif: NotifEvent) => {
    const sender = await usersCollection.findOne({
      _id: new ObjectId(newNotif.id_sender),
    });
    const forwardedNotif: Notif = {
      id_sender: newNotif.id_sender,
      type: newNotif.type,
      id_chat: newNotif.id_chat,
      username_sender: sender ? sender.username : "",
    };
    io.to(newNotif.id_receiver).emit("new-notif", forwardedNotif);
  });

  socket.on(
    "accepted-fr",
    async (data: { id_sender: string; user_id: string; chat_id: string }) => {
      const receiver = await usersCollection.findOne({
        _id: new ObjectId(data.user_id),
      });
      console.log("se manda");
      io.to(data.id_sender).emit("accepted-fr", {
        chat_id: data.chat_id,
        chatname: receiver?.username,
      });
    }
  );
});

server.listen(PORT, () =>
  console.log(`API running on http://localhost:${PORT}`)
);
