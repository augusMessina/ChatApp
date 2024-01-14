import { RequestHandler } from "express";
import { usersCollection } from "../../db/dbconnection";
import { ObjectId } from "mongodb";

export const createUser: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).send({});
    return;
  }

  const user = await usersCollection.findOne({ email });
  const userId = new ObjectId();

  if (!user) {
    await usersCollection.insertOne({
      _id: userId,
      email,
      username: "default_username",
      password: password ?? undefined,
      language: "no_language",
      chats: [],
      friendList: [],
      mailbox: [],
      outgoingRequests: [],
    });

    res.status(200).send({
      id: userId,
      username: "default_username",
      language: "default_language",
    });
    return;
  }

  if (user.password && user.password === password) {
    res.status(200).send({ id: user._id.toString(), username: user.username });
    return;
  } else if (!user.password) {
    res.status(200).send({ id: user._id.toString(), username: user.username });
    return;
  } else if (user.username === "default_username" && password) {
    await usersCollection.updateOne({ _id: user._id }, { $set: { password } });
    res.status(200).send({ id: user._id.toString(), username: user.username });
    return;
  }

  res.status(400).send({});
};