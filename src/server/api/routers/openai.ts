import { z } from "zod";
import {
  type ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const chatCompletionHandler = async (
  message: ChatCompletionRequestMessage["content"]
) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: message }],
  });

  return completion.data.choices[0]?.message;
};

export const openaiRouter = createTRPCRouter({
  test: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(async ({ input }) => {
      const messages = [
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: input.text,
        },
      ];

      const chatGPT = await openai.createChatCompletion({
        model: "gpt-4",
        messages,
      });

      const chatGPTMessage = chatGPT.data.choices[0]?.message;

      return {
        result: chatGPTMessage,
      };
    }),
  chat: publicProcedure
    .input(z.object({ text: z.string(), imageData: z.string() }))
    .mutation(async ({ input }) => {
      const message = [
        input.text,
        { image: Buffer.from(input.imageData, "base64") },
      ];

      const response = await chatCompletionHandler(message);

      return response;
    }),
});
