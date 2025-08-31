import { GoogleGenAI, Part } from "@google/genai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

function sendStreamedData(controller: ReadableStreamDefaultController<any>, data: { thought?: any; angles?: any; posts?: any[]; error?: any; }) {
  controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(req: { json: () => PromiseLike<{ topic: any; tone: any; audience: any; cta: any; }> | { topic: any; tone: any; audience: any; cta: any; }; }) {
  const { topic, tone, audience, cta } = await req.json();

  if (!topic) {
    return new Response(JSON.stringify({ error: "Topic is required" }), { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const plannerPrompt = `
As a world-class content strategist, your task is to analyze the topic "${topic}" for a target audience of ${audience}.
Your goal is to brainstorm and then finalize 3 unique, compelling angles for LinkedIn posts.
Think step-by-step through the process:
1. Identify the core concepts of the topic.
2. Consider the audience's pain points, interests, and knowledge level.
3. Brainstorm a list of potential angles (e.g., a contrarian take, a case study, a future prediction, a practical guide).
4. Select the top 3 angles that are most likely to generate engagement.
After your thought process, provide ONLY the final 3 angles as a clean JSON array of strings: ["Angle 1", "Angle 2", "Angle 3"].
`;

        // Streaming brainstormed angles with thought summaries enabled
        const plannerStream = await genAI.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: plannerPrompt }] }],
          config: {
            thinkingConfig: {
              includeThoughts: true
            },
            responseMimeType: "application/json"
          },

        });

        let anglesText = "";
        for await (const chunk of plannerStream){
            const parts: Part[] = chunk.candidates?.[0]?.content?.parts || [];
for (const part of parts) {
  if (part.thought) {
    sendStreamedData(controller, { thought: part.text }); // Thought summaries
  } else if (part.text) {
    anglesText += part.text;
  }
}
        }


        const angles = JSON.parse(anglesText);
        sendStreamedData(controller, { angles });

        const postPromises = angles.map(async (angle: any) => {
          const postDrafterPrompt = `
You are an expert LinkedIn copywriter.
Your task is to create a complete and engaging LinkedIn post based on a specific angle.
The original topic was: "${topic}".
The specific angle to focus on is: "${angle}".
The target audience is: "${audience}".
The desired tone is: "${tone}".

Your final output must be a single, clean JSON object with the following structure:
{
  "content": "The main body of the LinkedIn post. It should have a strong hook, valuable insights, and be formatted with appropriate line breaks and 2-3 relevant emojis.",
  "hooks": {
    "questionHook": "A rewritten version of the first sentence as an intriguing question.",
    "statementHook": "A rewritten version of the first sentence as a bold or surprising statement."
  },
  "hashtags": ["#relevant", "#hashtags", "#for", "#the", "#post"],
  "finalCta": "A compelling call-to-action that encourages comments or discussion. Use the user's suggestion if provided: ${cta}"
}
`;
          const result = await genAI.models.generateContent({
            model: "gemini-2.5-pro",
            contents: [{ role: "user", parts: [{ text: postDrafterPrompt }] }],
            config: {
              responseMimeType: "application/json"
            }
          });

         const responseText = await result.text;
if (!responseText) throw new Error("Empty response");

const postData = JSON.parse(responseText);

return { ...postData, angle };
        });

        const generatedPosts = await Promise.all(postPromises);
        sendStreamedData(controller, { posts: generatedPosts });

      } catch (error) {
        console.error("API Error:", error);
        sendStreamedData(controller, { error: "An unexpected error occurred." });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
