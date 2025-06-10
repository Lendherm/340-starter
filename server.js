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
const session = require("express-session");
const pool = require('./database/');
const path = require("path");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");

const app = express();

/* ***********************
 * Security Middleware
 *************************/
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:"]
    }
  }
}));

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
// Initialize res.locals
app.use((req, res, next) => {
  res.locals.loggedin = false;
  res.locals.accountData = null;
  next();
});

// Session configuration
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  name: 'sessionId',
  cookie: { 
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  }
}));

// Flash messages
app.use(flash());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// JWT token check
const utilities = require("./utilities/");
app.use(utilities.checkJWTToken);

// Make flash messages available to all views
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Add year to all views
app.use((req, res, next) => {
  res.locals.year = new Date().getFullYear();
  next();
});

/* ***********************
 * Routes
 *************************/
const static = require("./routes/static");
const baseController = require("./controllers/baseController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");

app.use(static);
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);

/* ***********************
 * Error Handlers
 *************************/
// 404 Handler
app.use(async (req, res, next) => {
  next({status: 404, message: "Sorry, we appear to have lost that page."});
});

// Global error handler
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
  
  res.status(err.status || 500).render("errors/error", {
    title: `${err.status || 500} Error`,
    message: err.message,
    nav,
    errors: null,
    layout: "./layouts/layout"
  });
});

/* ***********************
 * Server Configuration
 *************************/
const port = process.env.PORT || 5501;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`Server running on ${host}:${port}`);
  console.log(`Mode: ${process.env.NODE_ENV || "development"}`);
});