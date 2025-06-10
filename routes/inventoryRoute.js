const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inv-validation");

// Inventory routes
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.buildEditInventoryView)
);

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

router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
);


router.get(
  "/delete/:inv_id",
  utilities.handleErrors(invController.buildDeleteConfirmationView)
);

router.post(
  "/delete",
  utilities.handleErrors(invController.deleteInventoryItem)
);


module.exports = router;