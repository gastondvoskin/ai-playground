import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function POST(request) {
  const { imageUrl, question } = await request.json();
  try {
    const response = await client.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: question,
            },
            {
              type: "input_image",
              image_url: imageUrl,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ output: response.output_text });
  } catch (error) {
    console.error("Error in OpenAI image-analysis call:", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 },
    );
  }
}
