// Import express, assign it to a cariable and set variable for the port to listen tol 
const express = require("express");
const app = express();
const PORT = 8080;

// sets up ejs view engine
app.set("view engine", "ejs");

// decodes front end view to enable it work with the backend.
app.use(express.urlencoded({ extended: true }));

// obkect containing urls - the database
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

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// response when a get request is sent to the homepage
app.get('/', (reg, res) => {
  res.send('Hello!');
});

// response for /urls path
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// response for the /urls/new path to create a new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// shows details of short url.
app.get("/urls/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const templateVars = { id: req.params.id, longURL: longURL};
  // const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// shows the details of the new url created via a post request
app.post("/urls", (req, res) => {
  const id = generateRandomString(6)
  urlDatabase[id] = req.body
  res.redirect(`/urls/${id}`)
});

// post route that removes url resources


// Handles redirect to long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`Mot's TinyURL app is listening on port ${PORT}`)
});

