import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const registerSocketAuth = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      return next();
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });
};

export { registerSocketAuth };
