const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const invValidate = {}

/* ******************************
 * Classification Validation Rules
 ****************************** */
invValidate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("Classification name must not contain spaces or special characters.")
      .custom(async (classification_name) => {
        const exists = await invModel.checkExistingClassification(classification_name)
        if (exists) {
          throw new Error("Classification already exists.")
        }
      }),
  ]
}

/* ******************************
 * Check classification data and return errors
 ****************************** */
invValidate.checkClassData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name,
    })
  }
  next()
}

/* ******************************
 * Inventory Validation Rules
 ****************************** */
invValidate.inventoryRules = () => {
  return [
    body("inv_make").trim().escape().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().escape().notEmpty().withMessage("Model is required."),
    body("inv_year")
      .trim()
      .notEmpty()
      .withMessage("Year is required.")
      .isInt({ min: 1886, max: 3000 })
      .withMessage("Year must be a valid year."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price")
      .trim()
      .notEmpty()
      .withMessage("Price is required.")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_miles")
      .trim()
      .notEmpty()
      .withMessage("Mileage is required.")
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive integer."),
    body("inv_color").trim().escape().notEmpty().withMessage("Color is required."),
    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required.")
      .isInt()
      .withMessage("Classification selection is invalid."),
  ]
}

/* ******************************
 * Check inventory data and return errors
 ****************************** */
invValidate.checkInvData = async (req, res, next) => {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
    })
  }
  next()
}

module.exports = invValidate
