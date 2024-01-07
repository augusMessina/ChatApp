import type { NextRequest } from "next/server";
import order from "@/utils/ai-order";
import {
  ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const config = {
  runtime: "edge",
};

const apiConfig = new Configuration({
  apiKey: process.env.OPENAI_API_KEY!,
});

const openai = new OpenAIApi(apiConfig);

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: Request) {
  // Extract the `messages` from the body of the request
  let { newMessage } = (await req.json()) as {
    newMessage: { language: string; message: string; to: string[] };
  };
  const prompt: ChatCompletionRequestMessage[] = [
    {
      role: "system",
      content: order,
    },
    {
      role: "user",
      content: JSON.stringify(newMessage),
    },
  ];

  // Request the OpenAI API for the response based on the prompt
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    stream: true,
    messages: prompt,
    max_tokens: 200,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  });

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response);
  const reader = stream.getReader();
  let accumulatedText = "";
  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Stream is finished, break out of the loop
        break;
      }

      const text = new TextDecoder().decode(value);
      accumulatedText += text;
    }
  } finally {
    reader.releaseLock(); // Release the lock when done reading
  }
  // Return a JSON response with the obtained text
  const res = new Response(
    JSON.stringify({ translation: JSON.parse(accumulatedText).translation }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // Return the Response instance
  return res;
}
