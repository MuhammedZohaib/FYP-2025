import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Keywords related to ASD for topic validation
const ASD_KEYWORDS = [
  "autism",
  "asd",
  "autistic",
  "asperger",
  "neurodevelopmental",
  "stimming",
  "sensory",
  "developmental delay",
  "social communication",
  "repetitive behavior",
  "early intervention",
  "aba therapy",
  "speech therapy",
  "occupational therapy",
  "iep",
  "special education",
  "behavioral therapy",
  "social skills",
  "nonverbal",
  "meltdown",
  "routine",
  "diagnosis",
  "spectrum disorder",
  "developmental disorder",
  "support needs",
  "communication",
  "social interaction",
  "behavior patterns",
];

// Check if the question is related to ASD
function isASDRelated(question: string): boolean {
  const normalizedQuestion = question.toLowerCase();

  // Direct mentions of autism/ASD
  if (
    normalizedQuestion.includes("autism") ||
    normalizedQuestion.includes("asd")
  ) {
    return true;
  }

  // Check for related keywords
  const keywordMatches = ASD_KEYWORDS.filter((keyword) =>
    normalizedQuestion.includes(keyword.toLowerCase())
  );

  // If multiple keywords are found, it's likely ASD-related
  return keywordMatches.length >= 1;
}

const systemPrompt = `You are an expert on Autism Spectrum Disorder (ASD) and your role is to provide helpful, accurate information ONLY about ASD and closely related topics to users.

IMPORTANT RULES:
1. ONLY answer questions related to:
   - Autism Spectrum Disorder (ASD)
   - Neurodevelopmental conditions closely related to ASD
   - ASD diagnosis, symptoms, treatments, and support
   - ASD research and understanding
   - Support for individuals with ASD and their families
   - Educational approaches for ASD
   - ASD awareness and advocacy

2. For ANY question not directly related to ASD:
   - Politely explain that you can only provide information about ASD
   - Redirect the conversation back to ASD-related topics
   - Example: "I apologize, but I'm specifically designed to help with questions about Autism Spectrum Disorder. Would you like to know more about ASD instead?"

When answering ASD-related questions, you should:
1. Provide clear, factual information about ASD
2. Explain concepts in simple, understandable terms
3. Be empathetic and supportive in your responses
4. Clarify that you're an AI assistant and not a medical professional
5. Encourage users to seek professional medical advice for diagnosis and treatment
6. Focus on evidence-based information from reliable sources
7. Avoid making definitive medical diagnoses
8. Provide general information about ASD symptoms, treatments, and support resources
9. Format your responses using markdown for better readability:
   - Use **bold** for emphasis
   - Use bullet points or numbered lists where appropriate
   - Use headings (##) for sections
   - Include relevant source links when helpful
10. Keep your responses concise but informative

Remember to maintain a helpful and supportive tone while staying within the bounds of providing general information rather than medical advice.`;

interface WebSearchResult {
  name: string;
  url: string;
  snippet: string;
}

async function searchWeb(query: string): Promise<WebSearchResult[]> {
  try {
    if (!process.env.BING_API_KEY) {
      return [];
    }

    const response = await fetch(
      `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(
        query + " autism spectrum disorder ASD"
      )}`,
      {
        headers: {
          "Ocp-Apim-Subscription-Key": process.env.BING_API_KEY,
        },
      }
    );
    const data = await response.json();
    return (data.webPages?.value?.slice(0, 3) || []).map((result: any) => ({
      name: result.name,
      url: result.url,
      snippet: result.snippet,
    }));
  } catch (error) {
    console.error("Web search error:", error);
    return [];
  }
}

// Suggested topics to redirect users
const SUGGESTED_TOPICS = [
  "What are the early signs of autism in children?",
  "How is ASD diagnosed?",
  "What therapies are available for autism?",
  "How can I support someone with ASD?",
  "What are common ASD behaviors?",
  "How does ASD affect social communication?",
];

function getOffTopicResponse(): string {
  // Randomly select 3 suggested topics
  const shuffledTopics = SUGGESTED_TOPICS.sort(() => Math.random() - 0.5);
  const selectedTopics = shuffledTopics.slice(0, 3);

  return `I apologize, but I'm specifically designed to help with questions about Autism Spectrum Disorder (ASD). I can't provide information about unrelated topics.

However, I'd be happy to help you learn more about ASD! Here are some topics you might be interested in:

${selectedTopics.map((topic) => `• ${topic}`).join("\n")}

Feel free to ask any of these questions or another question about ASD. I'm here to help you understand autism spectrum disorder better!`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const lastMessage = messages[messages.length - 1];

    // Check if the question is ASD-related
    if (!isASDRelated(lastMessage.content)) {
      // Create a streaming response for off-topic questions
      const result = streamText({
        model: openai("gpt-4-turbo"),
        system: systemPrompt,
        messages: [
          ...messages.slice(0, -1),
          {
            role: "user",
            content: lastMessage.content,
          },
          {
            role: "assistant",
            content: getOffTopicResponse(),
          },
        ],
        temperature: 0.7,
        maxTokens: 1000,
      });

      return result.toDataStreamResponse();
    }

    // Perform web search for the latest user message
    const searchResults = await searchWeb(lastMessage.content);

    // Format search results as context
    const searchContext =
      searchResults.length > 0
        ? "\n\nRelevant information from trusted sources:\n" +
          searchResults.map((result) => `- ${result.snippet}`).join("\n")
        : "";

    const result = streamText({
      model: openai("gpt-4-turbo"),
      system: systemPrompt,
      messages: [
        ...messages.slice(0, -1),
        {
          ...lastMessage,
          content: `${lastMessage.content}${searchContext}`,
        },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get response from AI" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
