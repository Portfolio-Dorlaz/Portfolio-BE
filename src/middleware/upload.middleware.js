import multer from "multer";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error("Chỉ chấp nhận file ảnh jpg, jpeg, png, webp"), false);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
  },
});

export const uploadSingleImage = (req, res, next) => {
  const handler = multerUpload.single("image");

  handler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "Ảnh không được vượt quá 2MB",
          });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            message: "Tên field file không hợp lệ, cần dùng 'image'",
          });
        }

        return res.status(400).json({
          message: err.message,
        });
      }

      return res.status(400).json({
        message: err.message || "Upload ảnh thất bại",
      });
    }

    next();
  });
};