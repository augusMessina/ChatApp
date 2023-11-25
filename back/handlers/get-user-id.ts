import { RequestHandler } from "express";
import { usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const getUserId: RequestHandler = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).send({});
    return;
  }

  const user = await usersCollection.findOne({ email });

  res.status(200).send({ id: user?._id });
};
