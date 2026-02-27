import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { registerSocketAuth } from "./middleware/auth.middleware.js";
import Document from "./models/document.model.js";

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

const activeUsers = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.user?.email);

  const emitUsersInDocument = (documentId) => {
    const usersInDoc = Object.entries(activeUsers)
      .filter(([_, data]) => data.documentId === documentId)
      .map(([_, data]) => data.user);
    io.to(documentId).emit("users-in-document", usersInDoc);
  };

  //JOIN DOCUMENT ROOM
  socket.on("join-document", async (documentId) => {
    try {
      const document = await Document.findById(documentId);
      if (!document) {
        socket.emit("error", "Document not found");
        return;
      }

      if (
        document.owner.toString() !== socket.user._id.toString() &&
        !document.collaborators.includes(socket.user._id)
      ) {
        socket.emit("error", "Access denied");
        return;
      }
      socket.join(documentId);

      activeUsers[socket.id] = {
        documentId,
        user: {
          id: socket.user._id.toString(),
          email: socket.user.email,
          username: socket.user.username,
        },
      };

      emitUsersInDocument(documentId);

      //send existing content to the user
      socket.emit("load-document", document.content);

      //listen for changes
      socket.on("send-changes", (delta) => {
        socket.to(documentId).emit("receive-changes", delta);
      });

      //broadcast cursor position
      socket.on("cursor-move", (cursorData) => {
        socket.to(documentId).emit("receive-cursor", {
          userId: socket.user._id.toString(),
          username: socket.user.username,
          cursor: cursorData,
        });
      });

      //save document
      socket.on("save-document", async (content) => {
        try {
          await Document.findByIdAndUpdate(
            documentId,
            { content },
            { returnDocument: "after" },
          );
        } catch (error) {
          console.error("Error saving document:", error);
        }
      });
    } catch (error) {
      socket.emit("error", "An error occurred while joining the document");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    const userData = activeUsers[socket.id];
    if (userData) {
      const { documentId } = userData;
      delete activeUsers[socket.id];
      emitUsersInDocument(documentId);
    }
  });
});

//import routes
import authRouter from "./routes/auth.route.js";
import documentRouter from "./routes/document.route.js";
import aiRouter from "./routes/ai.route.js";

app.use("/auth", authRouter);
app.use("/documents", documentRouter);
app.use("/ai", aiRouter);

export { app, server, io };
