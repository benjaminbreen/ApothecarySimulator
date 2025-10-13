import { generateImage } from './llmService';

export async function requestDalleImage(description) {
  try {
    const imageUrl = await generateImage(description);
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}
