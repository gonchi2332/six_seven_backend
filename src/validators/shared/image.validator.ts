export function validateImage(image: Express.Multer.File) {
  const ans = (!image || (image && !image.mimetype.startsWith("image/")));
  return !ans;
}

export function imageExists(file: any) {
  const ans = (!file);
  return !ans;
}

export function validateOptionalImage(image: Express.Multer.File) {
  const ans = (image && !image.mimetype.startsWith("image/"));
  return !ans;
}