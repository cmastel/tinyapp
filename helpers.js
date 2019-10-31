const generateRandomString = function() {
  // generates a random alpha-numeric string of 6 characters
  let randomString = '';
  const r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    randomString += r[Math.floor(Math.random() * r.length)];
  }
  return randomString;
};

const getUserID = function(newEmail, database) {
  // checks if a provided email address is already in the users "database"
  let userID = false;
  for (let user in database) {
    if (database[user].email === newEmail) {
      userID = user;
    }
  }
  return userID;
};

const urlsForUser = function(id, database) {
  // iterates through the urlDatase object
  let urlsFiltered = {};
  for (let shortURL in database) {
    console.log(database[shortURL].userID);
    if (database[shortURL].userID === id) {
      urlsFiltered[shortURL] = database[shortURL].longURL;
      console.log('if loop object', urlsFiltered);
    }
  }
  console.log('urlsFiltered', urlsFiltered);
  return urlsFiltered;
};

const userHasURL = function(userID, shortURL, database) {
  const userURLs = urlsForUser(userID, database);
  const userURLKeys = Object.keys(userURLs);
  return userURLKeys.includes(shortURL);
};

module.exports = {
  generateRandomString,
  getUserID,
  urlsForUser,
  userHasURL
};