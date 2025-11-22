/* ***************************
 *  Intentional error trigger for testing middleware
 * ************************** */
const errorController = {}

errorController.triggerError = async function (_req, _res) {
  throw new Error("Intentional test error: this is expected for middleware validation.")
}

module.exports = errorController
