// load required modules
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
const {
  generateRandomString,
  getUserID,
  urlsForUser,
  userHasURL } = require('./helpers');

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

//---------------------- DATABASES -------------------------------//

// initialize starting  url "database"
const urlDatabase = {
  "b2xVn2": { 
    longURL: "http://www.lighthouselabs.ca", 
    userID: "aJ48lW",
    showPageCount: 0,
    uniqueVisitors: [], },
  "9sm5xK": { 
    longURL: "http://google.com", 
    userID: "aJ48lW",
    showPageCount: 0,
    uniqueVisitors: [], }
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


//---------------------- GET -------------------------------//

app.get("/", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/urls/login");
  }
  
});

app.get("/urls", (req, res) => {
  // primary urls page, with summary of shortURL's and the
  // associated longURL's
  // each url pair can be Edited or Deleted from here
  const userID = req.session.user_id;
  const user = users[userID];
  // so that the user only sees "their" urls, an empty string
  // is initialized and "their" urls will be added to it
  let urlSummary = {};
  if (user) {
    urlSummary = urlsForUser(user.id, urlDatabase);
  }
  let templateVars = {
    user: user,
    urls: urlSummary // sending only the urls associated with the user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // /urls/new is a page where the user can specify a full URL,
  // so that the app can create a shortURL to associate with it
  const user = req.session.user_id;
  if (!user) {
    res.redirect('/urls/login');
    return;
  }
  let templateVars = {
    user: user,
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/register", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect("/urls");
    return;
  }
  let templateVars = {
    user: user,
  };
  res.render("urls_register", templateVars);
});

app.get("/urls/login", (req, res) => {
  const user = req.session.user_id;
  if (user) {
    res.redirect("/urls");
    return;
  }
  let templateVars = {
    user: user,
  };
  res.render("urls_login", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  // shows a page where a shortURL and longURL pair are summarized
  // a user can then edit the longURL associated with the shortURL
  const userID = req.session.user_id;
  const user = users[userID];
  const shortURL = req.params.shortURL;
  
  let templateVars = {
    user: user,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    userHasURL: userHasURL(user.id, shortURL, urlDatabase), // checks if user has permission for shortURL,
    showPageCount: urlDatabase[shortURL].showPageCount,
    uniqueVisitors: urlDatabase[shortURL].uniqueVisitors.length
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // redirects the user to the website using the longURL associated
  // with a given shortURL
  const shortURL = req.params.shortURL;
  const timeStamp = Date.now();
  if (urlDatabase[shortURL] === undefined) {
    res.status(403).send('That shortURL does not exist.');
  }
  const longURL = urlDatabase[shortURL].longURL;
  urlDatabase[shortURL].showPageCount += 1; // update count on number of times the shortURL is visited
  
  // keep track of the unique visitors using the shortURL
  // Future Update: move most of this code into a helper function
  let visitorID = req.session.visitor_id;
  if (!visitorID) {
    visitorID = generateRandomString();
    req.session.visitor_id = visitorID;
    urlDatabase[shortURL].uniqueVisitors.push(visitorID);
  }
  
  res.redirect(longURL);
});

//---------------------- POST -------------------------------//


app.post("/urls", (req, res) => {
  // creates a random shortURL for a user inputed longURL
  // adds the new shortURL and longURL pair to the "database"
  // along with attaching the user_id to the object
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    showPageCount: 0,
    uniqueVisitors: [],
  };
  res.redirect(`/urls/${shortURL}`);
});

app.delete("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const hasURL = userHasURL(userID, shortURL, urlDatabase);
  if (!hasURL) {
    console.log("You don't have permission to delete that!");
    res.status(403).send("You don't have permission to delete that!");
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
    // removes a shortURL and longURL pair from the "database"
  }
  
});

app.put("/urls/:shortURL", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    res.redirect("/login");
  }
  const shortURL = req.params.shortURL;
  const hasURL = userHasURL(userID, shortURL, urlDatabase);
  if (!hasURL) {
    console.log("You don't have permission to edit that!");
    res.status(403).send("You don't have permission to edit that!");
  } else {
  // allows the user to set a new longURL for a given shortURL
    urlDatabase[req.params.shortURL].longURL = req.body.newLongURL;
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  // when a user logs in, sets a cookie to store their user_id
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userID = getUserID(userEmail, users); // returns false if userEmail in not in users
  const hashedPassword = users[userID].password;
  // check for errors in login details
  if (userEmail === '' || userPassword === '') {
    res.status(400).send('Sorry, incomplete login informaiton.');
  }
  if (!userID) {
    res.status(403).send('That email address does not exist.');
  } else if (!bcrypt.compareSync(userPassword, hashedPassword)) {
    res.status(403).send('Incorrect password.');
  } else {
    req.session.user_id = userID;
  }

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // when a user selects to logout, removes their user_id from
  // the cookie
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  // when a new user registers, a random alpha-numeric ID is generated
  // the users "database" is updated with the users ID, email, and address
  // a cookie is created with their user ID
  const userID = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);
  
  // check for errors in register details
  if (userEmail === '' || userPassword === '') {
    res.status(400).send('Sorry, incomplete login informaiton.');
  }
  if (getUserID(userEmail, users)) {
    res.status(400).send('That email address already exists as a user.');
  }

  // add new user details to users "database"
  users[userID] = {
    id: userID,
    email: userEmail,
    password: hashedPassword
  };
  req.session.user_id = userID;
  res.redirect("/urls");
});

//---------------------- SERVER -------------------------------//

// set up a server to listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});