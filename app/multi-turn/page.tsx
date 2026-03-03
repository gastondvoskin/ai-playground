"use client";

import { useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  attachments?: {
    kind: "image" | "pdf";
    name: string;
    previewUrl?: string;
  }[];
};

export default function MultiTurnChat() {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const content = prompt.trim();
    if (!content || loading) {
      return;
    }

    const userMessage: ChatMessage = { role: "user", content, attachments: [] };
    if (file) {
      userMessage.attachments?.push({
        kind: file.type.startsWith("image/") ? "image" : "pdf",
        name: file.name,
        previewUrl: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      });
    }
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setPrompt("");
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("messages", JSON.stringify(nextMessages));
      formData.append("question", content);
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/multi-turn", {
        method: "POST",
        body: formData,
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
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error in multi-turn request:", err);
      setError("Error fetching response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col bg-radial from-indigo-950/20 via-zinc-950 to-zinc-950 px-3 py-4 sm:px-6 sm:py-8">
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-indigo-900/40 bg-zinc-950/70 shadow-2xl shadow-indigo-950/30 backdrop-blur">
        <header className="border-b border-indigo-900/30 bg-linear-to-r from-zinc-950 via-zinc-900 to-zinc-950 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
                AI chatbot{" "}
                <span className="bg-linear-to-r from-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                  demo
                </span>
              </h1>
              <p className="mt-1 text-sm text-zinc-300">
                Chat naturally with context from attached PDFs or images.
              </p>
            </div>
          </div>
        </header>

        <section className="flex flex-1 flex-col gap-4 overflow-y-auto bg-linear-to-b from-zinc-950 via-zinc-900/80 to-indigo-950/30 px-4 py-5 sm:px-6">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-indigo-700/50 bg-indigo-950/20 p-5 text-sm text-indigo-200">
              Start the conversation. You can attach one PDF or image with your message.
            </div>
          )}

          {messages.map((message, index) => (
            <article
              key={`${message.role}-${index}`}
              className={`w-full max-w-[90%] rounded-2xl border px-4 py-3 sm:max-w-[80%] ${
                message.role === "user"
                  ? "ml-auto border-zinc-700/80 bg-zinc-800 text-zinc-100"
                  : "border-zinc-800 bg-zinc-900/90 text-zinc-100"
              }`}
            >
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-zinc-300">
                {message.role === "user" ? "You" : "Assistant"}
              </p>
              <p className="whitespace-pre-wrap leading-6">{message.content}</p>

              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-3 space-y-3">
                  {message.attachments.map((attachment, attachmentIndex) => (
                    <div
                      key={`${attachment.name}-${attachmentIndex}`}
                      className="rounded-lg border border-zinc-700/60 bg-zinc-900/70 p-2"
                    >
                      <p className="truncate text-xs text-zinc-400">
                        {attachment.name}
                      </p>
                      {attachment.kind === "image" && attachment.previewUrl ? (
                        <img
                          src={attachment.previewUrl}
                          alt={attachment.name}
                          className="mt-2 max-h-64 w-full rounded-md border border-indigo-700/50 object-contain"
                        />
                      ) : (
                        <p className="mt-1 text-xs text-violet-300">PDF attached</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))}
        </section>

        <footer className="border-t border-indigo-900/40 bg-zinc-950/80 px-4 py-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              placeholder="Ask something..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              rows={3}
              className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-70"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-cyan-800/60 bg-cyan-900/20 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-900/30">
                  <span>Attach file</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={loading}
                    className="hidden"
                  />
                </label>
                <span className="max-w-[220px] truncate text-xs text-zinc-400">
                  {file ? file.name : "No file selected"}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-lg bg-linear-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-medium text-white transition hover:from-indigo-400 hover:to-violet-400 disabled:cursor-not-allowed disabled:from-zinc-500 disabled:to-zinc-500"
              >
                {loading ? "Sending..." : "Send message"}
              </button>
            </div>
          </form>

          <div className="mt-2 min-h-5">
            {loading && <p className="text-sm text-zinc-400">Generating response...</p>}
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </footer>
      </div>
    </main>
  );
}
