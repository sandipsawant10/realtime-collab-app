import Router from "express";
import {
  generateContent,
  improveGrammar,
  generateContentForDocument,
} from "../controllers/ai.controller.js";
import {verifyToken} from "../middleware/verify.middleware.js";

const router = Router();

router.post("/generate-content", verifyToken, generateContent);
router.post("/improve-grammar", verifyToken, improveGrammar);
router.post("/generate-content-for-document", verifyToken, generateContentForDocument);

export default router;