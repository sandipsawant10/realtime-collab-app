import { Router } from "express";
import {
  createDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  updateDocument,
} from "../controllers/document.controller.js";
import { verifyToken } from "../middleware/verify.middleware.js";
const router = Router();

router.post("/", verifyToken, createDocument);
router.put("/:id", verifyToken, updateDocument);
router.delete("/:id", verifyToken, deleteDocument);
router.get("/", verifyToken, getDocuments);
router.get("/:id", verifyToken, getDocumentById);

export default router;
