import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../../db/dbconnection";

export const clearUsers: RequestHandler = async (req, res) => {
  await usersCollection.deleteMany({});
  await chatsCollection.updateMany({}, { $set: { members: [] } });
  res.send("users removed");
};
