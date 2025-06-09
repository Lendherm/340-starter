const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invValidate = require("../utilities/inv-validation");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classificationId);
    
    if (isNaN(classification_id)) {
      throw new Error("Invalid classification ID");
    }
    
    const data = await invModel.getInventoryByClassificationId(classification_id);
    
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
    
    if (isNaN(inv_id)) {
      throw new Error("Invalid inventory ID");
    }
    
    const data = await invModel.getInventoryItemById(inv_id);
    
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
    error.status = error.status || 500;
    next(error);
  }
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      layout: "./layouts/layout"
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: '', // Añade esta línea
      layout: "./layouts/layout"
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Add new classification
 * ************************** */
invCont.addClassification = async function(req, res, next) {
  try {
    const { classification_name } = req.body;
    const result = await invModel.addClassification(classification_name);
    
    if (result.rowCount > 0) {
      req.flash("success", "Classification added successfully");
      res.redirect("/inv/");
    } else {
      req.flash("error", "Failed to add classification");
      res.redirect("/inv/add-classification");
    }
  } catch (error) {
    req.flash("error", "Error adding classification: " + error.message);
    res.redirect("/inv/add-classification");
  }
};

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function(req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      // Valores por defecto para todos los campos
      inv_make: '',
      inv_model: '',
      inv_year: '',
      inv_description: '',
      inv_image: '/images/vehicles/no-image.png',
      inv_thumbnail: '/images/vehicles/no-image-tn.png',
      inv_price: '',
      inv_miles: '',
      inv_color: '',
      classification_id: null,
      layout: "./layouts/layout"
    });
  } catch (error) {
    next(error);
  }
};
/* ***************************
 *  Add new inventory item
 * ************************** */
invCont.addInventory = async function(req, res, next) {
  try {
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
      inv_color
    } = req.body;
    
    const result = await invModel.addInventoryItem({
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    });
    
    if (result.rowCount > 0) {
      req.flash("success", "Vehicle added successfully");
      res.redirect("/inv/");
    } else {
      req.flash("error", "Failed to add vehicle");
      res.redirect("/inv/add-inventory");
    }
  } catch (error) {
    req.flash("error", "Error adding vehicle: " + error.message);
    
    let nav, classificationList;
    try {
      [nav, classificationList] = await Promise.all([
        utilities.getNav(),
        utilities.buildClassificationList(req.body.classification_id)
      ]);
    } catch (err) {
      console.error("Error getting nav or classification list:", err);
      nav = '<ul class="nav-list"><li><a href="/">Home</a></li></ul>';
      classificationList = '<select name="classification_id" id="classificationList"><option value="">Error loading classifications</option></select>';
    }
    
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
      ...req.body,
      layout: "./layouts/layout"
    });
  }
};

/* ***************************
 *  Intentional error trigger for testing
 * ************************** */
invCont.triggerError = async function(req, res, next) {
  try {
    // Simulate database error
    const result = await pool.query('SELECT * FROM non_existent_table');
    res.json(result.rows);
  } catch (error) {
    error.status = 500;
    error.message = 'Database operation failed (Intentional Test Error)';
    next(error);
  }
};

module.exports = invCont;