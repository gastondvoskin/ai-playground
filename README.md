# AI Playground

## Steps to create a simple AI playground

1. Create a new Next.js app
pnpm create next-app@latest my-app --yes
cd my-app

2. Add openai
pnpm add openai

3. Add .env.local
.env.local
OPENAI_API_KEY=your_api_key_here

4. src/api/chat/route.js
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


5. app/page.tsx
"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchResponse = async (prompt: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    });
      const data = await response.json();
      setResponse(data.output);
    } catch (error) {
      console.error("Error fetching response:", error);
      setError("Error fetching response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchResponse(prompt);
    setPrompt("");
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your message"
          value={prompt}
          onChange={handlePromptChange}
        />
        <button type="submit">Ask the AI</button>
      </form>
      {response && <p>{response}</p>}
      {error && <p>{error}</p>}
      {loading && <p>Loading...</p>}
    </div>
  );
}
