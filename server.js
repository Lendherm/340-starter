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
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require("./utilities/");
const path = require("path");

/* ***********************
 * Security Middleware
 *************************/
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"]
      }
    }
  })
);

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

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

// Add year to all views
app.use((req, res, next) => {
  res.locals.year = new Date().getFullYear();
  next();
});

/* ***********************
 * Routes
 *************************/
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", utilities.handleErrors(inventoryRoute));

/* ***********************
 * 404 Route
 *************************/
app.use(async (req, res, next) => {
  next({status: 404, message: "Sorry, we appear to have lost that page."});
});

/* ***********************
 * Express Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav;
  try {
    nav = await utilities.getNav();
  } catch (error) {
    console.error("Error getting navigation:", error);
    nav = '<ul class="nav-list"><li><a href="/">Home</a></li></ul>';
  }
  
  console.error(`Error ${err.status || 500} at ${req.method} ${req.originalUrl}`);
  console.error('Error details:', err);
  
  const isDev = process.env.NODE_ENV === 'development';
  const message = err.status === 404 ? err.message : 
    isDev ? err.message : "Oh no! There was a crash. Maybe try a different route?";

  res.status(err.status || 500).render("errors/error", {
    title: `${err.status || 500} Error`,
    message,
    nav,
    errors: null,
    layout: "./layouts/layout",
    stack: isDev ? err.stack : null
  });
});

/* ***********************
 * Server Configuration
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`Server running on ${host}:${port}`);
  console.log(`Mode: ${process.env.NODE_ENV || "development"}`);
});