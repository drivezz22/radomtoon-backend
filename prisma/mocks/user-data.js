const bcrypt = require("bcryptjs");
const password = bcrypt.hashSync("123456");

module.exports.userData = [
  {
    email: "Johndoe@mail.com",
    firstName: "John",
    lastName: "Doe",
    phone: "0123335598",
    password: password,
  },
];
