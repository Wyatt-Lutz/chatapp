import { readAndCompressImage } from "browser-image-resizer";

export const compressImage = async(originalImage) => {
  const imageCompressionConfig = {
      quality: 0.5,
      maxWidth: 128,
      maxHeight: 128,
  };

  const resizedImage = await readAndCompressImage(originalImage, imageCompressionConfig);
  return resizedImage;
}
