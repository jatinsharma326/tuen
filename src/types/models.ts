export type ModelCategory =
  | "text-to-image"
  | "image-to-video"
  | "text-to-video"
  | "text-to-speech"
  | "llm"
  | "image-editing"
  | "upscaling";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "slider"
  | "select"
  | "toggle"
  | "image-upload";

export interface ModelField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  default?: unknown;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
  description?: string;
}

export interface ModelDefinition {
  id: string;
  name: string;
  description: string;
  category: ModelCategory;
  outputType: "image" | "video" | "audio" | "text";
  inputSchema: ModelField[];
}

export interface CategoryDef {
  id: ModelCategory;
  label: string;
}
