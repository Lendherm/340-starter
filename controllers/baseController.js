const utilities = require("../utilities/");
const baseController = {};

baseController.buildHome = async function(req, res) {
  const nav = await utilities.getNav();
  res.render("index", {
    title: "Home",
    nav,
    content: '',
    showFeatured: true,
    layout: './layouts/layout' // Especificar el layout
  });
};

module.exports = baseController;