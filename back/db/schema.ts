import { ObjectId } from "mongodb";
import { User } from "../types/user";
import { Chat } from "../types/chat";

export type UserSchema = Exclude<User, "id"> & {
  _id: ObjectId;
};

export type ChatSchema = Exclude<User, "id"> & {
  _id: ObjectId;
};
