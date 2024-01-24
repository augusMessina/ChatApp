// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import clientPromise from "@/lib/mongodb";
import { UserSchema } from "@/lib/schema";
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

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);
  const usersCollection = db.collection<UserSchema>("Users");

  const users = await usersCollection.find({}).toArray();

  res.send({ users });
}
