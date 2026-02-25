import { useRef, useEffect } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const SAVE_INTERVAL = 2000;

export default function Editor() {
  const { id } = useParams();
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const wrapperRef = useRef(null);

  //connect to socket server
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to socket");
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  //initialize quill
  useEffect(() => {
    if (!wrapperRef) return;

    wrapperRef.current.innerHTML = "";
    const editorDiv = document.createElement("div");
    wrapperRef.current.append(editorDiv);

    const quill = new Quill(editorDiv, {
      theme: "snow",
    });

    quill.disable();
    quill.setText("Loading...");

    quillRef.current = quill;
  }, []);

  //join + load document
  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;

    if (!socket || !quill) return;

    socket.once("load-document", (document) => {
      quill.setContents(document);
      quill.enable();
    });

    socket.emit("join-document", id);
  }, [id]);

  //receive changes
  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;

    if (!socket || !quill) return;

    socket.on("receive-changes", (delta) => {
      quill.updateContents(delta);
    });

    return () => {
      socket.off("receive-changes");
    };
  }, []);

  //send changes
  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;

    if (!socket || !quill) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  });

  //auto save
  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;

    if (!socket || !quill) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return <div style={{ height: "100vh" }} ref={wrapperRef}></div>;
}
