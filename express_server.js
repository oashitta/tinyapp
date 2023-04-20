// Import express, assign it to a cariable and set variable for the port to listen to
const express = require("express");
// creating an express app
const app = express();

const PORT = 8080;

const cookieParser = require('cookie-parser');

// decodes front end view to enable it work with the backend.
app.use(express.urlencoded({ extended: true }));

// activate cookie parser
app.use(cookieParser());

// sets up ejs template view engine
app.set("view engine", "ejs");

// object containing urls - the database
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

// users object
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

// function to find if an email address already exists at registration.
const findExistingUser = function(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false
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
  console.log("here")
  console.log(userURLs);
  return userURLs
};


app.get("/urls.json", (req, res) => {
  res.json("user_id");
});

// response when a get request is sent to the homepage
app.get('/', (reg, res) => {
  res.send('This is the home Page. It does nothing right now.');
});

// response for /urls path
app.get("/urls", (req, res) => {
  const loggedInUser = users[req.cookies["user_id"]];

  if (!loggedInUser) {
    res.status(403).send(`You need to be logged in to view shortened urls. <a href="http://localhost:8080/login">Login Here!</a> `)
  }

  const templateVars = { urls: urlsForUser(loggedInUser), user: loggedInUser && loggedInUser.email};
  console.log(urlDatabase);
  console.log(loggedInUser);
  console.log(loggedInUser.id);

  // is there a logged in user? retrieve the cookie
  // const currentUser = req.cookies
  res.render("urls_index", templateVars);
});

// response for the /urls/new path to create a new url
app.get("/urls/new", (req, res) => {
  const loggedInUser = users[req.cookies["user_id"]];
  const templateVars = { user: loggedInUser && loggedInUser.email };

  if (loggedInUser) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

// shows details of short url.
app.get("/urls/:id", (req, res) => {
  // const shortURL = urlDatabase[req.params.id];
  const longURL = urlDatabase[req.params.id].longURL;
  const loggedInUser = users[req.cookies["user_id"]];
  const templateVars = {id: req.params.id, longURL, user: loggedInUser && loggedInUser.email};

  if (!loggedInUser) {
    res.status(403).send(`You have to be logged in to view this page. <a href="http://localhost:8080/login">Login Here!</a>`)
  }
  // adding cookie request so it can be rendered in the header.
  // const templateVars = { urls: urlDatabase, user: req.cookies["user_id"]};

  // this is not working
  if (!longURL) {
    res.status(404).send("Page Not Found - The short Short URL you have requested does not exist.")
  }
  // const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Handles redirect to long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  // adding cookie request so it can be rendered in the header.
  // const templateVars = { urls: urlDatabase, user: req.cookies["user_id"]};
  if (!longURL) {
    res.status(404).send("Page Not Found - The short URL you have requested does not exist.")
  }
  res.redirect(longURL);
});
// endpoint for user registration
app.get("/register", (req, res) => {
  // const loggedInUser = users[req.cookies["user_id"]];
  
  // if user is logged in, visits to login page shld redirect to /urls
  const loggedInUser = users[req.cookies["user_id"]];
  if (loggedInUser) {
    res.redirect("/urls")
  } else {
    const templateVars = { user: req.cookies["user_id"]};
    res.render("user_registration", templateVars);
  };
});

app.get("/login", (req, res) => {
  // if user is logged in, visits to login page shld redirect to /urls
  const loggedInUser = users[req.cookies["user_id"]];
  if (loggedInUser) {
    res.redirect("/urls")
  } else {
  const templateVars = { user: req.cookies["user_id"]};
  res.render("user_login", templateVars );
  };
});

// shows the details of the new url created via a post request
app.post("/urls", (req, res) => {
  const loggedInUser = users[req.cookies["user_id"]];
  
  if (loggedInUser) {  
    const shortUrl = generateRandomString(6);
    const urlObject = {
      longURL: req.body.longURL,
      userID: loggedInUser,
    }
    urlDatabase[shortUrl] = urlObject;
    res.redirect(`/urls/${shortUrl}`);
  } else {
    // res.send(`<h3>You have to be logged in to shorten a url. Please sign into your account.</h3>`)
    res.status(403).send("You have to be logged in to shorten a new url. Please sign into your account.")
  }
});

// to edit the long URL
app.post("/urls/:id", (req, res) => {
  const loggedInUser = users[req.cookies["user_id"]];
  const shortURL = req.params.id;
  
  if(!urlDatabase.hasOwnProperty(shortURL)) {
    res.status(403).send("The url you are trying to edit does not exist.")
  }

  if (!loggedInUser) {
    return res.status(403).send("You need to login to edit this url.")
  } 

  if (loggedInUser && urlDatabase[shortURL].userID !== loggedInUser ) {
    return res.status(403).send("You do not have permissions to edit this URL.")
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

// post route that removes url resources
app.post("/urls/:id/delete", (req, res) => {
  const loggedInUser = users[req.cookies["user_id"]];
  const shortURL = req.params.id;
  
  // restricting delete permission if not owner
  // if short url does not exit then error message
  if(!urlDatabase.hasOwnProperty(shortURL)) {
    res.status(403).send("The url you are trying to delete does not exist.")
  }
  // if not logged in user then error msg.
  if (!loggedInUser) {
    return res.status(403).send("You need to login to perform this action.")
  } 
  
  // logged in but do not own the url.
  if (loggedInUser && urlDatabase[shortURL].userID !== loggedInUser ) {
      return res.status(403).send("You do not have permissions to delete this URL.")
  }

  // delete database
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// handles login
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  // use email and password fields
  const user = findExistingUser(email);

  // if email does not exist you want to send an error and exit.
  if (!user){
    res.status(403).send('This email does not exist!!!');
  } 
  
  //if email exists then you want to check the password matches then log in and set cookie
  if (user && password === user.password) {
    res.cookie("user_id",  user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid email or password.")
  }
});

app.post("/logout", (req,res) => {
  // to clear cookie
  res.clearCookie('user_id');
  // to redirect to /urls
  res.redirect("/login");
});

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

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //  or const {email, password} = req.body;

  // if email field is empty send back response with 400 status code
  const user = findExistingUser(email);
  if (email === "" || password === "") {
    res.status(400).send('Invalid input - email/password field cannot be empty!!!');
  }

  if (!user){
    const userId = addNewUser(email, password);
    res.cookie("user_id", userId)
    res.redirect("/urls")
  } else {
    res.status(400).send('A user with that email address already exists!!!');
  }
  console.log(users);
  // if email address already exists, send back error with 400 status code
});


app.listen(PORT, () => {
  console.log(`Mot's TinyURL app is listening on port ${PORT}`);
});

