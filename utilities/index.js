const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    const data = await invModel.getClassifications();
    let list = "<ul class='nav-list'>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    
    data.rows.forEach((row) => {
      list += "<li>";
      list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>";
      list += "</li>";
    });
    
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("getNav error:", error);
    return "<ul class='nav-list'><li><a href='/'>Home</a></li></ul>";
  }
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function(data) {
  let grid = "";
  
  if (data && data.length > 0) {
    grid = '<div class="classification-view">';
    grid += '<h1 class="classification-title">' + data[0].classification_name + ' Vehicles</h1>';
    grid += '<div class="vehicle-grid">';
    
    data.forEach(vehicle => {
      grid += `
        <div class="vehicle-card">
          <a href="/inv/detail/${vehicle.inv_id}" 
             title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_thumbnail}" 
                 alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" 
                 class="vehicle-thumbnail">
          </a>
          <div class="vehicle-details">
            <h2 class="vehicle-title">
              <a href="/inv/detail/${vehicle.inv_id}" 
                 title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <div class="vehicle-price">
              $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}
            </div>
          </div>
        </div>
      `;
    });
    
    grid += '</div></div>';
  } else {
    grid = '<div class="no-vehicles"><p>Sorry, no matching vehicles could be found.</p></div>';
  }
  
  return grid;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/* ****************************************
 * Build inventory item details view HTML
 * **************************************** */
Util.buildInventoryItemDetail = async function(vehicle) {
  try {
    let detailHTML = `
      <div class="vehicle-detail">
        <div class="detail-image">
          <img src="${vehicle.inv_image}" 
               alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" 
               class="detail-img">
        </div>
        <div class="detail-info">
          <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
          <div class="price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</div>
          <div class="specs">
            <p><strong>Mileage:</strong> ${vehicle.inv_miles.toLocaleString()} miles</p>
            <p><strong>Color:</strong> ${vehicle.inv_color}</p>
          </div>
          <div class="description">${vehicle.inv_description}</div>
        </div>
      </div>
    `;
    return detailHTML;
  } catch (error) {
    console.error("Error building inventory detail:", error);
    return "<p>Sorry, we couldn't load the vehicle details at this time.</p>";
  }
};

module.exports = Util;