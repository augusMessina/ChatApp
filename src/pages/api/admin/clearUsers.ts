// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { usersCollection } from "@/db/connectMongo";
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

  await usersCollection.deleteMany({});

  res.send("users removed");
}
