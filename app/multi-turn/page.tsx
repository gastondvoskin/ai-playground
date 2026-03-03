"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function MultiTurnChat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const content = prompt.trim();
    if (!content || loading) {
      return;
    }

    const userMessage: ChatMessage = { role: "user", content };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setPrompt("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/multi-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error fetching response.");
        return;
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.output || "",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error in multi-turn request:", err);
      setError("Error fetching response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Multi-Turn Chat</h1>

      <div>
        {messages.map((message, index) => (
          <p key={`${message.role}-${index}`}>
            <strong>{message.role === "user" ? "You" : "Bot"}:</strong>{" "}
            {message.content}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type your message"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          Send
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
