function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Format request tidak valid",
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
  });
}

module.exports = errorHandler;
