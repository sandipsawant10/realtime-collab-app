import { useEffect, useState } from "react";
import {
  fetchDocumentsDb,
  createDocument,
  deleteDocument,
  getDocumentById,
  updateDocument,
} from "../services/docsApi";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [noDocs, setNoDocs] = useState(false);

  useEffect(() => {
    //fetch documents
    const fetchDocuments = async () => {
      if (!localStorage.getItem("token")) {
        navigate("/login");
        setError("You must be logged in to view documents");
        setLoading(false);
        return;
      }
      try {
        setError(null);
        setLoading(true);
        const response = await fetchDocumentsDb();
        setDocuments(response.documents);
        if (response.documents.length === 0) {
          setNoDocs(true);
        }
        setLoading(false);
        console.log(response);
      } catch (error) {
        setError(error.message);
        setLoading(false);
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, []);

  // if (loading) return <p>Loading...</p>;
  // if (error) return <p>{error}</p>;
  // if (noDocs) return <p>No documents found</p>;

  const handleCreateDoc = async () => {
    try {
      setLoading(true);
      const response = await createDocument();
      setDocuments((prev) => [...prev, response.document]);
      navigate(`/doc/${response.document._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deleteDocument(id);
      console.log(response.message);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleUpdate = async (id, content) => {
    try {
      setLoading(true);
      const response = await updateDocument(id, content);
      setDocuments((prev) =>
        prev.map((doc) => (doc._id === id ? response.document : doc)),
      );
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleOpen = async (id) => {
    try {
      setLoading(true);
      const response = await getDocumentById(id);
      navigate(`/doc/${response.document._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  return (
    <div>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      >
        Logout
      </button>
      <button onClick={handleCreateDoc}>New Document</button>
      <h1>Dashboard</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {documents.map((document) => (
          <li key={document._id}>
            <a href={`/doc/${document._id}`}>{document.title}</a>
            <button onClick={() => handleOpen(document._id)}>Open</button>
            <button onClick={() => handleDelete(document._id)}>Delete</button>
            <button
              onClick={() => handleUpdate(document._id, document.content)}
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
      {noDocs && (
        <p>
          No documents found.{" "}
          <button onClick={handleCreateDoc}>Create a new one!</button>
        </p>
      )}
    </div>
  );
}

export default Dashboard;
