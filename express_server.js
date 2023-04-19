// Import express, assign it to a cariable and set variable for the port to listen to
const express = require("express");
// creating an express app
const app = express();

const PORT = 8080;

const cookieParser = require('cookie-parser')

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

// function generating random string.
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++){
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.get("/urls.json", (req, res) => {
  res.json(username);
});

// response when a get request is sent to the homepage
app.get('/', (reg, res) => {
  res.send('This is the home Page. It does nothing right now.');
});

// response for /urls path
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  // is there a logged in user? retrieve the cookie
  // const currentUser = req.cookies
  res.render("urls_index", templateVars);
});

// response for the /urls/new path to create a new url
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"]};

  res.render("urls_new", templateVars);
});

// shows details of short url.
app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const username =  req.cookies["username"];
  const templateVars = { id: req.params.id, longURL, username} ;
  // const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Handles redirect to long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  // adding cookie request so it can be rendered in the header.
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.redirect(longURL, templateVars);
});

// shows the details of the new url created via a post request
app.post("/urls", (req, res) => {
  const id = generateRandomString(6)
  urlDatabase[id] = req.body.longURL
  res.redirect(`/urls/${id}`)
});

// post route that removes url resources
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id]
  res.redirect("/urls")
});

// handles data sent to the database on the creation of a new url.
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls")
});

// handles login
app.post("/login", (req,res) => {
  const username = req.body.username;
  console.log(username);

  // setting the cookie in the user's browswer
  res.cookie("username", username);

  // redirecting to /urls
  res.redirect("/urls");
});

app.post("/logout", (req,res) => {
  // to clear cookie
  res.clearCookie('username');
  // to redirect to /urls
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Mot's TinyURL app is listening on port ${PORT}`)
});

