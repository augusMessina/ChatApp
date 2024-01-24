import clientPromise from "@/lib/mongodb";
import { ChatSchema, UserSchema } from "@/lib/schema";
import { ObjectId } from "mongodb";

export const createUser = async (email: string, password?: string) => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);
  const usersCollection = db.collection<UserSchema>("Users");

  const user = await usersCollection.findOne({ email });
  const userId = new ObjectId();

  if (!user) {
    await usersCollection.insertOne({
      _id: userId,
      email,
      username: "default_username",
      password: password ?? undefined,
      language: "no_language",
      chats: [],
      friendList: [],
      mailbox: [],
      outgoingRequests: [],
    });

    return {
      id: userId.toString(),
      username: "default_username",
      language: "default_language",
    };
  }

  if (user.password && user.password === password) {
    return { id: user._id.toString(), username: user.username };
  } else if (!user.password) {
    return { id: user._id.toString(), username: user.username };
  } else if (user.username === "default_username" && password) {
    await usersCollection.updateOne({ _id: user._id }, { $set: { password } });
    return { id: user._id.toString(), username: user.username };
  }

  return;
};
