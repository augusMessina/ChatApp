import { ObjectId } from "mongodb";
import { User } from "../types/user";
import { Chat } from "../types/chat";

export type UserSchema = Omit<User, "id"> & {
  _id: ObjectId;
};

export type ChatSchema = Omit<Chat, "id"> & {
  _id: ObjectId;
};
