import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import app from "./app.js";

export const prisma = new PrismaClient();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server started");
});
