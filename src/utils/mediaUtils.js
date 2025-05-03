import { readAndCompressImage } from "browser-image-resizer";

export const compressImage = async(originalImage) => {
  const imageCompressionConfig = {
      quality: 0.8,
      maxWidth: 500,
      maxHeight: 500,
  };

  const resizedImage = await readAndCompressImage(originalImage, imageCompressionConfig);
  return resizedImage;
}
