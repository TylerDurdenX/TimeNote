import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import globalErrorHandler from "./controller/errorController.js";
import router from "./routes/userRouter.js";
import {
  authenticateThirdParty,
  generateToken,
} from "./middleware/generateToken.js";

const app = express();
dotenv.config();
// app.use(cookieParser)

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));

app.use("/api/user", router);
app.get("/generate-token", generateToken);
app.post("/authenticate", authenticateThirdParty);

app.get("/", (req, res) => {
  res.send("This is home");
});

app.all("/jj", (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
