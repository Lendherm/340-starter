const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inv-validation");

// Public routes
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInventoryId));
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Protected routes
router.get(
  "/",
  utilities.checkLogin,
  utilities.checkAccountType(['Employee', 'Admin']),
  utilities.handleErrors(invController.buildManagementView)
);

router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType(['Employee', 'Admin']),
  utilities.handleErrors(invController.buildAddClassification)
);

router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType(['Employee', 'Admin']),
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
);

router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType(['Employee', 'Admin']),
  utilities.handleErrors(invController.buildAddInventory)
);

router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType(['Employee', 'Admin']),
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
);

router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType(['Employee', 'Admin']),
  utilities.handleErrors(invController.buildEditInventoryView)
);

router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkAccountType(['Employee', 'Admin']),
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

router.get(
  "/delete/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType(['Employee', 'Admin']),
  utilities.handleErrors(invController.buildDeleteConfirmationView)
);

router.post(
  "/delete",
  utilities.checkLogin,
  utilities.checkAccountType(['Employee', 'Admin']),
  utilities.handleErrors(invController.deleteInventoryItem)
);

module.exports = router;