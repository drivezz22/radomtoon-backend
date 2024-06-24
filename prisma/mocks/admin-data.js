const bcrypt = require("bcryptjs");
const password = bcrypt.hashSync("123456");

module.exports.adminData = [
  {
    email: "admin@mail.com",
    firstName: "admin",
    lastName: "radomtoon",
    password: password,
  },
];
