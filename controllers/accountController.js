const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: '',
    layout: "./layouts/layout"
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    account_firstname: '',
    account_lastname: '',
    account_email: '',
    layout: "./layouts/layout"
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  // Hash the password before storing
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10);
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.');
    return res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      layout: "./layouts/layout"
    });
  }

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult.rowCount > 0) {
      req.flash(
        "success",
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      );
      return res.redirect("/account/login");
    } else {
      req.flash("error", "Sorry, the registration failed.");
      return res.redirect("/account/register");
    }
  } catch (error) {
    req.flash("error", "Registration error: " + error.message);
    return res.redirect("/account/register");
  }
}

/* ****************************************
*  Process Login
* *************************************** */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  
  try {
    const accountData = await accountModel.getAccountByEmail(account_email);
    
    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        layout: "./layouts/layout"
      });
    }

    // Debug: Verificar contraseñas
    console.log("Provided password:", account_password);
    console.log("Stored hash:", accountData.account_password);
    
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    
    if (!passwordMatch) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        layout: "./layouts/layout"
      });
    }

    // Verificar que el secret existe
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined in .env");
    }

    delete accountData.account_password;
    const accessToken = jwt.sign(
      accountData, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: 3600 * 1000 }
    );
    
    // Configuración de cookies seguras
    const cookieOptions = {
      httpOnly: true,
      maxAge: 3600 * 1000, // 1 hora
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };
    
    res.cookie("jwt", accessToken, cookieOptions);
    return res.redirect("/account/");
    
  } catch (error) {
    console.error("Login error details:", {
      message: error.message,
      stack: error.stack,
      env: process.env.NODE_ENV,
      secretSet: !!process.env.ACCESS_TOKEN_SECRET
    });
    
    req.flash("error", "An error occurred during login. Please try again.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      layout: "./layouts/layout"
    });
  }
}

/* ****************************************
*  Deliver Account Management view
* *************************************** */
async function accountManagement(req, res, next) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    layout: "./layouts/layout"
  });
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin,
  accountManagement
};