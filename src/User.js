const { v4: uuidv4 } = require("uuid");

class User {
  constructor(id, name, status) {
    this.id = id;
    this.name = name;
    this.status = "active" || "failed";

  }
}
class UserAcc extends User{
  constructor(name, status, posts = {}){
    super(name, status)
  this.id = uuidv4();
  this.name = name;
  this.posts = posts;
  this.status = "active" || "failed";
  }
}

module.exports = {
  User,UserAcc,
 
};
