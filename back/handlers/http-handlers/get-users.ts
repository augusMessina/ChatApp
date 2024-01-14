import { RequestHandler } from "express";
import { usersCollection } from "../../db/dbconnection";

export const getUsers: RequestHandler = async (req, res) => {
  const users = await usersCollection.find({}).toArray();

  res.send({
    users,
  });
};
