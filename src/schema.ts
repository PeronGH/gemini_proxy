import { z } from "zod";

export const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const chatCompletionRequestSchema = z.object({
  messages: messageSchema.array(),
  stream: z.boolean().default(false),
  temperature: z.number().optional(),
  max_tokens: z.number().optional(),
  stop: z.string().array().optional(),
  top_p: z.number().optional(),
});

export type Message = z.infer<typeof messageSchema>;

export type ChatCompletionRequest = z.infer<typeof chatCompletionRequestSchema>;
