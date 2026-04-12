import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Solo se permiten imagenes."));
  }
  cb(null, true);
};

const standarSize = 2 * 1024 * 1024; 

export const upload = multer({ 
  storage,
  limits: {
    fileSize: standarSize
  },
  fileFilter,
}); 