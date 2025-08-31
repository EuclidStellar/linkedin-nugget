import { GoogleGenAI, Part, Tool } from "@google/genai"
import { NextRequest } from "next/server"
import * as cheerio from "cheerio"

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

function sendStreamedData(
  controller: ReadableStreamDefaultController<any>,
  data: { thought?: any; angles?: any; posts?: any[]; error?: any },
) {
  controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
}

async function scrapeContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`)
    }
    const html = await response.text()
    const $ = cheerio.load(html)
    // A simple attempt to get the main content, this may need adjustment for different sites
    const mainContent =
      $('meta[property="og:description"]').attr("content") ||
      $("article").text() ||
      $("main").text() ||
      $("body").text()
    return mainContent.replace(/\s\s+/g, " ").trim()
  } catch (error) {
    console.error("Scraping error:", error)
    return "" // Return empty string on failure
  }
}

// Add a sleep function
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In your API route, add retry logic with delay
async function callGeminiWithRetry(params: any, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await genAI.models.generateContent(params);
    } catch (error: any) {
      if (error?.error?.code === 429 && attempt < maxRetries - 1) {
        // Extract retry delay from error or use default
        const retryDelay = 
          parseInt(error?.error?.details?.[2]?.retryDelay?.replace('s', '') || '0') * 1000 || 2000 * (attempt + 1);
        
        console.log(`Rate limited. Retrying in ${retryDelay/1000} seconds...`);
        await sleep(retryDelay);
      } else {
        throw error;
      }
    }
  }
  // If we've exhausted all retries, throw a more helpful error
  throw new Error("Failed after maximum retry attempts");
}

export async function POST(req: NextRequest) {
  const { topic, tone, audience, cta, styleUrl } = await req.json()

  if (!topic) {
    return new Response(JSON.stringify({ error: "Topic is required" }), { status: 400 })
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let styleGuide = "None"
        if (styleUrl) {
          sendStreamedData(controller, { thought: "1. Scrape Style URL...\n" })
          const scrapedText = await scrapeContent(styleUrl)
          if (scrapedText) {
            sendStreamedData(controller, { thought: "2. Analyze Writing Style...\n" })
            const styleAnalysisPrompt = `Analyze the following post's writing style. Identify its tone, sentence structure, emoji usage, and formatting. Output a concise summary of this style guide that can be used to generate new content.

Scraped Post:
---
${scrapedText}
---
Style Guide Summary:`
            const styleResult = await callGeminiWithRetry({
              model: "gemini-2.5-flash",
              contents: [{ role: "user", parts: [{ text: styleAnalysisPrompt }] }],
            })
            // FIX: Correctly access the text from the response
            styleGuide = styleResult.text
            sendStreamedData(controller, { thought: `   - Style guide created: ${styleGuide}\n` })
          } else {
            sendStreamedData(controller, { thought: "   - Could not scrape content, using default style.\n" })
          }
        }

        sendStreamedData(controller, { thought: "3. Brainstorming Angles...\n" })
        const plannerPrompt = `
As a world-class content strategist, your task is to analyze the topic "${topic}" for a target audience of ${audience}.
Your goal is to brainstorm and then finalize 2 unique, compelling angles for LinkedIn posts.  
Think step-by-step through the process:
1. Identify the core concepts of the topic.
2. Consider the audience's pain points, interests, and knowledge level.
3. Brainstorm a list of potential angles (e.g., a contrarian take, a case study, a future prediction, a practical guide).
4. Select the top 2 angles that are most likely to generate engagement.
After your thought process, provide ONLY the final 2 angles as a clean JSON array of strings: ["Angle 1", "Angle 2"].
`
        const plannerResult = await callGeminiWithRetry({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: plannerPrompt }] }],
          config: { responseMimeType: "application/json" },
        })

        // FIX: Correctly access the text from the response
        const anglesText = plannerResult.text
        const angles = JSON.parse(anglesText)
        sendStreamedData(controller, { angles })
        sendStreamedData(controller, { thought: `   - Angles: ${angles.join(", ")}\n` })

        sendStreamedData(controller, { thought: "4. Drafting Posts for each angle...\n" })
        // Instead of Promise.all for all angles, process them sequentially
        const generatedPosts = [];
        for (const angle of angles) {
          sendStreamedData(controller, { thought: `   - Processing angle: "${angle}"\n` });
          
          // Process each angle with a delay between them
          // Pass all required parameters to the processAngle function
          const post = await processAngle(
            angle, 
            topic, 
            audience, 
            tone, 
            styleGuide, 
            cta, 
            controller
          );
          generatedPosts.push(post);
          
          // Add a delay between angles to avoid rate limiting
          await sleep(2000);
        }

        sendStreamedData(controller, { posts: generatedPosts })
        sendStreamedData(controller, { thought: "5. All posts generated successfully!\n" })
      } catch (error: any) {
        console.error("API Error:", error)
        let errorMessage = error.message || "An unexpected error occurred."
        // Check for the specific 503 overload error from Gemini
        if (
          typeof errorMessage === "string" &&
          errorMessage.includes('"code":503') &&
          errorMessage.includes("overloaded")
        ) {
          errorMessage = "GEMINI_OVERLOADED"
        }
        sendStreamedData(controller, { error: errorMessage })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  })
}

// Helper function to process a single angle
async function processAngle(
  angle: string, 
  topic: string, 
  audience: string, 
  tone: string, 
  styleGuide: string, 
  cta: string,
  controller: ReadableStreamDefaultController
) {
  const startTime = Date.now()
  const postDrafterPrompt = `
You are an expert LinkedIn copywriter. Your task is to create the main body of an engaging LinkedIn post.
- Original topic: "${topic}"
- Specific angle: "${angle}"
- Target audience: "${audience}"
- Desired tone: "${tone}"
- Writing Style Guide: ${styleGuide}

Your output must be ONLY the text for the body of the post. It should have a strong hook, valuable insights, and be formatted with appropriate line breaks and 2-3 relevant emojis based on the style guide.
`
  const drafterResult = await callGeminiWithRetry({
    model: "gemini-2.5-pro",
    contents: [{ role: "user", parts: [{ text: postDrafterPrompt }] }],
  })
  
  let postContent = drafterResult.text
  const usageMetadata = drafterResult.usageMetadata

  sendStreamedData(controller, { thought: `   - Post drafted for angle: "${angle}"\n` })

  // Agentic Step: Quality Guardrail - Check for inappropriate content
  sendStreamedData(controller, { thought: "   - Applying quality guardrail...\n" })
  const guardrailPrompt = `Review the following LinkedIn post content for any inappropriate language, profanity, sensitive topics, or content that might violate professional standards. If you find any issues, suggest a sanitized version. If the content is appropriate, respond with "APPROVED".

Post Content:
---
${postContent}
---

Response:`
  const guardrailResult = await callGeminiWithRetry({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: guardrailPrompt }] }],
  })
  const guardrailResponse = guardrailResult.text.trim()
  if (guardrailResponse !== "APPROVED") {
    sendStreamedData(controller, { thought: `   - Content flagged and sanitized: ${guardrailResponse}\n` })
    postContent = guardrailResponse // Use the sanitized version
  } else {
    sendStreamedData(controller, { thought: "   - Content approved by guardrail.\n" })
  }

  // Agentic Step: A/B Test Hooks
  sendStreamedData(controller, { thought: "   - Generating A/B test hooks...\n" })
  const firstSentence = postContent.split("\n")[0]
  
  // Use sequential calls instead of Promise.all to avoid rate limits
  const questionHookResult = await callGeminiWithRetry({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: `Rewrite this opening line as an intriguing question: "${firstSentence}"` }] }],
  })
  
  await sleep(1000); // Add delay between calls
  
  const statementHookResult = await callGeminiWithRetry({
    model: "gemini-2.5-flash", 
    contents: [{ role: "user", parts: [{ text: `Rewrite this opening line as a bold or surprising statement: "${firstSentence}"` }] }],
  })

  // Agentic Step: Data-Driven Hashtags with Citations
  sendStreamedData(controller, { thought: "   - Searching for relevant hashtags and citations...\n" })
  const hashtagTool: Tool = { googleSearch: {} }
  const hashtagPrompt = `Based on the following post content, what are the top 5-7 most relevant and trending LinkedIn hashtags? Also, provide 2-3 relevant citation links from recent, authoritative sources related to this topic.

Post:
---
${postContent}
---

Return your response in this exact format:
HASHTAGS: #hashtag1 #hashtag2 #hashtag3
CITATIONS: 
- [Source Title](URL) - Brief description
- [Source Title](URL) - Brief description
`
  const hashtagResult = await callGeminiWithRetry({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: hashtagPrompt }] }],
    tools: [hashtagTool],
  })
  
  const hashtagResponse = hashtagResult.text
  const hashtags = hashtagResponse.match(/#\w+/g) || []
  const citations = hashtagResponse.match(/CITATIONS:\s*([\s\S]*)/)?.[1]?.trim() || ""

  // Final CTA
  const finalCta = cta || "What are your thoughts? Drop a comment below!"
  const endTime = Date.now()

  return {
    angle,
    content: postContent,
    hooks: {
      questionHook: questionHookResult.text,
      statementHook: statementHookResult.text,
    },
    hashtags,
    citations, // New field for citations
    finalCta,
    metadata: {
      generationTime: endTime - startTime,
      tokens: usageMetadata?.totalTokenCount || Math.round(postContent.length / 4),
    },
  }
}
