import { RequestHandler } from "express";
import { usersCollection } from "../../db/dbconnection";
import { ObjectId } from "mongodb";
import { UserSchema } from "../../db/schema";

export const getPublicUsers: RequestHandler = async (req, res) => {
  const { userId, username } = req.body;
  if (!userId) {
    res.status(400).send({});
    return;
  }

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
};
