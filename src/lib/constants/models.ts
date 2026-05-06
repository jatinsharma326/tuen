import type { ModelDefinition } from "@/types/models";

const prompt: ModelDefinition["inputSchema"] = [
  { key: "prompt", label: "Prompt", type: "textarea", required: true, placeholder: "Describe what you want to generate..." },
  { key: "image_size", label: "Image Size", type: "select", default: "landscape_16_9", options: [
    { label: "Square (1:1)", value: "square" },
    { label: "Landscape (16:9)", value: "landscape_16_9" },
    { label: "Portrait (9:16)", value: "portrait_9_16" },
    { label: "Landscape (4:3)", value: "landscape_4_3" },
  ]},
  { key: "num_inference_steps", label: "Steps", type: "slider", default: 28, min: 1, max: 50, step: 1 },
  { key: "guidance_scale", label: "Guidance Scale", type: "slider", default: 3.5, min: 1, max: 20, step: 0.5 },
  { key: "seed", label: "Seed", type: "number", placeholder: "Random" },
];

const imgToVid = [
  { key: "image_url", label: "Image", type: "image-upload" as const, required: true },
  { key: "motion_bucket_id", label: "Motion", type: "slider" as const, default: 127, min: 1, max: 255, step: 1 },
  { key: "fps", label: "FPS", type: "slider" as const, default: 6, min: 1, max: 30, step: 1 },
];

export const MODELS: ModelDefinition[] = [
  { id: "flux/dev", name: "FLUX.1 [dev]", description: "High-quality text-to-image model by Black Forest Labs.", category: "text-to-image", outputType: "image", inputSchema: prompt },
  { id: "flux-pro/v1.1", name: "FLUX Pro 1.1", description: "Professional text-to-image with enhanced quality.", category: "text-to-image", outputType: "image", inputSchema: prompt },
  { id: "flux/schnell", name: "FLUX.1 [schnell]", description: "Fastest FLUX model for rapid generation.", category: "text-to-image", outputType: "image", inputSchema: prompt },
  { id: "stable-diffusion-xl", name: "SDXL", description: "Stable Diffusion XL for high-res images.", category: "text-to-image", outputType: "image", inputSchema: prompt },
  { id: "kolors", name: "Kolors", description: "Kwai's text-to-image with vivid colors.", category: "text-to-image", outputType: "image", inputSchema: prompt },
  { id: "aura-flow", name: "AuraFlow", description: "Open-source flow-based generation model.", category: "text-to-image", outputType: "image", inputSchema: prompt },
  { id: "nucleus-image", name: "Nucleus Image", description: "ModelScope Nucleus high-quality text-to-image generation.", category: "text-to-image", outputType: "image", inputSchema: prompt },
  { id: "stable-video", name: "Stable Video Diffusion", description: "Generate short video clips from images.", category: "image-to-video", outputType: "video", inputSchema: imgToVid },
  { id: "animatediff", name: "AnimateDiff", description: "Animate images with text-guided motion.", category: "text-to-video", outputType: "video", inputSchema: prompt },
  { id: "minimax-video", name: "MiniMax Video", description: "High quality AI video generation.", category: "text-to-video", outputType: "video", inputSchema: prompt },
  { id: "whisper", name: "Whisper", description: "OpenAI speech recognition model.", category: "text-to-speech", outputType: "audio", inputSchema: [{ key: "audio_url", label: "Audio URL", type: "text", required: true, placeholder: "https://..." }] },
  { id: "zai-org/GLM-5.1", name: "GLM-5.1", description: "Zhipu AI's latest large language model via ModelScope.", category: "llm", outputType: "text", inputSchema: [{ key: "prompt", label: "Prompt", type: "textarea", required: true, placeholder: "Ask anything..." }] },
  { id: "real-esrgan", name: "Real-ESRGAN", description: "Image upscaling up to 4x resolution.", category: "upscaling", outputType: "image", inputSchema: [{ key: "image_url", label: "Image", type: "image-upload", required: true }, { key: "scale", label: "Scale", type: "select", default: "2", options: [{ label: "2x", value: "2" }, { label: "4x", value: "4" }] }] },
  { id: "inpaint", name: "Inpainting", description: "Edit parts of images with AI.", category: "image-editing", outputType: "image", inputSchema: [{ key: "image_url", label: "Image", type: "image-upload", required: true }, { key: "prompt", label: "Prompt", type: "textarea", required: true, placeholder: "Describe edit..." }] },
];
