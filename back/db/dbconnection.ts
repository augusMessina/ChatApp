import { ChatSchema, UserSchema } from "./schema";
import { MongoClient } from "mongodb";

const client = new MongoClient(`mongodb://mongo:27017`);
await client.connect();

export const db = client.db("MyDatabase");
export const usersCollection = db.collection<UserSchema>("Users");
export const chatsCollection = db.collection<ChatSchema>("Chats");