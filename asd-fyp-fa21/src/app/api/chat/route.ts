import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const systemPrompt = `You are an expert on Autism Spectrum Disorder (ASD) and your role is to provide helpful, accurate information about ASD to users. You should:

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
