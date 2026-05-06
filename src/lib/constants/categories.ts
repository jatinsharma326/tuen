import type { CategoryDef } from "@/types/models";

export const MODEL_CATEGORIES: CategoryDef[] = [
  { id: "text-to-image", label: "Text to Image" },
  { id: "image-to-video", label: "Image to Video" },
  { id: "text-to-video", label: "Text to Video" },
  { id: "text-to-speech", label: "Audio" },
  { id: "llm", label: "LLMs" },
  { id: "image-editing", label: "Image Editing" },
  { id: "upscaling", label: "Upscaling" },
];
