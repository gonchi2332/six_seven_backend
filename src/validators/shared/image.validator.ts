/**
 * Valida si un archivo es una imagen basándose en su MIME type.
 * @param {Express.Multer.File} image - Archivo a validar.
 * @returns {boolean} True si es una imagen válida, False en caso contrario.
 */
export function validateImage(image: Express.Multer.File) {
  const ans = (!image || (image && !image.mimetype.startsWith("image/")));
  return !ans;
}

/**
 * Valida si un archivo existe (no es nulo o indefinido).
 * @param {any} file - Archivo a verificar.
 * @returns {boolean} True si el archivo existe, False en caso contrario.
 */
export function imageExists(file: any) {
  const ans = (!file);
  return !ans;
}

/**
 * Valida opcionalmente una imagen. Si existe, debe tener un MIME type de imagen.
 * @param {Express.Multer.File} image - Archivo a validar.
 * @returns {boolean} True si no hay imagen o si la imagen es válida, False en caso contrario.
 */
export function validateOptionalImage(image: Express.Multer.File) {
  const ans = (image && !image.mimetype.startsWith("image/"));
  return !ans;
}