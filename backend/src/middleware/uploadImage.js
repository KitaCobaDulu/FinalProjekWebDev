const multer = require("multer");
const { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } = require("../constants");

class InvalidImageTypeError extends Error {}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 1,
  },
  fileFilter(req, file, callback) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return callback(new InvalidImageTypeError());
    }

    callback(null, true);
  },
});

function uploadImage(req, res, next) {
  upload.single("image")(req, res, (error) => {
    if (!error) return next();

    let message;

    if (error.code === "LIMIT_FILE_SIZE") {
      message = "Ukuran foto maksimal 2 MB";
    } else if (error instanceof InvalidImageTypeError) {
      message = "Format foto harus JPEG, PNG, atau WebP";
    } else if (
      error.code === "LIMIT_UNEXPECTED_FILE" ||
      error.code === "LIMIT_FILE_COUNT"
    ) {
      message = "Kirim satu foto pada field image";
    } else {
      return next(error);
    }

    return res.status(400).json({
      success: false,
      message: "Validasi gagal",
      errors: [{ field: "image", message }],
    });
  });
}

module.exports = uploadImage;
