"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface SuggestedQuestion {
  question: string;
  category: string;
}

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onQuestionSelect: (question: string) => void;
  isLoading: boolean;
}

export function SuggestedQuestions({
  questions,
  onQuestionSelect,
  isLoading,
}: SuggestedQuestionsProps) {
  return (
    <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-gray-300">
            Suggested Questions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {questions.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => onQuestionSelect(item.question)}
              disabled={isLoading}
              className="h-auto p-3 text-left justify-start bg-gray-700/30 hover:bg-gray-700/50 border border-gray-600/30 hover:border-gray-500/50 transition-all duration-200"
            >
              <div className="space-y-1">
                <div className="text-xs text-blue-400 font-medium">
                  {item.category}
                </div>
                <div className="text-sm text-gray-200 leading-relaxed">
                  {item.question}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
