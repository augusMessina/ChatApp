import { chatsCollection, usersCollection } from "@/db/connectMongo";
import { User } from "@/types/user";
import { ObjectId } from "mongodb";

export const getUserData = async (
  id: string
): Promise<Omit<User, "id" | "email"> | void> => {
  const user = await usersCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!user) {
    return;
  }

  user.chats = await Promise.all(
    user.chats.map(async (chat) => {
      if (chat.chatname) return chat;
      const chatObj = await chatsCollection.findOne({
        _id: new ObjectId(chat.id),
      });

      return {
        id: chat.id,
        chatname: chatObj!.members
          .filter((member) => member.id !== user._id.toString())
          .map((member) => member.username)
          .join(", "),
        unreads: chat.unreads,
      };
    })
  );

  return {
    chats: user.chats,
    friendList: user.friendList,
    mailbox: user.mailbox,
    language: user.language,
    outgoingRequests: user.outgoingRequests,
    username: user.username,
  };
};
