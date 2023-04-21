const { assert } = require('chai').assert;

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

describe('findExistingUser', function() {
  it('should return a user with valid email', function() {
    const user = findExistingUser("user@example.com", testUsers)
    const expectedUser = "userRandomID";
    assert.deepEqual(user, expectedUser)
  });
});git