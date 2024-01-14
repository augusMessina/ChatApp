import { Router } from "express";
import { createUser } from "./handlers/http-handlers/create-user";
import { getUsers } from "./handlers/http-handlers/get-users";
import { setUserData } from "./handlers/http-handlers/set-user-data";
import { getUserData } from "./handlers/http-handlers/get-user-data";
import { createChat } from "./handlers/http-handlers/create-chat";
import { clearUsers } from "./handlers/http-handlers/clear-users";
import { getPublicChats } from "./handlers/http-handlers/get-public-chats";
import { clearChats } from "./handlers/http-handlers/clear-chats";
import { getChatData } from "./handlers/http-handlers/get-chat-data";
import { joinChat } from "./handlers/http-handlers/join-chat";
import { getPublicUsers } from "./handlers/http-handlers/get-public-users";
import { sendFriendRequest } from "./handlers/http-handlers/send-friend-request";
import { acceptFriendRequest } from "./handlers/http-handlers/accept-friend-request";
import { getChats } from "./handlers/http-handlers/get-chats";
import { sendChatInvitation } from "./handlers/http-handlers/send-chat-invitation";
import { acceptChatRequest } from "./handlers/http-handlers/accept-chat-invitation";
import { deleteFriend } from "./handlers/http-handlers/delete-friend";
import { leaveChat } from "./handlers/http-handlers/leave-chat";
import { declineRequest } from "./handlers/http-handlers/decline-request";

export const router = Router();

router.post("/createUser", createUser);

router.post("/getUserData", getUserData);
router.post("/getChatData", getChatData);

router.post("/setUserData", setUserData);

router.post("/createChat", createChat);
router.post("/joinChat", joinChat);

router.post("/clearUsers", clearUsers);
router.post("/clearChats", clearChats);

router.get("/getUsers", getUsers);
router.get("/getChats", getChats);
router.post("/getPublicUsers", getPublicUsers);
router.post("/getPublicChats", getPublicChats);

router.post("/sendFriendRequest", sendFriendRequest);
router.post("/acceptFriendRequest", acceptFriendRequest);
router.post("/declineRequest", declineRequest);

router.post("/sendChatInvitation", sendChatInvitation);
router.post("/acceptChatInvitation", acceptChatRequest);

router.post("/deleteFriend", deleteFriend);
router.post("/leaveChat", leaveChat);
