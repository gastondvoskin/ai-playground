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
