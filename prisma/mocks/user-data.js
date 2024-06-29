const bcrypt = require("bcryptjs");
const password = bcrypt.hashSync("123456");

module.exports.userData = [
  {
    email: "radomtoon4@outlook.com",
    firstName: "John",
    lastName: "Doe",
    phone: "0123335598",
    password: password,
    address: "test",
    provinceId: 2,
  },
];
