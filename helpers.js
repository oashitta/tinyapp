const bcrypt = require("bcryptjs");

// object containing urls - the urls database
const urlDatabase = {
  "b2xVn2": {
    longURL: 'http://www.lighthouselabs.ca',
    userID: "aJ48lW",
  },

  "9sm5xK": {
    longURL: 'http://www.google.com',
    userID: "aJ48lW",
  },

  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// users object - database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// function to find if an email address already exists at registration.
// const findExistingUser = function(email, database) {
//   for (let user in database) {
//     if (database[user].email === email) {
//       return true;
//     }
//   }
//   return false;
// };

const findExistingUser = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

// function generating random string.
const generateRandomString = function(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// function to filter database to show urls specific to a particular user
const urlsForUser = function (id) {
  // returns urls where userID === user_id
  const userURLs = {};

  for (const shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      userURLs[shortUrl] = urlDatabase[shortUrl]
    } 
  }
  return userURLs
};

const addNewUser = (email, password) => {
  // to create new user ID.
  const userId = generateRandomString(10);

  // create new user object
  const newUser = {
    id: userId,
    email,
    password,
  }
  users[userId] = newUser;
  return userId;
};

const authenticateLogin = (users, email, password) => {
  for (let user in users) {
    const userEmailFound = findExistingUser(email, users);
    // if (
    //   users[user].email === email &&
    //   bcrypt.compareSync(password, users[user].password)
    // ) {
    if (userEmailFound && bcrypt.compareSync(password, users[user].password)) {
      return users[user];
    }
  }
  return false;
};


module.exports = {
  findExistingUser,
  generateRandomString,
  urlsForUser,
  urlDatabase,
  users,
  authenticateLogin,
  addNewUser,
}