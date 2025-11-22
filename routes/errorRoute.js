const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const errorController = require("../controllers/errorController")

// Route to intentionally trigger a server error for testing
router.get("/test", utilities.handleErrors(errorController.triggerError))

module.exports = router
