import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";
import {
  chatCompletion,
  chatCompletionStreamResponse,
} from "custom_openai_api";
import { chatCompletionRequestSchema } from "./schema.ts";
import { mapRole, removePrefix } from "./utils.ts";

export const chatCompletionHandler: Deno.ServeHandler = async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = removePrefix(
    req.headers.get("Authorization") ?? "",
    "Bearer ",
  );

  if (!apiKey) {
    return new Response("Unauthorized", { status: 401 });
  }

  const request = chatCompletionRequestSchema.parse(await req.json());

  const userMessage = request.messages.pop();
  if (!userMessage || userMessage.role !== "user") {
    return new Response("Last message must be from user", { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({
    history: request.messages.map((message) => ({
      role: mapRole(message.role),
      parts: message.content,
    })),
    generationConfig: {
      maxOutputTokens: request.max_tokens,
      stopSequences: request.stop,
      temperature: request.temperature,
      topP: request.top_p,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
      },
    ],
  });

  if (!request.stream) {
    const { response } = await chat.sendMessage(userMessage.content);
    const completion = chatCompletion({ content: response.text() });
    return Response.json(completion);
  }

  const { stream } = await chat.sendMessageStream(userMessage.content);
  return chatCompletionStreamResponse((async function* () {
    for await (const chunk of stream) {
      yield chunk.text();
    }
  })());
};
