// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "@/lib/mongodb";
import { UserSchema } from "@/lib/schema";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId, username } = req.body;
  if (!userId) {
    res.status(400).send({});
    return;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);
  const usersCollection = db.collection<UserSchema>("Users");

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

  if (!user) {
    res.status(400).send({});
    return;
  }

  let users: UserSchema[] = [];

  if (username) {
    users = await usersCollection
      .find({
        username: { $regex: `^${username}`, $options: "i" },
      })
      .toArray();
  } else {
    users = await usersCollection.find({}).toArray();
  }

  res.send({
    users: users
      .filter(
        (publicUser) =>
          publicUser._id.toString() !== userId &&
          !user.friendList.some(
            (friend) => friend.friendId === publicUser._id.toString()
          ) &&
          publicUser.username &&
          publicUser.username !== "default_username"
      )
      .map((user) => ({
        username: user.username,
        id: user._id.toString(),
        language: user.language,
      })),
  });
}
