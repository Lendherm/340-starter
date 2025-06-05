const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invCont = {};

invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    
    if (!data || data.length === 0) {
      return res.redirect('/');
    }
    
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    
    res.render("inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
      errors: null,
      layout: './layouts/layout' // Especificar el layout
    });
  } catch (error) {
    console.error("Error in buildByClassificationId:", error);
    res.redirect('/');
  }
};

module.exports = invCont;