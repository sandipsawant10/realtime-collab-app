import { useEffect, useState } from "react";
import {
  fetchDocumentsDb,
  createDocument,
  deleteDocument,
  getDocumentById,
  shareDocument,
} from "../services/docsApi";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleCreateDoc = async () => {
    try {
      setLoading(true);

      const title = prompt("Enter document title:");
      if (!title) {
        setLoading(false);
        return;
      }

      const response = await createDocument({ title });

      navigate(`/doc/${response.document._id}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create document");
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
      setLoading(false);
    }
  };

  const handleDelete = async (id, doc) => {
    if (!isOwner(doc)) {
      setError("Only document owner can delete");
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
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (id, doc) => {
    if (!isOwner(doc)) {
      setError("Only owner can share document");
      return;
    }

    const email = prompt("Enter email to share with:");
    if (!email) return;

    try {
      setLoading(true);

      const response = await shareDocument(id, email);
      alert(response.message);
    } catch (err) {
      console.error(err);
      setError(err.message || "Share failed");
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
    <div>
      <h1>📄 Dashboard</h1>

      <div>
        <button onClick={handleCreateDoc}>➕ New Document</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && documents.length === 0 && (
        <p>No documents found. Create one!</p>
      )}

      <ul>
        {documents.map((doc) => (
          <li key={doc._id}>
            <strong onClick={() => handleOpen(doc._id)}>{doc.title}</strong>

            <button onClick={() => handleOpen(doc._id)}>Open</button>

            {isOwner(doc) && (
              <>
                <button onClick={() => handleDelete(doc._id, doc)}>
                  Delete
                </button>

                <button onClick={() => handleShare(doc._id, doc)}>Share</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
