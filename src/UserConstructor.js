const { v4: uuidv4 } = require("uuid");
const { User, UserAcc } = require("./User");

class UserConstructor {
  constructor() {
    this.usersArr = []; 
    this.postsList = [];
  }

  getUserByName(name) {
    const searchName = this.usersArr.findIndex((elem) => elem.name === name);
    console.log(searchName, "name");
    return searchName;
  }

  allUsers() {
    return this.usersArr;
  }

  getActiveUsers() {
    const clientsActive = [];
    this.usersArr.filter((elem) => {
      elem === elem.status;
      if (elem.status === "active") {
        clientsActive.push(elem);
      }
    });
    return clientsActive;
  }

  createUser(object) {
    const data = JSON.parse(object);
    console.log(data, "data");
    const user = new UserAcc(data);

    this.usersArr.push(user);

    return user;
  }

  deleteItem(arr, id) {
    const item = this.getIndexId(arr,id);
    return arr.splice(item, 1);
  }

  deleteAllUsers() {
    return (this.usersArr = []);
  }

  getIndexId(arr, id){
    console.log(arr, 'arr')
    console.log(id, 'id')
    return arr.findIndex(elem => elem.id === id);
  }

}
module.exports = { UserConstructor };
