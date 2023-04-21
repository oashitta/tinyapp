// function to find if an email address already exists at registration.
const findExistingUser = function(email, database) {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

module.exports = {
  findExistingUser,
}