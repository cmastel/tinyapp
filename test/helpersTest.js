const { assert } = require('chai');
const {
  generateRandomString,
  getUserID,
  urlsForUser,
  userHasURL } = require('../helpers');

const testUsers = {
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

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://google.com", userID: "user2RandomID" }
};

describe('#generateRandomString', function() {
  it('should return a string with a length of 6', function() {
    const userID = generateRandomString();
    assert.strictEqual(6, userID.length);
  });
});

describe('#getUserID', function() {
  it('should the user ID of a valid email', function() {
    const user = getUserID('user@example.com', testUsers);
    const expectedOutput = 'userRandomID';
    assert.strictEqual(expectedOutput, user);
  });
  it('should return false if there is no valid email', function() {
    const user = getUserID('a@example.com', testUsers);
    assert.isFalse(user);
  });
});

describe('#urlsForUser', function() {
  it('should return { "9sm5xK": "http://google.com" } for userID: "user2RandomID', function() {
    const filteredUrls = urlsForUser("user2RandomID", urlDatabase);
    const expectedOutput = { "9sm5xK": "http://google.com" };
    assert.deepEqual(expectedOutput, filteredUrls);
  });
  it('should return {} for userID: "notAUser"', function() {
    const filteredUrls = urlsForUser('notAUser', urlDatabase);
    assert.deepEqual({}, filteredUrls);
  });
});

describe('#userHasURL', function() {
  it('should return true that userRandomID has b2xVn2', function() {
    const hasURL = userHasURL('userRandomID', 'b2xVn2', urlDatabase);
    assert.isTrue(hasURL);
  });
  it('should return false that userRandomeID has 9sm5xK', function() {
    const hasURL = userHasURL('userRandomID', '9sm5xK', urlDatabase);
    assert.isFalse(hasURL);
  });
});

