import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import app from "./app.js";
import { CronJob } from "cron";
import { sendAlerts, sendAutoReport } from "./scheduler/scheduler.js";

export const prisma = new PrismaClient();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server started");
});

// new CronJob(
//   // "0 */10 * * * *", // Every 10 minutes at 0 seconds
//   "*/5 * * * * *",
//   () => {
//     sendAutoReport();
//     sendAlerts();
//   },
//   null,
//   true,
//   "UTC"
// );
