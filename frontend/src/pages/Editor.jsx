import { useRef, useEffect } from "react";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "quill/dist/quill.snow.css";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useState } from "react";

const SAVE_INTERVAL = 2000;

Quill.register("modules/cursors", QuillCursors);

export default function Editor() {
  const { id } = useParams();
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const wrapperRef = useRef(null);
  const cursorsRef = useRef(null);
  const cursorColorsRef = useRef({});

  const [users, setUsers] = useState([]);

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

    socket.on("users-in-document", (users) => {
      setUsers(users);
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
      modules: {
        cursors: true,
      },
    });

    quill.disable();
    quill.setText("Loading...");

    quillRef.current = quill;
    cursorsRef.current = quill.getModule("cursors");
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

      const selection = quill.getSelection();
      if (selection) {
        socket.emit("cursor-move", {
          index: selection.index,
          length: selection.length,
        });
      }
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, []);

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

  const getCursorColor = (userId) => {
    if (!cursorColorsRef.current[userId]) {
      const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      cursorColorsRef.current[userId] = color.padEnd(7, "0");
    }
    return cursorColorsRef.current[userId];
  };

  //cursor send
  useEffect(() => {
    const socket = socketRef.current;
    const quill = quillRef.current;

    if (!socket || !quill) return;

    const handler = (range, oldRange, source) => {
      if (range && source === "user") {
        socket.emit("cursor-move", {
          index: range.index,
          length: range.length,
        });
      }
    };

    quill.on("selection-change", handler);

    return () => {
      quill.off("selection-change", handler);
    };
  }, []);

  //cursor receive
  useEffect(() => {
    const socket = socketRef.current;
    const cursors = cursorsRef.current;

    if (!socket || !cursors) return;

    const handler = (data) => {
      const { userId, username, cursor } = data;
      const color = getCursorColor(userId);
      cursors.createCursor(userId, username, color);
      cursors.moveCursor(userId, cursor);
      cursors.toggleFlag(userId, true);
    };

    socket.on("receive-cursor", handler);

    return () => {
      socket.off("receive-cursor", handler);
    };
  }, []);

  //remove cursors for users who left
  useEffect(() => {
    const cursors = cursorsRef.current;
    if (!cursors) return;

    const activeIds = new Set(users.map((user) => user.id));
    Object.keys(cursorColorsRef.current).forEach((userId) => {
      if (!activeIds.has(userId)) {
        cursors.removeCursor(userId);
        delete cursorColorsRef.current[userId];
      }
    });
  }, [users]);

  return (
    <div>
      <div
        style={{
          padding: "10px",
          background: "#b97e07",
          borderBottom: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>
          Active Users ({users.length}):
        </span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {users.map((user, index) => (
            <span
              key={user.id || index}
              style={{
                padding: "4px 8px",
                background: "#007bff",
                color: "white",
                borderRadius: "12px",
                fontSize: "12px",
              }}
            >
              {user.username || user.email}
            </span>
          ))}
        </div>
      </div>
      <div style={{ height: "calc(100vh - 50px)" }} ref={wrapperRef}></div>
    </div>
  );
}
