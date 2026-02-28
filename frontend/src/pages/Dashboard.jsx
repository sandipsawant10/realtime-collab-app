import { useEffect, useState } from "react";
import {
  fetchDocumentsDb,
  createDocument,
  deleteDocument,
  getDocumentById,
  shareDocument,
} from "../services/docsApi";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";

function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [modalInput, setModalInput] = useState("");
  const [currentDocId, setCurrentDocId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchDocuments = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetchDocumentsDb();
        setDocuments(response.documents || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch documents");
        setTimeout(() => setError(null), 5000);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [navigate]);

  const isOwner = (doc) => {
    if (!user) return false;
    return doc.owner === user._id;
  };

  const handleCreateDoc = () => {
    setModalInput("");
    setShowCreateModal(true);
  };

  const confirmCreateDoc = async () => {
    if (!modalInput.trim()) {
      setError("Please enter a document title");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setShowCreateModal(false);

      const response = await createDocument({ title: modalInput });

      navigate(`/doc/${response.document._id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create document");
      setTimeout(() => setError(null), 5000);
      setLoading(false);
    }
  };

  const handleOpen = async (id) => {
    try {
      setLoading(true);

      const response = await getDocumentById(id);
      navigate(`/doc/${response.document._id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to open document");
      setTimeout(() => setError(null), 5000);
      setLoading(false);
    }
  };

  const handleDelete = async (id, doc) => {
    if (!isOwner(doc)) {
      setError("Only document owner can delete");
      setTimeout(() => setError(null), 5000);
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?",
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);

      await deleteDocument(id);

      setDocuments((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Delete failed");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (id, doc) => {
    if (!isOwner(doc)) {
      setError("Only owner can share document");
      setTimeout(() => setError(null), 5000);
      return;
    }

    setModalInput("");
    setCurrentDocId(id);

    setShowShareModal(true);
  };

  const confirmShare = async () => {
    if (!modalInput.trim()) {
      setError("Please enter an email address");
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setShowShareModal(false);
      setError(null);
      setSuccessMessage(null);

      const response = await shareDocument(currentDocId, modalInput);
      setSuccessMessage(response.message || "Document shared successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Share failed");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardWrapper}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Documents</h1>
            <p className={styles.subtitle}>
              Welcome back, {user?.username || "User"}!
            </p>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={handleCreateDoc}
            className={styles.createBtn}
            disabled={loading}
          >
            ➕ New Document
          </button>
        </div>

        {/* Error message */}
        {error && <div className={styles.errorMessage}>{error}</div>}

        {/* Success message */}
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {/* Loading state */}
        {loading && <div className={styles.loadingMessage}>Loading...</div>}

        {/* Empty state */}
        {!loading && documents.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <h3>No documents yet</h3>
            <p>Create your first document to get started!</p>
          </div>
        )}

        {/* Documents Grid */}
        {!loading && documents.length > 0 && (
          <div className={styles.documentsGrid}>
            {documents.map((doc) => (
              <div key={doc._id} className={styles.documentCard}>
                <div className={styles.cardHeader}>
                  <h3
                    className={styles.docTitle}
                    onClick={() => handleOpen(doc._id)}
                  >
                    {doc.title}
                  </h3>
                  <span className={styles.ownerBadge}>
                    {isOwner(doc) ? "👑 Owner" : "👥 Shared"}
                  </span>
                </div>

                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleOpen(doc._id)}
                    className={styles.openBtn}
                  >
                    Open
                  </button>

                  {isOwner(doc) && (
                    <>
                      <button
                        onClick={() => handleShare(doc._id, doc)}
                        className={styles.shareBtn}
                      >
                        Share
                      </button>
                      <button
                        onClick={() => handleDelete(doc._id, doc)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Document Modal */}
        {showCreateModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={styles.modalTitle}>Create New Document</h3>
              <p className={styles.modalDescription}>
                Enter a title for your new document
              </p>
              <input
                type="text"
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                placeholder="Document title"
                className={styles.modalInput}
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && confirmCreateDoc()}
              />
              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={styles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCreateDoc}
                  className={styles.modalConfirmBtn}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Share Document Modal */}
        {showShareModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowShareModal(false)}
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className={styles.modalTitle}>Share Document</h3>
              <p className={styles.modalDescription}>
                Enter the email address to share with
              </p>
              <input
                type="email"
                value={modalInput}
                onChange={(e) => setModalInput(e.target.value)}
                placeholder="email@example.com"
                className={styles.modalInput}
                autoFocus
                onKeyPress={(e) => e.key === "Enter" && confirmShare()}
              />
              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowShareModal(false)}
                  className={styles.modalCancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmShare}
                  className={styles.modalConfirmBtn}
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
