import type {
  AnalyzeFaceInput,
  FaceAnalysisResult,
  PreviewGenerationInput,
  PreviewGenerationResult,
} from "./types";
import { estimateFaceShapeFromLandmarks } from "./face-shape";

export interface AIHairTryOnProvider {
  readonly name: string;
  analyzeFace(input: AnalyzeFaceInput): Promise<FaceAnalysisResult>;
  generateHairstylePreview(
    input: PreviewGenerationInput
  ): Promise<PreviewGenerationResult>;
  generateHairColorPreview?(
    input: PreviewGenerationInput
  ): Promise<PreviewGenerationResult>;
}

class CompositeHairTryOnProvider implements AIHairTryOnProvider {
  readonly name = "composite";

  async analyzeFace(input: AnalyzeFaceInput): Promise<FaceAnalysisResult> {
    if (input.landmarks?.length && input.faceBox) {
      const w = input.faceBox.width * 2 || 640;
      const h = input.faceBox.height * 2 || 640;
      return estimateFaceShapeFromLandmarks(input.landmarks, w, h);
    }
    return {
      valid: false,
      error: "No face detected. Please look straight at the camera.",
    };
  }

  async generateHairstylePreview(
    input: PreviewGenerationInput
  ): Promise<PreviewGenerationResult> {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        return await this.generateWithOpenAI(input, openaiKey);
      } catch {
        /* fall through to client composite */
      }
    }

    return {
      success: true,
      provider: "client-composite",
      error:
        "Using visual overlay preview. For photorealistic AI previews, configure OPENAI_API_KEY on the server.",
    };
  }

  private async generateWithOpenAI(
    input: PreviewGenerationInput,
    apiKey: string
  ): Promise<PreviewGenerationResult> {
    const prompt =
      input.aiPromptInstructions ??
      "Apply this hairstyle realistically to the person. Preserve face identity, skin tone, and lighting. Modify only the hair region.";

    const fs = await import("fs/promises");
    const path = await import("path");
    const absolute = path.join(process.cwd(), "uploads", input.originalImagePath);
    const buffer = await fs.readFile(absolute);

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: (() => {
        const form = new FormData();
        form.append(
          "image",
          new Blob([buffer], { type: "image/png" }),
          "photo.png"
        );
        form.append("prompt", prompt);
        form.append("model", "dall-e-2");
        form.append("n", "1");
        form.append("size", "512x512");
        return form;
      })(),
    });

    if (!response.ok) {
      return {
        success: false,
        provider: "openai",
        error: "AI provider failed. Using overlay preview instead.",
      };
    }

    const data = (await response.json()) as {
      data?: { b64_json?: string }[];
    };
    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      return { success: false, provider: "openai", error: "Empty AI response." };
    }

    return {
      success: true,
      provider: "openai",
      previewImageBase64: b64,
    };
  }
}

let provider: AIHairTryOnProvider | null = null;

export function getAIHairTryOnService(): AIHairTryOnProvider {
  if (!provider) {
    provider = new CompositeHairTryOnProvider();
  }
  return provider;
}

export function setAIHairTryOnProvider(forTesting: AIHairTryOnProvider) {
  provider = forTesting;
}
