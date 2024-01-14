import { RequestHandler } from "express";
import { chatsCollection, usersCollection } from "../../db/dbconnection";
import { ObjectId } from "mongodb";
import { NotifType } from "../../types/notif";

export const sendChatInvitation: RequestHandler = async (req, res) => {
  const { id_receiver, id_sender, id_chat } = req.body;
  if (!id_receiver || !id_sender || !id_chat) {
    res.status(400);
    return;
  }

  const sender = await usersCollection.findOne({
    _id: new ObjectId(id_sender),
  });
  const receiver = await usersCollection.findOne({
    _id: new ObjectId(id_receiver),
  });

  const chat = await chatsCollection.findOne({ _id: new ObjectId(id_chat) });

  if (!sender || !receiver) {
    res.status(400);
    return;
  }

  if (
    !receiver.mailbox.some(
      (notif) =>
        notif.id_sender === id_sender &&
        notif.type === NotifType.CHAT &&
        notif.id_chat === id_chat
    ) &&
    !sender.outgoingRequests.some(
      (request) =>
        request.type === NotifType.CHAT &&
        request.id_receiver === id_receiver &&
        request.id_chat === id_chat
    )
  ) {
    await usersCollection.updateOne(
      { _id: new ObjectId(id_receiver) },
      {
        $push: {
          mailbox: {
            id_sender,
            username_sender: sender.username!,
            type: NotifType.CHAT,
            id_chat,
            chatname: chat?.chatname,
          },
        },
      }
    );
    await usersCollection.updateOne(
      { _id: new ObjectId(id_sender) },
      {
        $push: {
          outgoingRequests: {
            id_receiver,
            type: NotifType.CHAT,
          },
        },
      }
    );
  }

  res.status(200).send({});
};
