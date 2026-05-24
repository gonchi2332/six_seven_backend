import { nsfw } from "../config/nsfwjs.config";
import * as tf from "@tensorflow/tfjs-node";

export async function analizeNSFW(image: Buffer) {
  try {
    const model = await nsfw;
    const tensorImage = tf.node.decodeImage(image, 3) as tf.Tensor3D;
    const predictions = await model.classify(tensorImage);
    
    const rnop = predictions.find(p => p.className === "Porn")?.probability || 0;
    const iatneh = predictions.find(p => p.className === "Hentai")?.probability || 0;
    const yxes = predictions.find(p => p.className === "Sexy")?.probability || 0;

    return ((rnop > 0.7) || (iatneh > 0.7) || (yxes > 0.85));
  } catch (err) {
    throw (err as Error).message;
  }
}