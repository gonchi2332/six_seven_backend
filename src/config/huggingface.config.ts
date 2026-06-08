import { env } from "../config/env.config";
import { InferenceClient } from "@huggingface/inference";

/*Este fragmento de código exporta una constante llamada `hf` que se inicializa con una nueva instancia de
la clase `InferenceClient` de la biblioteca `@huggingface/inference`. Al constructor de `InferenceClient` se 
le pasa la clave API almacenada en el objeto `env` debajo de la clave
`HUGGING_FACE_API_KEY`, esto permite que el código cree un cliente para interactuar con la API de Hugging
Face utilizando la clave API proporcionada. */
export const hf = new InferenceClient(env.HUGGING_FACE_API_KEY);