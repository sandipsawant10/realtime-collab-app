import { Router } from "express";
import {
  createDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  shareDocument,
} from "../controllers/document.controller.js";
import { verifyToken } from "../middleware/verify.middleware.js";
const router = Router();

router.post("/", verifyToken, createDocument);
router.delete("/:id", verifyToken, deleteDocument);
router.get("/", verifyToken, getDocuments);
router.get("/:id", verifyToken, getDocumentById);
router.post("/share/:id", verifyToken, shareDocument);

export default router;
