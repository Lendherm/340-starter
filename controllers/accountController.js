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

  try {
    // Validar si el email ya existe
    const existingAccount = await accountModel.getAccountByEmail(account_email);
    if (existingAccount) {
      req.flash("error", "This email is already registered. Please log in.");
      return res.redirect("/account/login");
    }

    // Hash the password before storing
    const hashedPassword = bcrypt.hashSync(account_password, 10);
    
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult.rowCount > 0) {
      req.flash("success", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.redirect("/account/login");
    } else {
      req.flash("error", "Sorry, the registration failed.");
      return res.redirect("/account/register");
    }
  } catch (error) {
    console.error("Registration error:", error);
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

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined in .env");
    }

    delete accountData.account_password;
    const accessToken = jwt.sign(
      accountData, 
      process.env.ACCESS_TOKEN_SECRET, 
      { expiresIn: '1h' } // Corregido a 1 hora
    );
    
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
    accountData: res.locals.accountData,
    layout: "./layouts/layout"
  });
}


/* ****************************************
*  Deliver Update Account view
* *************************************** */
async function buildUpdateView(req, res, next) {
  try {
    const account_id = parseInt(req.params.account_id);
    const accountData = await accountModel.getAccountById(account_id);
    
    if (!accountData) {
      req.flash("error", "Account not found.");
      return res.redirect("/account/");
    }
    
    let nav = await utilities.getNav();
    res.render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      accountData,
      layout: "./layouts/layout"
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
*  Process Account Update
* *************************************** */
async function updateAccount(req, res, next) {
  try {
    const { account_id, account_firstname, account_lastname, account_email } = req.body;
    
    const updatedAccount = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );
    
    if (updatedAccount) {
      // Update the JWT token with new account data
      const accessToken = jwt.sign(
        updatedAccount, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '1h' }
      );
      
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        maxAge: 3600 * 1000,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      req.flash("success", "Account updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("error", "Failed to update account.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    next(error);
  }
}

/* ****************************************
*  Process Password Update
* *************************************** */
async function updatePassword(req, res, next) {
  try {
    const { account_id, account_password } = req.body;
    const hashedPassword = bcrypt.hashSync(account_password, 10);
    
    const result = await accountModel.updatePassword(account_id, hashedPassword);
    
    if (result) {
      req.flash("success", "Password updated successfully.");
      return res.redirect("/account/");
    } else {
      req.flash("error", "Failed to update password.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    next(error);
  }
}

module.exports = { 
  buildLogin, 
  buildRegister, 
  registerAccount, 
  accountLogin,
  accountManagement,
  buildUpdateView,
  updateAccount,
  updatePassword
};