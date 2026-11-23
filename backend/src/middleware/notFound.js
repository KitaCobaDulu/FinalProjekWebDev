function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: "Rute tidak ditemukan",
  });
}

module.exports = notFound;
