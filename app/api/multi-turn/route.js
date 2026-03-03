import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const MAX_TURNS = 20;

function isValidMessage(message) {
  if (!message || typeof message !== "object") return false;
  if (message.role !== "user" && message.role !== "assistant") return false;
  if (typeof message.content !== "string") return false;
  if (!message.content.trim()) return false;
  return true;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const messages = body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages must be a non-empty array" },
        { status: 400 },
      );
    }

    if (!messages.every(isValidMessage)) {
      return NextResponse.json(
        {
          error:
            "Each message must include role ('user' or 'assistant') and non-empty content",
        },
        { status: 400 },
      );
    }

    const recentMessages = messages.slice(-MAX_TURNS);
    const input = [
      {
        role: "system",
        content: "You are a concise helpful assistant.",
      },
      ...recentMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input,
    });

    return NextResponse.json({ output: response.output_text || "" });
  } catch (error) {
    console.error("Error in OpenAI multi-turn call:", error);
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 },
    );
  }
}
