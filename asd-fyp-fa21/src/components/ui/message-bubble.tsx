"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bot,
  User,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Components } from "react-markdown";
import type { Message } from "ai/react";

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<"up" | "down" | null>(null);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReaction = (type: "up" | "down") => {
    setReaction(reaction === type ? null : type);
  };

  // Custom components for ReactMarkdown
  const components: Components = {
    a: ({ href, children }) => (
      <span className="inline-block">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline transition-colors group"
        >
          {children}
          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
      </span>
    ),
    p: ({ children }) => (
      <div className="mb-2 last:mb-0 text-[0.925rem] leading-relaxed text-gray-100">
        {children}
      </div>
    ),
    ul: ({ children }) => (
      <div className="mb-2">
        <ul className="list-disc pl-4 text-[0.925rem] text-gray-100">
          {children}
        </ul>
      </div>
    ),
    ol: ({ children }) => (
      <div className="mb-2">
        <ol className="list-decimal pl-4 text-[0.925rem] text-gray-100">
          {children}
        </ol>
      </div>
    ),
    h2: ({ children }) => (
      <div className="text-lg font-semibold mb-2 mt-4 first:mt-0 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        {children}
      </div>
    ),
    h3: ({ children }) => (
      <div className="text-base font-semibold mb-2 mt-3 first:mt-0 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
        {children}
      </div>
    ),
    strong: ({ children }) => (
      <span className="font-medium bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
        {children}
      </span>
    ),
    code: ({ className, children }) => {
      const isInline = !className;
      return (
        <code
          className={
            isInline
              ? "bg-black/50 px-1.5 py-0.5 rounded text-sm font-mono text-gray-200"
              : "block bg-black/50 p-3 rounded-lg text-sm font-mono text-gray-200 overflow-x-auto my-2"
          }
        >
          {children}
        </code>
      );
    },
    blockquote: ({ children }) => (
      <div className="my-2">
        <blockquote className="border-l-2 border-blue-500/50 pl-4 italic text-gray-300">
          {children}
        </blockquote>
      </div>
    ),
    li: ({ children }) => (
      <li className="text-[0.925rem] text-gray-100">{children}</li>
    ),
  };

  return (
    <div
      className={`flex items-start gap-3 group ${
        message.role === "assistant" ? "justify-start" : "justify-end"
      }`}
    >
      {message.role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`relative max-w-[85%] ${
          message.role === "assistant"
            ? "bg-black/80 text-white rounded-2xl rounded-tl-sm"
            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm"
        } px-4 py-3 shadow-lg backdrop-blur-sm border border-white/5`}
      >
        {message.role === "assistant" && (
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-black/80 rotate-45 rounded-sm border-l border-t border-white/5" />
        )}
        {message.role === "user" && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-blue-600 to-purple-600 rotate-45 rounded-sm" />
        )}

        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {message.content}
          </ReactMarkdown>
        </div>

        {isStreaming && (
          <div className="flex items-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        {message.role === "assistant" && !isStreaming && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 px-2 text-xs text-gray-400 hover:text-white hover:bg-white/5"
            >
              {copied ? (
                <Check className="w-3 h-3 mr-1" />
              ) : (
                <Copy className="w-3 h-3 mr-1" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <div className="h-4 w-px bg-white/5" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction("up")}
              className={`h-6 px-2 text-xs ${
                reaction === "up"
                  ? "text-green-400 bg-green-400/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction("down")}
              className={`h-6 px-2 text-xs ${
                reaction === "down"
                  ? "text-red-400 bg-red-400/10"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {message.role === "user" && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
