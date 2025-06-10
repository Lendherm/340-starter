const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const pool = require('../database/');

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classificationId);
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    res.render("inventory/classification", {
      title: data[0].classification_name + " vehicles",
      nav,
      grid,
      errors: null,
      layout: "./layouts/layout"
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    const data = await invModel.getInventoryItemById(inv_id);
    const detailHTML = await utilities.buildInventoryItemDetail(data);
    let nav = await utilities.getNav();
    res.render("inventory/detail", {
      title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
      nav,
      content: detailHTML,
      errors: null,
      layout: "./layouts/layout"
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagementView = async function(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationSelect,
      errors: null,
      layout: "./layouts/layout"
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    
    if (invData.length > 0) {
      return res.json(invData);
    } else {
      throw new Error("No data returned");
    }
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      classification_name: '',
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
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
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
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryItemById(inv_id);
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id,
      layout: "./layouts/layout"
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Update inventory item
 * ************************** */
invCont.updateInventory = async function(req, res, next) {
  try {
    // Parse all numeric values to ensure they're numbers
    const inv_id = parseInt(req.body.inv_id);
    const classification_id = parseInt(req.body.classification_id);
    const inv_price = parseFloat(req.body.inv_price);
    const inv_miles = parseInt(req.body.inv_miles);

    const updateData = {
      inv_id,
      classification_id,
      inv_make: req.body.inv_make,
      inv_model: req.body.inv_model,
      inv_year: req.body.inv_year,
      inv_description: req.body.inv_description,
      inv_image: req.body.inv_image,
      inv_thumbnail: req.body.inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color: req.body.inv_color
    };

    const updateResult = await invModel.updateInventoryItem(updateData);
    
    if (updateResult.rowCount > 0) {
      const itemName = `${updateData.inv_make} ${updateData.inv_model}`;
      req.flash("success", `The ${itemName} was successfully updated.`);
      res.redirect("/inv/");
    } else {
      req.flash("error", "Sorry, the update failed.");
      res.redirect(`/inv/edit/${inv_id}`);
    }
  } catch (error) {
    console.error('Update error details:', error);
    req.flash("error", "Error updating vehicle: " + error.message);
    res.redirect(`/inv/edit/${req.body.inv_id}`);
  }
};



/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.buildDeleteConfirmationView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryItemById(inv_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    
    res.render("./inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(itemData.inv_price),
      classification_name: itemData.classification_name,
      layout: "./layouts/layout"
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Delete inventory item
 * ************************** */
invCont.deleteInventoryItem = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const deleteResult = await invModel.deleteInventoryItem(inv_id);
    
    if (deleteResult.rowCount > 0) {
      req.flash("success", "The vehicle was successfully deleted.");
      res.redirect("/inv/");
    } else {
      req.flash("error", "Sorry, the deletion failed.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    req.flash("error", "Error deleting vehicle: " + error.message);
    res.redirect(`/inv/delete/${req.body.inv_id}`);
  }
};

/* [Mantén todos los métodos existentes...] */

/* ***************************
 *  Build delete classification confirmation view
 * ************************** */
invCont.buildDeleteClassificationView = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.params.classification_id);
    let nav = await utilities.getNav();
    const classificationData = await invModel.getClassifications(); // Cambia esto
    
    // Encuentra la clasificación específica
    const classification = classificationData.rows.find(
      c => c.classification_id == classification_id
    );
    
    if (!classification) {
      req.flash("error", "Classification not found.");
      return res.redirect("/inv/");
    }
    
    // Count inventory items in this classification
    const inventoryCount = await pool.query(
      'SELECT COUNT(*) FROM inventory WHERE classification_id = $1',
      [classification_id]
    );
    
    res.render("./inventory/delete-classification-confirm", {
      title: "Delete Classification",
      nav,
      errors: null,
      classification_id,
      classification_name: classification.classification_name,
      inventory_count: inventoryCount.rows[0].count,
      layout: "./layouts/layout"
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Delete classification and its inventory
 * ************************** */
invCont.deleteClassification = async function (req, res, next) {
  try {
    const classification_id = parseInt(req.body.classification_id);
    const result = await invModel.deleteClassification(classification_id);
    
    if (result.rowCount > 0) {
      req.flash("success", "Classification and all associated vehicles were successfully deleted.");
      res.redirect("/inv/");
    } else {
      req.flash("error", "Sorry, the deletion failed.");
      res.redirect(`/inv/delete-classification/${classification_id}`);
    }
  } catch (error) {
    req.flash("error", "Error deleting classification: " + error.message);
    res.redirect(`/inv/delete-classification/${req.body.classification_id}`);
  }
};

module.exports = invCont;