import { RequestHandler } from "express";
import { usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const setUserData: RequestHandler = async (req, res) => {
  const { username, language, id } = req.body;
  if (!id) {
    res.status(400).send({});
    return;
  }

  if (username) {
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { username } }
    );
  }

  if (language) {
    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { language } }
    );
  }

  res.status(200).send({});
};
