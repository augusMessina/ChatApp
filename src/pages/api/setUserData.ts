// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chatsCollection, usersCollection } from "@/db/connectMongo";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { username, language, id } = req.body;
  if (!id) {
    res.status(400).send({});
    return;
  }

  const user = await usersCollection.findOne({ _id: new ObjectId(id) });

  if (username) {
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

  if (language) {
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

  res.status(200).send({});
}
