import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerSocketAuth } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
registerSocketAuth(io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.user?.email);

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

//import routes
import authRouter from "./routes/auth.route.js";

app.use("/auth", authRouter);

export { app, server, io };
