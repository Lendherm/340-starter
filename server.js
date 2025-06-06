/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const path = require("path");

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");
app.set("views", path.join(__dirname, "views"));

/* ***********************
 * Middleware
 *************************/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(static);

/* ***********************
 * Routes
 *************************/
// Home route
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory routes
app.use("/inv", inventoryRoute);

// Account routes (to be implemented later)
// app.use("/account", require("./routes/accountRoute"));

/* ***********************
 * 404 Route - must be last route before error handler
 *************************/
app.use(async (req, res, next) => {
  next({status: 404, message: "Sorry, we appear to have lost that page."});
});

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav;
  try {
    nav = await utilities.getNav();
  } catch (error) {
    console.error("Error getting navigation:", error);
    nav = await utilities.getNav(); // Fallback to basic nav
  }
  
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  
  let message;
  if (err.status === 404) {
    message = err.message;
  } else {
    message = "Oh no! There was a crash. Maybe try a different route?";
    // In development, you might want to see the actual error
    if (process.env.NODE_ENV === "development") {
      message = err.message;
    }
  }

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
    errors: null,
    layout: "./layouts/layout"
  });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});