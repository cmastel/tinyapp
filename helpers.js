function generateRandomString() {
  // generates a random alpha-numeric string of 6 characters
  let randomString = '';
  const r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 6; i++) {
    randomString += r[Math.floor(Math.random() * r.length)];
  };
  return randomString;
};

function getUserID(newEmail, database) {
  // checks if a provided email address is already in the users "database"
  let userID = false;
  for (let user in database) {
    if (database[user].email === newEmail) {
      userID = user;
    }; 
  };
  return userID;
};

function urlsForUser(id, database) {
  // iterates through the urlDatase object
  let urlsFiltered = {};
  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      urlsFiltered[shortURL] = database[shortURL].longURL;
    };
  };
  return urlsFiltered;
};

function userHasURL(userID, shortURL, database) {
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