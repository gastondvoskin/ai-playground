import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export async function POST(request) {
  const { prompt } = await request.json()
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "Answer quoting a philosopher."
        }, 
        {
          role: "user",
          content: prompt
        }, 
      ] 
    });
    return NextResponse.json({ output: response.output_text })
  } catch (error) {
    console.error("Error in OpenaAI call: ", error)
    return NextResponse.json(
      { error: error.message || "Internal error"}, 
      { status: 500}
    )
  }
}
