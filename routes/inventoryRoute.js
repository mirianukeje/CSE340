// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")

// Management view
router.get("/", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement))

// Add classification
router.get("/add-classification", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification))
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassData,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.addClassification)
)

// Add inventory
router.get("/add-inventory", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory))
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.checkEmployeeOrAdmin,
  utilities.handleErrors(invController.addInventory)
)

// Update inventory item
router.post("/update", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.updateInventory))

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory item detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Get inventory by classification for management table (JSON)
router.get("/getInventory/:classification_id", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.getInventoryJSON))

// Route to build inventory edit view
router.get("/edit/:invId", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildEditInventory))

module.exports = router;
