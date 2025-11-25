import express from "express";
import { ConsignmentController } from "../controllers/consignment.controller";

const router = express.Router();
const controller = new ConsignmentController();

router.get("/:id/pdf", controller.generatePDF);

export default router;
