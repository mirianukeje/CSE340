// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Default account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))
// Account update view
router.get("/update/:accountId", utilities.checkLogin, utilities.handleErrors(accountController.buildUpdateAccount))

// Route to deliver login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
// Route to deliver registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Route to process registration
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

module.exports = router
