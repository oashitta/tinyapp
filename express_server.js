// Import express, assign it to a variable and set variable for the port to listen to
const express = require("express");
// creating an express app
const app = express();
// for hashing passwords
const bcrypt = require("bcryptjs");
const PORT = 8080;

const {findExistingUser, generateRandomString, urlsForUser, urlDatabase, users, authenticateLogin, addNewUser  } = require('./helpers.js');

// Middleware
const cookieParser = require('cookie-parser');
// Middleware to encrypt cookies
const cookieSession = require('cookie-session');

// decodes front end view to enable it work with the backend.
app.use(express.urlencoded({ extended: true }));

// activate cookie parser
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['khfd', '2r5y', 'i6kv', 'e9sm', '4k0h'],
}));

// sets up ejs template view engine
app.set("view engine", "ejs");

app.get("/urls.json", (req, res) => {
  res.json("user_id");
});

// response when a get request is sent to the homepage
app.get('/', (reg, res) => {
  res.send('This is the home Page. It does nothing right now.');
});

// response for /urls path
app.get("/urls", (req, res) => {
  const loggedInUser = users[req.session.user_id];

  if (!loggedInUser) {
    res.status(403).send(`You need to be logged in to view shortened urls. <a href="http://localhost:8080/login">Login Here!</a> `);
  }

  const templateVars = { urls: urlsForUser(loggedInUser), user: loggedInUser && loggedInUser.email};
 
  // is there a logged in user? retrieve the cookie
  res.render("urls_index", templateVars);
});

// response for the /urls/new path to create a new url
app.get("/urls/new", (req, res) => {
  const loggedInUser = users[req.session.user_id];
  const templateVars = { user: loggedInUser && loggedInUser.email };

  if (loggedInUser) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// route to display details of short url.
app.get("/urls/:id", (req, res) => {
  const shortURL = urlDatabase[req.params.id];

  if (!shortURL) {
    res.status(404).send("Page Not Found - The Short URL you have requested does not exist.");
  }

  const longURL = urlDatabase[req.params.id].longURL;
  const loggedInUser = users[req.session.user_id];
  const templateVars = {id: req.params.id, longURL, user: loggedInUser && loggedInUser.email};

  if (!loggedInUser) {
    res.status(403).send(`You have to be logged in to view this page. <a href="http://localhost:8080/login">Login Here!</a>`);
  }
  res.render("urls_show", templateVars);
});

// Handles redirect to long URL
app.get("/u/:id", (req, res) => {
  
  const shortURL = urlDatabase[req.params.id]
  if (!shortURL) {
      res.status(404).send("Page Not Found - The short URL you have requested does not exist.");
      return;
    }
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404).send("Page Not Found - The short URL you have requested does not exist.");
    return;
  }
  res.redirect(longURL);
});

// endpoint for user registration
app.get("/register", (req, res) => {

  // if user is logged in, visits to login page shld redirect to /urls
  const loggedInUser = users[req.session.user_id];
  if (loggedInUser) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: req.session.user_id};
    res.render("user_registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  // if user is logged in, visits to login page shld redirect to /urls
  const loggedInUser = users[req.session.user_id];
  if (loggedInUser) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: req.session.user_id};
    res.render("user_login", templateVars);
  }
});

// shows the details of the new url created via a post request
app.post("/urls", (req, res) => {
  const loggedInUser = users[req.session.user_id];
  
  if (loggedInUser) {
    const shortUrl = generateRandomString(6);
    const urlObject = {
      longURL: req.body.longURL,
      userID: loggedInUser,
    };
    urlDatabase[shortUrl] = urlObject;
    res.redirect(`/urls/${shortUrl}`);
  } else {
   
    res.status(403).send(`You have to be logged in to shorten a new url. Please log into your account. <a href="http://localhost:8080/login">Login Here!</a>`);
  }
});

// to edit the long URL
app.post("/urls/:id", (req, res) => {
  const loggedInUser = users[req.session.user_id];
  const shortURL = req.params.id;
  
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    res.status(403).send("The url you are trying to edit does not exist.");
  }

  if (!loggedInUser) {
    return res.status(403).send("You need to login to edit this url.");
  }

  if (loggedInUser && urlDatabase[shortURL].userID !== loggedInUser) {
    return res.status(403).send("You do not have permissions to edit this URL.");
  }

  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

// post route that removes url resources
app.post("/urls/:id/delete", (req, res) => {
  const loggedInUser = users[req.session.user_id];
  const shortURL = req.params.id;
  
  // restricting delete permission if not owner
  // if short url does not exit then error message
  if (!urlDatabase.hasOwnProperty(shortURL)) {
    res.status(403).send("The url you are trying to delete does not exist.");
  }

  // if not logged in user then error msg.
  if (!loggedInUser) {
    return res.status(403).send("You need to login to perform this action.");
  }
  
  // logged in but do not own the url.
  if (loggedInUser && urlDatabase[shortURL].userID !== loggedInUser) {
    return res.status(403).send("You do not have permissions to delete this URL.");
  }

  // delete database
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// handles login
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  // if email field is empty send back response with 400 status code
  if (email === "" || password === "") {
    res.status(400).send(`Invalid input - email/password field cannot be empty!!! <a href="http://localhost:8080/login">Try Again!</a>`);
    return;
  }
  
  // use email and password fields
  //if email exists then you want to check the password matches then log in and set cookie. authenticate login function handles this.
  const user = authenticateLogin(users, email, password);

  // if email does not exist you want to send an error and exit.
  if (!user) {
    res.status(403).send('This email/password combination does not exist!!! <a href="http://localhost:8080/login">Try Again!</a>');
    return;
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  // to clear cookies
  req.session = null;
  // to redirect to /urls
  res.redirect("/login");
});


app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //  or const {email, password} = req.body;

  // if email field is empty send back response with 400 status code
  if (email === "" || password === "") {
    res.status(400).send('Invalid input - email/password field cannot be empty!!!');
    return;
  }
  
  const user = findExistingUser(email, users);
  if (user) {
    res.status(400).send(`A user with that email address already exists!!! <a href="http://localhost:8080/register">Try Again!</a>`);
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const hashPassword = bcrypt.hashSync(password, salt);
  const userId = addNewUser(email, hashPassword);
  req.session.user_id = userId;
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Mot's TinyURL app is listening on port ${PORT}`);
});


