import { Router } from "express";
import { createUser } from "./handlers/create-user";
import { getUsers } from "./handlers/get-users";
import { setUserData } from "./handlers/set-user-data";
import { getUserId } from "./handlers/get-user-id";
import { getUserData } from "./handlers/get-user-data";

export const router = Router();

router.post("/createUser", createUser);

router.post("/getUserData", getUserData);

router.post("/setUserData", setUserData);

router.post("/getUserId", getUserId);

router.get("/getUsers", getUsers);
