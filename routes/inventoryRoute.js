const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");

// Inventory routes
router.get("/type/:classificationId(\\d+)", invController.buildByClassificationId);
router.get("/detail/:inv_id(\\d+)", invController.buildByInventoryId);
router.get("/trigger-error", invController.triggerError);

module.exports = router;
