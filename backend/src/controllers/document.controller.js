import Document from "../models/document.model.js";


const createDocument = async (req, res) => {
  const { title } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    const document = await Document.create({
      title,
      owner: req.user._id,
    });
    res.status(201).json({ document });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ owner: req.user._id });
    res.status(200).json({ documents });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDocumentById = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ document });
  } catch (error) {
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
      return res.status(404).json({ message: "Document not found" });
    }
    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateDocument = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  try {
    const document = await Document.findOneAndUpdate(
      {
        _id: id,
        owner: req.user._id,
      },
      { content },
      { new: true },
    );
    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or unauthorized" });
    }
    res.status(200).json({ document });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  createDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  updateDocument,
};
