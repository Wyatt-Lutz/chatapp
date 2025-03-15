import { readAndCompressImage } from "browser-image-resizer";

export const compressImage = async(originalImage) => {
  const imageCompressionConfig = {
      quality: 3.0,
      maxWidth: 512,
      maxHeight: 512,
  };

  const resizedImage = await readAndCompressImage(originalImage, imageCompressionConfig);
  return resizedImage;
}