import Tesseract from "tesseract.js";

export async function extractTextFromImage(
  image: File
): Promise<string> {
  const imageUrl = URL.createObjectURL(image);

  try {
    const worker = await Tesseract.createWorker("eng");

    const result = await worker.recognize(imageUrl);

    await worker.terminate();

    return result.data.text;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}