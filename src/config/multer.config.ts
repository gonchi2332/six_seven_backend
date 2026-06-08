import multer from "multer";

/*`const storage = multer.memoryStorage();` está creando un motor de almacenamiento que almacena los archivos 
cargados en la memoria como objetos Buffer. Esto significa que los archivos cargados se mantienen en la memoria
temporalmente en lugar de guardarse en el disco. */
const storage = multer.memoryStorage();

/**
 * La función `fileFilter` comprueba si el archivo cargado es una imagen según su MIME type y permite
 * solo archivos de imagen.
 * @param req -El parámetro `req` en la función `fileFilter` representa el objeto de solicitud, que
 * contiene información sobre la solicitud HTTP que se realiza. Este parámetro se utiliza normalmente para acceder
 * detalles como encabezados, parámetros y cuerpo de la solicitud.
 * @param file: el parámetro `file` en la función `fileFilter` es un objeto que representa el
 * archivo que se está cargando. Normalmente contiene información sobre el archivo, como su nombre, tamaño,
 * mime type y otros metadatos relacionados con el archivo. En esta función específica, el código verifica si
 * el mime type del archivo corresponde a una imagen.
 * @param cb: el parámetro `cb` en la función `fileFilter` representa una función de devolución de llamada que es
 * utilizado para indicar el resultado de la operación de filtrado de archivos. Por lo general, se llama con un
 * error como primer argumento (si ocurrió un error durante el filtrado) o "nulo" como primer argumento.
 * @returns Un mensaje de error "Solo se permiten imágenes." se devuelve si el MIME type del archivo no
 * no comienza con "imagen/".
 */
const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Solo se permiten imagenes."));
  }
  cb(null, true);
};

/*La línea `const standarSize = 2 *1024 *1024;` está calculando el límite de tamaño estándar para archivos 
cargados en bytes. */
const standarSize = 2 * 1024 * 1024;


/*La declaración `export const upload = multer({ ... });` está creando una función de middleware utilizando la
libreria `multer` en TypeScript. Esta función de middleware está configurada con las siguientes opciones: */
export const upload = multer({
  storage,
  limits: {
    fileSize: standarSize
  },
  fileFilter,
}); 