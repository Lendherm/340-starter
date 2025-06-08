const utilities = require("../utilities/");
const accountModel = require("../models/account-model");

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
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
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

module.exports = { buildLogin, buildRegister, registerAccount };