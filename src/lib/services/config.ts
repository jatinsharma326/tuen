export interface ServiceConfig {
  name: string;
  limitKey: "image" | "tts" | "transcribe" | "llm";
  gradioBaseUrl: string;
  gradioFnName: string;
  description: string;
  llmBaseUrl?: string;
}

export const SERVICES: Record<string, ServiceConfig> = {
  image_gen: {
    name: "Image Generation",
    limitKey: "image",
    gradioBaseUrl: process.env.GRADIO_IMAGE_GEN_URL || "",
    gradioFnName: "generate_batch_turbo",
    description: "Generate images from text via Z-Image Turbo",
  },
  tts: {
    name: "Text to Speech",
    limitKey: "tts",
    gradioBaseUrl: process.env.GRADIO_TTS_URL || "",
    gradioFnName: "generate_podcast_wrapper",
    description: "Convert text to natural speech via VibeVoice",
  },
  tts_voxcpm: {
    name: "Text to Speech",
    limitKey: "tts",
    gradioBaseUrl: process.env.GRADIO_TTS_VOXCPM_URL || "",
    gradioFnName: "generate",
    description: "Convert text to natural speech via VoxCPM",
  },
  nucleus_image: {
    name: "Nucleus Image Generation",
    limitKey: "image",
    gradioBaseUrl: process.env.GRADIO_NUCLEUS_IMAGE_URL || "",
    gradioFnName: "generate_image",
    description: "Generate images from text via Nucleus Image",
  },
  transcribe: {
    name: "Distil-Whisper",
    limitKey: "transcribe",
    gradioBaseUrl: process.env.GRADIO_TRANSCRIBE_URL || "",
    gradioFnName: "transcribe",
    description: "Convert audio to text with Distil-Whisper",
  },
  llm: {
    name: "LLM Chat",
    limitKey: "llm",
    gradioBaseUrl: "",
    gradioFnName: "",
    llmBaseUrl: process.env.MODELSCOPE_LLM_URL || "",
    description: "Chat with large language models via ModelScope",
  },
};
