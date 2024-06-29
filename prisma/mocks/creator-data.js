const bcrypt = require("bcryptjs");
const password = bcrypt.hashSync("123456");

module.exports.creatorData = [
  {
    email: "radomtoon1@outlook.com",
    firstName: "test",
    lastName: "test",
    phone: "0123654788",
    password: password,
    address: "test",
    provinceId: 1,
    profileImage: null,
    identityImage:
      "https://res.cloudinary.com/dpl1p3prr/image/upload/v1718978626/17189786233862986.jpg",
    isCreatorAcceptId: 2,
    biography:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    website: "cc17.com",
    createdAt: "2024-06-21T14:03:47.000Z",
    updatedAt: "2024-06-21T14:04:15.000Z",
  },
];
