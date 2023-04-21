const { assert } = require('chai');

const { findExistingUser } = require('../helpers.js');

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

// const findExistingUser = function(email, database) {
//   for (let user in database) {
//     if (database[user].email === email) {
//       return database[user];
//     }
//   }
//   return null;
// };

describe('findExistingUser', function() {
  // it('should return a user with valid email', function() {
  //   const user = findExistingUser("user@example.com", testUsers)
  //   assert.equal(user, true)
  // });
  it('should return a user with valid email', function() {
    const user = findExistingUser("user@example.com", testUsers);
    const expectedUser = "userRandomID";
    assert.equal(user.id, expectedUser);
  });

  it('should return undefined when the email does not exist.', function() {
    const user = findExistingUser("user1@example.com", testUsers);
    assert.equal(user, undefined);
  });
  
});

// describe("findExistingUser", () => {
//   it("should return a user with a valid email", () => {
//     assert.equal(findExistingUser("user@example.com", testUsers), true);
//   });
// });