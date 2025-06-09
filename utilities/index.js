const invModel = require("../models/inventory-model");
const Util = {};
const jwt = require("jsonwebtoken");
require("dotenv").config();

Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications();
    let list = '<ul class="nav-list">';
    list += '<li><a href="/" title="Home page">Home</a></li>';
    
    data.rows.forEach((row) => {
      list += `<li>
        <a href="/inv/type/${row.classification_id}" 
           title="Browse ${row.classification_name} vehicles">
          ${row.classification_name}
        </a>
      </li>`;
    });
    
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("getNav error:", error);
    return '<ul class="nav-list"><li><a href="/">Home</a></li></ul>';
  }
};

Util.buildClassificationGrid = async function(data) {
  try {
    if (!data || data.length === 0) {
      return '<div class="no-vehicles"><p>No vehicles found in this classification</p></div>';
    }
    
    let grid = `
      <div class="classification-view">
        <h1 class="classification-title">${data[0].classification_name} Vehicles</h1>
        <div class="vehicle-grid">
    `;
    
    data.forEach(vehicle => {
      grid += `
        <div class="vehicle-card">
          <a href="/inv/detail/${vehicle.inv_id}" 
             title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" 
                 alt="${vehicle.inv_make} ${vehicle.inv_model}" 
                 class="vehicle-thumbnail">
            <div class="vehicle-details">
              <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
              <div class="vehicle-price">
                $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}
              </div>
            </div>
          </a>
        </div>
      `;
    });
    
    grid += '</div></div>';
    return grid;
  } catch (error) {
    console.error("Error building classification grid:", error);
    return '<div class="error-message"><p>Error loading vehicle data</p></div>';
  }
};

Util.buildInventoryItemDetail = async function(vehicle) {
  try {
    if (!vehicle) {
      return '<div class="error-message"><p>Vehicle details not available</p></div>';
    }
    
    return `
      <div class="vehicle-detail-container">
        <div class="vehicle-gallery">
          <img src="${vehicle.inv_image}" 
               alt="${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}"
               class="main-image">
          <div class="inspection-banner">
            <span>✓ Certified Pre-Owned</span>
          </div>
        </div>
        
        <div class="vehicle-specs">
          <h1>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
          
          <div class="price-section">
            <span class="price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
            <span class="price-note">No-Haggle Price</span>
          </div>
          
          <div class="specs-grid">
            <div class="spec-item">
              <span class="spec-label">Mileage:</span>
              <span class="spec-value">${vehicle.inv_miles.toLocaleString()} miles</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Color:</span>
              <span class="spec-value">${vehicle.inv_color}</span>
            </div>
          </div>
          
          <div class="vehicle-description">
            <h3>Description</h3>
            <p>${vehicle.inv_description}</p>
          </div>
          
          <div class="action-buttons">
            <button class="btn-primary">Contact Us</button>
            <button class="btn-secondary">Schedule Test Drive</button>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("Error building inventory detail:", error);
    return '<div class="error-message"><p>Error loading vehicle details</p></div>';
  }
};

Util.buildClassificationList = async function (classification_id = null) {
  try {
    const data = await invModel.getClassifications();
    let classificationList = '<select name="classification_id" id="classificationList" required>';
    classificationList += '<option value="">Choose a Classification</option>';
    
    data.rows.forEach((row) => {
      classificationList += `<option value="${row.classification_id}"`;
      if (classification_id != null && row.classification_id == classification_id) {
        classificationList += " selected";
      }
      classificationList += `>${row.classification_name}</option>`;
    });
    
    classificationList += "</select>";
    return classificationList;
  } catch (error) {
    console.error("buildClassificationList error:", error);
    return '<select name="classification_id" id="classificationList" required><option value="">Error loading classifications</option></select>';
  }
};

Util.handleErrors = fn => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      })
  } else {
    next();
  }
};

module.exports = Util;