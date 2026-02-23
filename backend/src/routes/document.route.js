import { Router } from "express";
import {
  createDocument,
  getDocuments,
  getDocumentById,
} from "../controllers/document.controller.js";
import { verifyToken } from "../middleware/verify.middleware.js";
const router = Router();

router.post("/", verifyToken, createDocument);
router.get("/", verifyToken, getDocuments);
router.get("/:id", verifyToken, getDocumentById);

export default router;
