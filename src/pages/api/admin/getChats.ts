// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { chatsCollection } from "@/db/connectMongo";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { role, key } = req.body;
  if (role !== "admin" && key !== process.env.ADMIN_KEY) {
    res.status(401).send({});
    return;
  }

  const chats = await chatsCollection.find({}).toArray();

  res.send({ chats });
}