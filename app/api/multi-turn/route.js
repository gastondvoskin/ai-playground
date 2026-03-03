import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const MAX_TURNS = 20;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function isValidMessage(message) {
  if (!message || typeof message !== "object") return false;
  if (message.role !== "user" && message.role !== "assistant") return false;
  if (typeof message.content !== "string") return false;
  if (!message.content.trim()) return false;
  return true;
}

function parseMessages(rawMessages) {
  if (typeof rawMessages !== "string") {
    return { error: "messages must be provided as a JSON string" };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawMessages);
  } catch {
    return { error: "messages must be valid JSON" };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: "messages must be a non-empty array" };
  }

  if (!parsed.every(isValidMessage)) {
    return {
      error:
        "Each message must include role ('user' or 'assistant') and non-empty content",
    };
  }

  return { messages: parsed };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const rawMessages = formData.get("messages");
    const question = formData.get("question");
    const file = formData.get("file");

    const parsedMessagesResult = parseMessages(rawMessages);
    if (parsedMessagesResult.error) {
      return NextResponse.json(
        { error: parsedMessagesResult.error },
        { status: 400 },
      );
    }

    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json(
        { error: "question must be a non-empty string" },
        { status: 400 },
      );
    }

    if (file != null && !(file instanceof File)) {
      return NextResponse.json({ error: "file must be valid" }, { status: 400 });
    }

    if (file && file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "file is too large (max 10MB)" },
        { status: 400 },
      );
    }

    if (file && file.type !== "application/pdf" && !file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "file must be a PDF or image" },
        { status: 400 },
      );
    }

    const messages = parsedMessagesResult.messages;
    const recentMessages = messages.slice(-MAX_TURNS);
    const previousMessages = recentMessages.slice(0, -1);
    const currentTurnContent = [{ type: "input_text", text: question.trim() }];

    if (file && file.type.startsWith("image/")) {
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      currentTurnContent.push({
        type: "input_image",
        image_url: `data:${file.type};base64,${base64}`,
      });
    }

    if (file && file.type === "application/pdf") {
      const uploadedFile = await client.files.create({
        file,
        purpose: "user_data",
      });
      currentTurnContent.push({
        type: "input_file",
        file_id: uploadedFile.id,
      });
    }

    const input = [
      {
        role: "system",
        content: "You are a concise helpful assistant.",
      },
      ...previousMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      {
        role: "user",
        content: currentTurnContent,
      },
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
