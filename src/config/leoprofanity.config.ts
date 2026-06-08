import { uniqueWords } from "../utils/constants/array.constants";
import LeoProfanity from "leo-profanity";

/*`LeoProfanity.loadDictionary("en");` y `LeoProfanity.loadDictionary("es");` se están cargando
diccionarios para los idiomas inglés y español en la biblioteca LeoProfanity. Esto permite configurar
la dependencia para detectar y filtrar palabras profanas o inapropiadas tanto en inglés como en español.
Al cargar estos diccionarios, la biblioteca LeoProfanity tendrá acceso a un diccionario predefinido o
lista de palabras para comparar al filtrar texto en busca de malas palabras. */
LeoProfanity.loadDictionary("en");
LeoProfanity.loadDictionary("es");

/*`LeoProfanity.add(uniqueWords);` está agregando una serie de palabras únicas a la biblioteca LeoProfanity.
Al agregar estas palabras a la dependencia, también se verificarán si son blasfemias o inapropiadas cuando se
haga el filtrado de texto. Esto permite incluir palabras o términos personalizados en la detección de grocerias
junto con la lista predefinida de palabras de los diccionarios cargados. */
LeoProfanity.add(uniqueWords);

/*`export const profanity = LeoProfanity;` está exportando el objeto `LeoProfanity` como una constante 
denominada `profanity`. Esto permite que otros módulos o archivos importen y utilicen la constante `profanity` 
para acceder la funcionalidad proporcionada por la biblioteca `LeoProfanity`, para detectar y filtrar
palabras profanas o inapropiadas en textos tanto para el idioma inglés como para el español. */
export const profanity = LeoProfanity;