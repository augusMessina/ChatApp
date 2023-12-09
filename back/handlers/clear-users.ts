import { RequestHandler } from "express";
import { usersCollection } from "../db/dbconnection";

export const clearUsers: RequestHandler = async (req, res) => {
  await usersCollection.deleteMany({});
  res.send("users removed");
};
