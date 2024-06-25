const multer = require("multer");
const { IMAGE_DIR } = require("../constants");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, IMAGE_DIR);
  },
  filename: (req, file, cb) => {
    const filename = `${new Date().getTime()}${Math.round(Math.random() * 100000)}.${
      file.mimetype.split("/")[1]
    }`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = upload;
