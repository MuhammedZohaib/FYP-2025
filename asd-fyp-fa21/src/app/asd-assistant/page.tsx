"use client";

import type React from "react";
import { useChat } from "ai/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { MessageBubble } from "@/components/ui/message-bubble";
import { SuggestedQuestions } from "@/components/ui/suggested-questions";
import { Send, AlertTriangle } from "lucide-react";

const SUGGESTED_QUESTIONS = [
  {
    question: "What are early signs of ASD in children?",
    category: "Early Detection",
  },
  {
    question: "How is ASD diagnosed?",
    category: "Diagnosis",
  },
  {
    question: "What therapies are available for ASD?",
    category: "Treatment",
  },
  {
    question: "How can I support a child with ASD?",
    category: "Support",
  },
];

export default function ASDAssistant() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setShowSuggestions(false);
    handleSubmit(e);
  };

  const handleSuggestedQuestion = (question: string) => {
    if (isLoading) return;
    setShowSuggestions(false);
    // Set the input value first
    handleInputChange({ target: { value: question } } as any);
    // Then submit after a short delay to ensure the input is updated
    setTimeout(() => {
      handleSubmit(new Event("submit") as any, {
        data: { message: question },
      });
    }, 100);
  };

  // Filter messages to only show user and assistant messages
  const displayMessages = messages.filter(
    (message) => message.role === "user" || message.role === "assistant"
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      <BackgroundBeams />

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <a
                href="/home"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span className="text-sm font-medium">Back to Home</span>
              </a>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                ASD AI
              </h1>
              <div className="w-24"></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-6 flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
          <Card className="flex-1 bg-black/40 backdrop-blur-sm border-white/10 flex flex-col h-full">
            <CardHeader className="pb-4 border-b border-white/10">
              <CardTitle className="text-lg text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Ask me anything about Autism Spectrum Disorder
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {displayMessages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-2xl">🧠</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Welcome to ASD Assistant
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      I'm here to help you learn about Autism Spectrum Disorder.
                      Ask me questions or choose from the suggestions below.
                    </p>
                  </div>
                )}

                {displayMessages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isStreaming={
                      isLoading && index === displayMessages.length - 1
                    }
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions */}
              {showSuggestions && displayMessages.length === 0 && (
                <div className="mb-6">
                  <SuggestedQuestions
                    questions={SUGGESTED_QUESTIONS}
                    onQuestionSelect={handleSuggestedQuestion}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {/* Input Form */}
              <form
                onSubmit={onSubmit}
                className="flex gap-3 sticky bottom-0 bg-black/20 backdrop-blur-sm p-4 -mx-4 -mb-4 border-t border-white/10"
              >
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask me about ASD..."
                  className="flex-1 bg-gray-800/50 border-gray-600 focus:border-blue-500 text-white placeholder-gray-400"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm sticky bottom-0">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-center max-w-3xl">
                This AI provides educational information about ASD only. Always
                consult healthcare professionals for medical advice.
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
