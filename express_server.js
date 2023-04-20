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
  "b2xVn2": 'http://www.lighthouselabs.ca',
  "9sm5xK": 'http://www.google.com'
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
  const templateVars = { urls: urlDatabase, user: loggedInUser && loggedInUser.email};
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
  const longURL = urlDatabase[req.params.id];
  const loggedInUser = users[req.cookies["user_id"]];
  const templateVars = { id: req.params.id, longURL, user: loggedInUser && loggedInUser.email};
  // const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Handles redirect to long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  // adding cookie request so it can be rendered in the header.
  // const templateVars = { urls: urlDatabase, user: req.cookies["user_id"]};
  if (!longURL) {
    res.status(404).send("Page Not Found - The url you have requested does not exist.")
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
    const id = generateRandomString(6);
    urlDatabase[id] = req.body.longURL;
    res.redirect(`/urls/${id}`);
  } else {
    // res.send(`<h3>You have to be logged in to shorten a url. Please sign into your account.</h3>`)
    res.status(403).send("You have to be logged in to shorten a new url. Please sign into your account.")
  }
});

// post route that removes url resources
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// handles data sent to the database on the creation of a new url.
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
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
    res.status(403).send('This email address does not exist!!!');
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

