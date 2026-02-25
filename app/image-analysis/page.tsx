'use client'

import { useState } from "react";

export default function ImageAnalysis() {
  const [imageUrl, setImageUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setOutput("");
    setLoading(true);
    try {
      const res = await fetch("/api/image-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, question }),
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data.output);
      } else {
        setError(data.error || "Failed to analyze image");
      }
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError("Error analyzing image. Please try again.");
    } finally {
      setQuestion("");
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="Enter image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Ask a question about the image"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          Analyze image
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {output && <p>{output}</p>}
      <p>Example image URL:</p>
      <p>https://openai-documentation.vercel.app/images/cat_and_otter.png</p>
      {imageUrl && <img src={imageUrl} alt="Example image" />}
    </div>
  );
}
