// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import { ChatSchema, UserSchema } from "@/lib/schema";
import pusher from "@/lib/pusher";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username, language, id } = req.body;
  if (!id || !username || !language) {
    res.status(400).send({});
    return;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);
  const usersCollection = db.collection<UserSchema>("Users");
  const chatsCollection = db.collection<ChatSchema>("Chats");

  const user = await usersCollection.findOne({ _id: new ObjectId(id) });

  if (username !== user?.username) {
    const otherUser = await usersCollection.findOne({ username });
    if (otherUser) {
      res.status(200).send({ message: "username already taken" });
      return;
    }

    await usersCollection.updateOne({ _id: user?._id }, { $set: { username } });

    user?.chats.forEach(async (chat) => {
      const chatInDB = await chatsCollection.findOne({
        _id: new ObjectId(chat.id),
      });
      const newMembers = chatInDB?.members.map((member) => {
        if (member.id === user._id.toString()) {
          return { ...member, username };
        }
        return member;
      });
      await chatsCollection.updateOne(
        { _id: new ObjectId(chat.id) },
        { $set: { members: newMembers } }
      );
    });

    user?.friendList.forEach(async (friend) => {
      const friendInDB = await usersCollection.findOne({
        _id: new ObjectId(friend.friendId),
      });
      const newFriendList = friendInDB?.friendList.map((friend) => {
        if (friend.friendId === user._id.toString()) {
          return { ...friend, friendName: username };
        }
        return friend;
      });
      await usersCollection.updateOne(
        { _id: new ObjectId(friend.friendId) },
        { $set: { friendList: newFriendList } }
      );
    });
  }

  if (language !== user?.language) {
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { language } }
    );

    await Promise.all(
      (user?.chats || []).map(async (chat) => {
        const chatInDB = await chatsCollection.findOne({
          _id: new ObjectId(chat.id),
        });
        const newChatLangs: string[] = [];

        await Promise.all(
          (chatInDB?.members || []).map(async (member) => {
            const memberInDB = await usersCollection.findOne({
              _id: new ObjectId(member.id),
            });
            if (
              memberInDB?.language &&
              !newChatLangs.includes(memberInDB.language)
            ) {
              newChatLangs.push(memberInDB.language);
            }
          })
        );

        await chatsCollection.updateOne(
          { _id: new ObjectId(chat.id) },
          { $set: { languages: newChatLangs } }
        );
      })
    );
  }

  user?.friendList.forEach(async (friend) => {
    const friendChat = await chatsCollection.findOne({
      isFriendChat: true,
      members: {
        $in: [
          { id: id, username: user.username },
          { id: friend.friendId, username: friend.friendName },
        ],
      },
    });
    await pusher.trigger(friend.friendId, "friend-data-updated", {
      friendId: id,
      friendName: username,
      chatId: friendChat?._id.toString(),
    });
  });
  user?.chats.forEach(async (chat) => {
    const chatObj = await chatsCollection.findOne({
      _id: new ObjectId(chat.id),
    });
    await pusher.trigger(chat.id, "member-data-updated", {
      memberId: id,
      memberName: username,
      chatLangs: chatObj?.languages,
    });
  });

  res.status(200).send({});
}
