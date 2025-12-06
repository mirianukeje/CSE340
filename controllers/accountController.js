const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult && regResult.rows) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      errors: null,
    })
  }
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildManagement(req, res) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData
  res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    accountData,
    errors: null,
  })
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildUpdateAccount(req, res) {
  let nav = await utilities.getNav()
  const accountData = res.locals.accountData
  const requestedId = parseInt(req.params.accountId, 10)
  if (accountData && requestedId !== accountData.account_id) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }
  res.render("account/updateAccount", {
    title: "Update Account",
    nav,
    accountData,
    errors: null,
  })
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const accountIdNumber = parseInt(account_id, 10)

  if (res.locals.accountData && res.locals.accountData.account_id !== accountIdNumber) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    accountIdNumber
  )

  if (updateResult && updateResult.account_id) {
    req.flash("notice", "Account updated successfully.")
  } else {
    req.flash("notice", "Account update failed.")
  }

  const refreshedAccount = await accountModel.getAccountById(accountIdNumber)
  res.locals.accountData = refreshedAccount

  return res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    accountData: refreshedAccount,
    errors: null,
  })
}

/* ****************************************
*  Process password change
* *************************************** */
async function updatePassword(req, res) {
  const nav = await utilities.getNav()
  const { account_password, account_id } = req.body
  const accountIdNumber = parseInt(account_id, 10)

  if (res.locals.accountData && res.locals.accountData.account_id !== accountIdNumber) {
    req.flash("notice", "You can only update your own account.")
    return res.redirect("/account/")
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", "There was an error updating your password.")
    return res.render("account/updateAccount", {
      title: "Update Account",
      nav,
      accountData: res.locals.accountData,
      errors: null,
    })
  }

  const updateResult = await accountModel.updatePassword(accountIdNumber, hashedPassword)

  if (updateResult && updateResult.account_id) {
    req.flash("notice", "Password updated successfully.")
  } else {
    req.flash("notice", "Password update failed.")
  }

  const refreshedAccount = await accountModel.getAccountById(accountIdNumber)
  res.locals.accountData = refreshedAccount

  return res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    accountData: refreshedAccount,
    errors: null,
  })
}




/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}


module.exports = { buildLogin, buildRegister, registerAccount, buildManagement, buildUpdateAccount, updateAccount, updatePassword, accountLogin }
