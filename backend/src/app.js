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

io.on("connection", (socket) => {
  console.log("User connected:", socket.user?.email);

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

      //send existing content to the user
      socket.emit("load-document", document.content);

      //listen for changes
      socket.on("edit-document", async (delta) => {
        socket.to(documentId).emit("receive-changes", delta);

        //save
        socket.on("save-document", async (content) => {
          socket.on("save-document", async (content) => {
            await Document.findByIdAndUpdate(
              documentId,
              { content },
              { new: true },
            );
          });
        });
      });
    } catch (error) {
      socket.emit("error", "An error occurred while joining the document");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

//import routes
import authRouter from "./routes/auth.route.js";
import documentRouter from "./routes/document.route.js";

app.use("/auth", authRouter);
app.use("/documents", documentRouter);

export { app, server, io };
