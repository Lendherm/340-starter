const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inv-validation");

// Inventory routes
router.get("/type/:classificationId(\\d+)", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inv_id(\\d+)", utilities.handleErrors(invController.buildByInventoryId));
router.get("/trigger-error", utilities.handleErrors(invController.triggerError));

// Management routes
router.get("/", utilities.handleErrors(invController.buildManagementView));

// Classification routes
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

// Inventory routes
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

module.exports = router;