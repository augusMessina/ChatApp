import express from "express";
import { router } from "./router";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(router);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);

app.listen(3001, () => console.log("API running on http://localhost:3001s"));
