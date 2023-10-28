import { RequestHandler } from "express";
import { usersCollection } from "../db/dbconnection";
import { ObjectId } from "mongodb";
import { NotifType } from "../types/notif";

export const sendFriendRequest: RequestHandler = async (req, res) => {
  const { id_receiver, id_sender } = req.body;
  if (!id_receiver || !id_sender) {
    res.status(400);
    return;
  }

  const sender = await usersCollection.findOne({
    _id: new ObjectId(id_sender),
  });
  const receiver = await usersCollection.findOne({
    _id: new ObjectId(id_receiver),
  });

  if (!sender || !receiver) {
    res.status(400);
    return;
  }

  if (
    !receiver.mailbox.some(
      (notif) =>
        notif.id_sender === id_sender && notif.type === NotifType.FRIEND
    )
  ) {
    await usersCollection.updateOne(
      { _id: new ObjectId(id_receiver) },
      {
        $push: {
          mailbox: {
            id_sender,
            username_sender: sender.username,
            type: NotifType.FRIEND,
          },
        },
      }
    );
  }

  res.status(200);
};
