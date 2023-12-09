import { Router } from "express";
import { createUser } from "./handlers/create-user";
import { getUsers } from "./handlers/get-users";
import { setUserData } from "./handlers/set-user-data";
import { getUserId } from "./handlers/get-user-id";
import { getUserData } from "./handlers/get-user-data";
import { createChat } from "./handlers/create-chat";
import { clearUsers } from "./handlers/clear-users";
import { getPublicChats } from "./handlers/get-public-chats";
import { clearChats } from "./handlers/clear-chats";
import { getChatData } from "./handlers/get-chat-data";

export const router = Router();

router.post("/createUser", createUser);

router.post("/getUserData", getUserData);
router.post("/getChatData", getChatData);

router.post("/setUserData", setUserData);

router.post("/getUserId", getUserId);
router.post("/createChat", createChat);

router.post("/clearUsers", clearUsers);
router.post("/clearChats", clearChats);

router.get("/getUsers", getUsers);
router.get("/getPublicChats", getPublicChats);
