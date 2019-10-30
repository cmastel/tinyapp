// load required modules
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

// initialize starting "database"
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

function generateRandomString() {
  // generates a random alpha-numeric string of 6 characters
  let randomString = '';
  const r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
    randomString += r[Math.floor(Math.random() * r.length)];
  }
  return randomString;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  // primary urls page, with summary of shortURL's and the
  // associated longURL's
  // each url pair can be Edited or Deleted from here
  let templateVars = { 
    username: req.cookies.username,
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // /urls/new is a page where the user can specify and full URL,
  // so that the app can create a shortURL to associate with it
  let templateVars = { 
    username: req.cookies.username,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // shows a page where a shortURL and longURL pair are summarized
  // a user can then edit the longURL associated with the shortURL
  let templateVars = { 
    username: req.cookies.username,
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("/urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // redirects the user to the website using the longURL associated
  // with a given shortURL
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.post("/urls", (req, res) => {
  // creates a randome shortURL for a user inputed longURL
  // adds the new shortURL and longURL pair to the "database"
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // removes a shortURL and longURL pair from the "database"
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  // allows the user to set a new longURL for a given shortURL
  urlDatabase[req.params.shortURL] = req.body.newLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  // when a user logs in, sets a cookie to store their username
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // when a user selects to logout, removes their username from 
  // the cookie
  res.clearCookie('username');
  res.redirect("/urls");
});

// set up a server to listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});