const cloudinary = require("../config/cloudinary");

const uploadService = {};

uploadService.upload = async (path) => {
  const pathSplit = path.split(`\\`);
  const publicId = pathSplit[pathSplit.length - 1].split(".")[0];
  const { secure_url } = await cloudinary.uploader.upload(path, {
    public_id: publicId,
  });
  return secure_url;
};

uploadService.delete = async (path) => {
  const pathSplit = path.split("/");
  const publicId = pathSplit[pathSplit.length - 1].split(".")[0];
  await cloudinary.uploader.destroy(publicId);
};

module.exports = uploadService;
