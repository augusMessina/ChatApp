import express from "express";
import { router } from "./router";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { chatsCollection, usersCollection } from "./db/dbconnection";
import { ObjectId } from "mongodb";
import { Message } from "./types/message";

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

io.on("connection", (socket) => {
  console.log("Client connected!");

  socket.on("join", (chatId: string) => {
    socket.join(chatId);
  });

  socket.on(
    "new-message",
    async ({ chatId, authorId, message }: MessageEvent) => {
      console.log("new message", chatId);
      const user = await usersCollection.findOne({
        _id: new ObjectId(authorId),
      });

      console.log(authorId);
      if (user) {
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

        io.to(chatId).emit("new-message", newMessage);
      }
    }
  );
});

server.listen(PORT, () =>
  console.log(`API running on http://localhost:${PORT}`)
);
