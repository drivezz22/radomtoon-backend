const bcrypt = require("bcryptjs");
const password = bcrypt.hashSync("123456");

module.exports.userData = [
  {
    email: "admin@mail.com",
    firstName: "admin",
    lastName: "radomtoon",
    phone: "1234567890",
    password: password,
    isAdmin: true,
  },
  {
    email: "Johndoe@mail.com",
    firstName: "John",
    lastName: "Doe",
    phone: "0123335598",
    password: password,
    isAdmin: false,
  },
];
