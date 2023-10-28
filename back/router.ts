import { Router } from "express";
import { createUser } from "./handlers/create-user";

export const router = Router();

router.post("/createUser", createUser);
