import axios from "axios";
const url = "http://localhost:5000/documents";

const axiosInstance = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to dynamically add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const fetchDocumentsDb = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data;
  } catch (error) {
    throw error || "Error fetching documents";
  }
};

const createDocument = async () => {
  try {
    const response = await axiosInstance.post("/", {
      title: "Untitled Document",
      content: {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error || "Error creating document";
  }
};

const deleteDocument = async (id) => {
  if (!id) throw new Error("Document ID is required");
  try {
    const response = await axiosInstance.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error || "Error deleting document";
  }
};


const getDocumentById = async (id) => {
  if (!id) throw new Error("Document ID is required");
  try {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error || "Error fetching document";
  }
};

const shareDocument = async (id, email) => {
  if (!id) throw new Error("Document ID is required");
  if (!email) throw new Error("Email is required");

  try {
    const response = await axiosInstance.post(`/share/${id}`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error || "Error sharing document";
    
  }
}

export {
  fetchDocumentsDb,
  createDocument,
  deleteDocument,
  getDocumentById,
  shareDocument,
};
