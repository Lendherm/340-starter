const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const pool = require('../database/'); // Added for error testing

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classificationId);
    console.log('Classification ID:', classification_id); // Debug log
    
    if (isNaN(classification_id)) {
      throw new Error("Invalid classification ID");
    }
    
    const data = await invModel.getInventoryByClassificationId(classification_id);
    console.log('Vehicle data:', data); // Debug log
    
    if (!data || data.length === 0) {
      const err = new Error("No vehicles found in this classification");
      err.status = 404;
      throw err;
    }
    
    const [grid, nav] = await Promise.all([
      utilities.buildClassificationGrid(data),
      utilities.getNav()
    ]);
    
    res.render("inventory/classification", {
      title: `${data[0].classification_name} vehicles`,
      nav,
      grid,
      errors: null,
      layout: './layouts/layout'
    });
  } catch (error) {
    console.error('Error in buildByClassificationId:', error); // Debug log
    error.status = error.status || 500;
    next(error);
  }
};

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    console.log('Inventory ID:', inv_id); // Debug log
    
    if (isNaN(inv_id)) {
      throw new Error("Invalid inventory ID");
    }
    
    const data = await invModel.getInventoryItemById(inv_id);
    console.log('Vehicle details:', data); // Debug log
    
    if (!data) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      throw err;
    }
    
    const [detailHTML, nav] = await Promise.all([
      utilities.buildInventoryItemDetail(data),
      utilities.getNav()
    ]);
    
    res.render("inventory/detail", {
      title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
      nav,
      content: detailHTML,
      errors: null,
      layout: './layouts/layout'
    });
  } catch (error) {
    console.error('Error in buildByInventoryId:', error); // Debug log
    error.status = error.status || 500;
    next(error);
  }
};

/* ***************************
 *  Intentional error trigger for testing
 * ************************** */
invCont.triggerError = async function(req, res, next) {
  try {
    console.log('Triggering intentional error...'); // Debug log
    // Simulate database error
    const result = await pool.query('SELECT * FROM non_existent_table');
    res.json(result.rows);
  } catch (error) {
    console.error('Triggered error:', error); // Debug log
    error.status = 500;
    error.message = 'Database operation failed (Intentional Test Error)';
    next(error);
  }
};

module.exports = invCont;