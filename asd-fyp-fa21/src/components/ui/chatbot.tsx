"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FaRobot, FaUser, FaPaperPlane } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    name: string;
    url: string;
    snippet: string;
  }>;
}

interface SuggestedQuestion {
  question: string;
  category: string;
}

interface ChatbotProps {
  suggestedQuestions?: SuggestedQuestion[];
}

export function Chatbot({ suggestedQuestions }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your ASD Assistant. How can I help you today? You can ask me anything about Autism Spectrum Disorder or choose from the suggested questions below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      console.error("Failed to get response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    if (isLoading) return;
    // Set the input value first
    setInput(question);
    // Submit after a short delay to ensure the input is updated
    setTimeout(() => {
      const fakeEvent = new Event("submit") as any;
      handleSubmit(fakeEvent);
    }, 100);
  };

  return (
    <Card className="w-full h-full bg-black/40 backdrop-blur-sm border-white/10 flex flex-col">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 ${
                message.role === "assistant" ? "justify-start" : "justify-end"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <FaRobot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.role === "assistant"
                    ? "bg-gray-800/80 backdrop-blur-sm"
                    : "bg-gradient-to-r from-blue-600 to-purple-600"
                } max-w-[80%]`}
              >
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p {...props} className="mb-2 last:mb-0" />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul {...props} className="list-disc pl-4 mb-2" />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol {...props} className="list-decimal pl-4 mb-2" />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 {...props} className="text-lg font-semibold mb-2" />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong {...props} className="font-semibold" />
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400 mb-2">
                      Related Sources:
                    </p>
                    <div className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="text-xs">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {source.name}
                          </a>
                          <p className="text-gray-400 mt-1">{source.snippet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <FaUser className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-gray-400 p-4">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Suggested Questions */}
          {showSuggestions &&
            suggestedQuestions &&
            suggestedQuestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(item.question)}
                    className="text-left px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-sm text-white border border-white/10 hover:border-blue-500/50 group"
                    disabled={isLoading}
                  >
                    <span className="text-xs block mb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300">
                      {item.category}
                    </span>
                    {item.question}
                  </button>
                ))}
              </div>
            )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about ASD..."
              className="flex-1 bg-gray-800/50 border-gray-600 focus:border-blue-500 text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
            >
              <FaPaperPlane className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
