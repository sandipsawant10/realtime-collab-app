import { app, server } from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
