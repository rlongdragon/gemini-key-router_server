import KeyUsedHistory from "./KeyUsedHistory";
import {
  GoogleGenerativeAI,
  GenerateContentRequest,
  GenerationConfig,
  SafetySetting,
  GenerateContentResponse,
  Content,
  FinishReason,
} from "@google/generative-ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, generateText, ModelMessage, LanguageModelUsage } from "ai";

/**
 * ApiKey class to manage API keys.
 */
class ApiKey {
  private key: string;
  private keyUsedHistory: KeyUsedHistory;

  public id: string;
  public rpd: number;

  constructor(id: string, key: string, rpd: number) {
    this.id = id;
    this.key = key;
    this.rpd = rpd;
    this.keyUsedHistory = new KeyUsedHistory(this.key);
  }

  /**
   * Returns the full API key.
   */
  getKey(): string {
    return this.key;
  }

  /**
   * Returns a partially masked API key.
   *
   * Ex. AIza*******************************RhAw
   */
  getPartialKey(length: number): string {
    return this.key.slice(0, 4) + "*".repeat(length - 8) + this.key.slice(-4);
  }

  private _transformRequest(
    requestBody: GenerateContentRequest
  ): {
    messages: ModelMessage[];
    system?: string;
    [key: string]: any; // For other properties
  } {
    const messages: ModelMessage[] = requestBody.contents.map((content: Content) => {
      const role = content.role === "model" ? "assistant" : "user";
      const contentText = content.parts.map((part) => part.text).join("");
      return { role: role, content: contentText };
    });

    const systemInstruction = requestBody.systemInstruction as Content | undefined;
    const system = systemInstruction?.parts.map(p => p.text).join('\n');

    return {
      messages,
      system,
      ...(requestBody.generationConfig || {}),
      maxTokens: requestBody.generationConfig?.maxOutputTokens,
      providerOptions: {
        google: {
          safetySettings: requestBody.safetySettings,
        },
      },
    };
  }

  private async *_transformStreamResponse(
    result: import("ai").StreamTextResult<any, any>
  ): AsyncGenerator<GenerateContentResponse> {
    for await (const textDelta of result.textStream) {
      yield {
        candidates: [
          {
            content: { parts: [{ text: textDelta }], role: "model" },
            finishReason: undefined,
            index: 0,
            safetyRatings: [],
          },
        ],
        promptFeedback: undefined,
      };
    }

    const usage = await result.usage;
    const usageMetadata = {
      promptTokenCount: usage.inputTokens ?? 0,
      candidatesTokenCount: usage.outputTokens ?? 0,
      totalTokenCount: usage.totalTokens ?? 0,
    };

    // Yield a final response with usage metadata
    yield {
      candidates: [],
      promptFeedback: undefined,
      usageMetadata: usageMetadata,
    };
  }

  public async sendRequest(
    modelId: string,
    requestBody: GenerateContentRequest,
    stream: boolean
  ): Promise<any> {
    const google = createGoogleGenerativeAI({
      baseURL:
        process.env.GOOGLE_API_BASE_URL || "https://generativelanguage.googleapis.com/v1beta",
      apiKey: this.key,
    });

    const transformedRequest = this._transformRequest(requestBody);

    console.log(
      `Sending request to model: ${modelId} with key: ${this.getPartialKey(
        20
      )} using @ai-sdk/google`
    );

    if (stream) {
      const result = await streamText({
        model: google(modelId),
        ...transformedRequest,
      });
      return { stream: this._transformStreamResponse(result), usage: result.usage };
    } else {
      const result = await generateText({
        model: google(modelId),
        ...transformedRequest,
      });

      const { usage } = result;
      const usageMetadata = {
        promptTokenCount: usage.inputTokens ?? 0,
        candidatesTokenCount: usage.outputTokens ?? 0,
        totalTokenCount: usage.totalTokens ?? 0,
      };

      const response: GenerateContentResponse = {
        candidates: [
          {
            content: {
              parts: [{ text: result.text }],
              role: "model",
            },
            finishReason: FinishReason.STOP,
            index: 0,
            safetyRatings: [],
          },
        ],
        promptFeedback: undefined,
        usageMetadata: usageMetadata,
      };
      return { response, usage };
    }
  }
}

export default ApiKey;
