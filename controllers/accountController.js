const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

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
    // regular password and cost (salt is generated automatically)
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
      req.flash("error", "Invalid email or password.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        layout: "./layouts/layout"
      });
    }

    const passwordMatch = await bcrypt.compareSync(account_password, accountData.account_password);
    if (!passwordMatch) {
      req.flash("error", "Invalid email or password.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        layout: "./layouts/layout"
      });
    }

    // If we get here, login was successful
    req.flash("success", "You are now logged in.");
    return res.redirect("/account");
  } catch (error) {
    req.flash("error", "Login error: " + error.message);
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      layout: "./layouts/layout"
    });
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin };