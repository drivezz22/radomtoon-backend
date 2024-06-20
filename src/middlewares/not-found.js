const notFoundMiddleware = (req, res, next) => {
  req.status(404).json({
    message: `request url : ${req.method} ${req.url} was not found on this server`,
  });
};

module.exports = notFoundMiddleware;
