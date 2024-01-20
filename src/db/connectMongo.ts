import { MongoClient, ServerApiVersion } from "mongodb";
import { ChatSchema, UserSchema } from "./schema";

const uri = process.env.MONGO_URI;
console.log("my mongo", uri);
if (!uri) {
  throw new Error("Mongo URI missing");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000,
});

const connect = async () => {
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
