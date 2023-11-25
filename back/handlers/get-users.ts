import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";

export const getUsers: RequestHandler = async (req, res) => {
  const users = await usersCollection.find({}).toArray();

  res.send({
    users,
  });
};
