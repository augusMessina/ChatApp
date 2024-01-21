import { MongoClient, ServerApiVersion } from "mongodb";
import { ChatSchema, UserSchema } from "./schema";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Mongo URI missing");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const connect = async () => {
  console.log("connecting");
  try {
    await client.connect();
    console.log("connected to mongo");
  } catch (error) {
    console.error("Mongo error: ", error);
    throw error;
  }
};
connect();

export const db = client.db("TraduniteDB");
export const usersCollection = db.collection<UserSchema>("Users");
export const chatsCollection = db.collection<ChatSchema>("Chats");
