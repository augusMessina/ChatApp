// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import clientPromise from "@/lib/mongodb";
import { UserSchema } from "@/lib/schema";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id_sender, id_user, id_chat } = req.body;
  if (!id_sender || !id_user) {
    res.status(400);
    return;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);
  const usersCollection = db.collection<UserSchema>("Users");

  const user = await usersCollection.findOne({
    _id: new ObjectId(id_user),
  });

  if (!user) {
    res.status(400);
    return;
  }

  await usersCollection.updateOne(
    { _id: user._id },
    {
      $pull: { mailbox: { id_sender, id_chat } },
    }
  );

  res.status(200).send({});
}
