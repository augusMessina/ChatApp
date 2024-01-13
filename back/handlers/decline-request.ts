import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";
import { NotifType } from "../types/notif";

export const declineRequest: RequestHandler = async (req, res) => {
  const { id_sender, id_user, id_chat } = req.body;
  if (!id_sender || !id_user) {
    res.status(400);
    return;
  }

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

  res.status(200).send();
};
