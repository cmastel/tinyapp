// load required modules
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

// initialize starting  url "database"
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://google.com"
};

// initialize starting users "database"
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

function generateRandomString() {
  // generates a random alpha-numeric string of 6 characters
  let randomString = '';
  const r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
    randomString += r[Math.floor(Math.random() * r.length)];
  };
  return randomString;
};

function getUserID(newEmail) {
  // checks if a provided email address is already in the users "database"
  let userID = false;
  for (let user in users) {
    if (users[user].email === newEmail) {
      userID = user;
    }; 
  };
  return userID;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  // primary urls page, with summary of shortURL's and the
  // associated longURL's
  // each url pair can be Edited or Deleted from here
  const user = req.cookies.user_id;
  let templateVars = { 
    user: users[user],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // /urls/new is a page where the user can specify and full URL,
  // so that the app can create a shortURL to associate with it
  const user = req.cookies.user_id;
  
  // if user is not logged in, redirect to the login page
  if (!user) {
    res.redirect('/urls/login');
  };
  
  let templateVars = { 
    user: users[user],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  const user = req.cookies.user_id;
  let templateVars = {
    user: users[user],
    user: req.cookies.user_id,
  };
  res.render("urls_register", templateVars);
});

app.get("/urls/login", (req, res) => {
  const user = req.cookies.user_id;
  let templateVars = {
    user: users[user],
    user: req.cookies.user_id,
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // shows a page where a shortURL and longURL pair are summarized
  // a user can then edit the longURL associated with the shortURL
  const user = req.cookies.user_id;
  let templateVars = { 
    user: users[user],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
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
  // when a user logs in, sets a cookie to store their user_id
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = getUserID(userEmail); // returns false if userEmail in not in users

  // check for errors in login details
  if (userEmail === '' || userPassword === '') {
    res.status(400).send('Sorry, incomplete login informaiton.');
  }
  if (!userID) {
    res.status(403).send('That email address does not exist.');
  } else if (users[userID].password !== userPassword) {
    res.status(403).send('Incorrect password.');
  } else {
    res.cookie('user_id', userID);
  };

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // when a user selects to logout, removes their user_id from 
  // the cookie
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  // when a new user registers, a random alpha-numeric ID is generated
  // the users "database" is updated with the users ID, email, and address
  // a cookie is created with their user ID
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  
  // check for errors in register details
  if (userEmail === '' || userPassword === '') {
    res.status(400).send('Sorry, incomplete login informaiton.');
  }
  if (getUserID(userEmail)) {
    res.status(400).send('That email address already exists as a user.');
  }

  // add new user details to users "database"
  users[userID] = { 
    id: userID,
    email: userEmail,
    password: userPassword
  };
  res.cookie('user_id', userID);
  res.redirect("/urls");
})

// set up a server to listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});