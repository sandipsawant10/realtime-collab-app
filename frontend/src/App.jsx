import { useEffect } from "react";
import { io } from "socket.io-client";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Editor from "quill/core/editor";

function App() {
  useEffect(() => {
    const socket = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("token") || null,
      },
    });

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <h1>Welcome to the Frontend!</h1>
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doc/:id" element={<Editor />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
