import KeyUsedHistory from "./KeyUsedHistory";
import {
  GoogleGenerativeAI,
  GenerateContentRequest,
  GenerationConfig,
  SafetySetting,
} from "@google/generative-ai";

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

  public async sendRequest(
    modelId: string,
    requestBody: GenerateContentRequest,
    stream: boolean,
  ): Promise<any> {
    const genAI = new GoogleGenerativeAI(this.key);
    const model = genAI.getGenerativeModel({ model: modelId });

    if (stream) {
      return await model.generateContentStream(requestBody);
    } else {
      return await model.generateContent(requestBody);
    }
  }
}

export default ApiKey;
