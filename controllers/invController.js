const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const invId = req.params.invId
  const data = await invModel.getInventoryById(invId)
  const nav = await utilities.getNav()
  const itemData = data[0]
  if (!itemData) {
    return next({ status: 404, message: "Sorry, that vehicle could not be found." })
  }
  const itemName = `${itemData.inv_year} ${itemData.inv_make} ${itemData.inv_model}`
  const vehicleHTML = await utilities.buildVehicleDetail(itemData)
  res.render("./inventory/detail", {
    title: itemName,
    nav,
    vehicleHTML,
  })
}
module.exports = invCont
