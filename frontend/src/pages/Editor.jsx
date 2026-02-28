import { useRef, useEffect } from "react";
import Quill from "quill";
import QuillCursors from "quill-cursors";
import "quill/dist/quill.snow.css";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useState } from "react";
import { useAI } from "../hooks/useAI";
import styles from "./Editor.module.css";

const SAVE_INTERVAL = 2000;

Quill.register("modules/cursors", QuillCursors);

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const wrapperRef = useRef(null);
  const cursorsRef = useRef(null);
  const cursorColorsRef = useRef({});

  const [users, setUsers] = useState([]);
  const {
    aiPrompt,
    setAiPrompt,
    aiResponse,
    setAiResponse,
    aiLoading,
    grammarLoading,
    handleGenerateAI,
    handleImproveGrammar,
  } = useAI(quillRef, id);

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

  const handleInsertAI = () => {
    if (!aiResponse.trim()) return;

    const quill = quillRef.current;
    const range = quill.getSelection(true);

    if (range) {
      quill.insertText(range.index, aiResponse);
    } else {
      quill.insertText(quill.getLength() - 1, aiResponse);
    }
    setAiResponse("");
  };

  return (
    <div className={styles.editorContainer}>
      {/* Header */}
      <div className={styles.editorHeader}>
        <div className={styles.headerContent}>
          <button onClick={() => navigate("/")} className={styles.backBtn}>
            ← Back to Dashboard
          </button>
          <div className={styles.usersInfo}>
            <span className={styles.usersLabel}>
              👥 Active Users ({users.length}):
            </span>
            <div className={styles.usersList}>
              {users.map((user, index) => (
                <span key={user.id || index} className={styles.userBadge}>
                  {user.username || user.email}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className={styles.editorWrapper}>
        <div className={styles.editorContent} ref={wrapperRef}></div>

        {/* AI Assistant Sidebar */}
        <div className={styles.aiSidebar}>
          <h3 className={styles.aiTitle}>✨ AI Assistant</h3>

          <div className={styles.aiSection}>
            <h4 className={styles.aiSectionTitle}>Improve Grammar</h4>
            <p className={styles.aiSectionDescription}>
              Select text in the editor, then click below:
            </p>
            <button
              onClick={handleImproveGrammar}
              disabled={grammarLoading}
              className={styles.aiButton}
            >
              {grammarLoading ? "Improving..." : "✨ Improve Grammar"}
            </button>
          </div>

          <hr className={styles.aiDivider} />

          <div className={styles.aiSection}>
            <h4 className={styles.aiSectionTitle}>Generate Content</h4>
            <textarea
              placeholder="What should AI do?"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className={styles.aiTextarea}
            />
            <button
              onClick={handleGenerateAI}
              disabled={aiLoading}
              className={styles.aiButton}
            >
              {aiLoading ? "Generating..." : "Generate"}
            </button>
          </div>

          {aiResponse && (
            <div className={styles.aiResponse}>
              <div className={styles.aiResponseText}>{aiResponse}</div>
              <button onClick={handleInsertAI} className={styles.insertBtn}>
                Insert into Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
