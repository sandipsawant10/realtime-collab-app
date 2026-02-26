import Document from "../models/document.model.js";
import User from "../models/user.model.js";

const createDocument = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const document = await Document.create({
      title,
      owner: req.user._id,
      content: "",
      collaborators: [],
    });

    res.status(201).json({ document });
  } catch (error) {
    console.error("Create Document Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ documents });
  } catch (error) {
    console.error("Get Documents Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findOne({
      _id: id,
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ document });
  } catch (error) {
    console.error("Get Document Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, title } = req.body;

    const document = await Document.findOne({
      _id: id,
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    });

    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or unauthorized" });
    }

    if (content !== undefined) document.content = content;
    if (title !== undefined) document.title = title;

    await document.save();

    res.status(200).json({ document });
  } catch (error) {
    console.error("Update Document Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or unauthorized" });
    }

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete Document Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const shareDocument = async (req, res) => {
  try {
    const { email } = req.body;
    const { id } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const document = await Document.findOne({
      _id: id,
      owner: req.user._id,
    });

    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or unauthorized" });
    }

    if (document.collaborators.includes(user._id)) {
      return res.status(400).json({ message: "User already has access" });
    }

    document.collaborators.push(user._id);
    await document.save();

    res.status(200).json({ message: "Document shared successfully" });
  } catch (error) {
    console.error("Share Document Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  shareDocument,
};
