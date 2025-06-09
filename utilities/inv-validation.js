const { body, validationResult } = require("express-validator");
const utilities = require(".");

const validate = {};

/* **********************
 * Classification Validation Rules
 * ********************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .isAlphanumeric()
      .withMessage("Classification name must be alphanumeric with no spaces")
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name")
  ];
};

/* **********************
 * Check classification data and return errors or continue
 * ********************* */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body;
  let errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      classification_name,
      layout: "./layouts/layout"
    });
    return;
  }
  next();
};

/* **********************
 * Inventory Validation Rules
 * ********************* */
validate.inventoryRules = () => {
  return [
    body("classification_id")
      .notEmpty()
      .isNumeric()
      .withMessage("Please select a classification"),
    
    body("inv_make")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a make"),
      
    body("inv_model")
      .trim()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a model"),
      
    body("inv_year")
      .trim()
      .notEmpty()
      .isLength({ min: 4, max: 4 })
      .isNumeric()
      .withMessage("Please provide a valid 4-digit year"),
      
    body("inv_description")
      .trim()
      .notEmpty()
      .withMessage("Please provide a description"),
      
    body("inv_image")
      .trim()
      .notEmpty()
      .withMessage("Please provide an image path"),
      
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Please provide a thumbnail path"),
      
    body("inv_price")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide a valid price"),
      
    body("inv_miles")
      .trim()
      .notEmpty()
      .isNumeric()
      .withMessage("Please provide valid mileage"),
      
    body("inv_color")
      .trim()
      .notEmpty()
      .withMessage("Please provide a color")
  ];
};

/* **********************
 * Check inventory data and return errors or continue
 * ********************* */
validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id);
    
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: errors.array(),
      classificationList,
      ...req.body,
      layout: "./layouts/layout"
    });
    return;
  }
  next();
};

module.exports = validate;