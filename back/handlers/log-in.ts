import { RequestHandler } from "express";
import { usersCollection } from "../db/dbconnection";

export const logIn: RequestHandler = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    return;
  }
  const user = await usersCollection.findOne({ email });

  if (user) {
    res.status(200).send({ id: user._id.toString() });
  } else {
    res.status(202);
  }
};
