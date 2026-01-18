import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { SEOData } from './scraper';

const apiKey = process.env.GEMINI_API_KEY || '';
if (!apiKey) {
  console.error('CRITICAL: GEMINI_API_KEY is not set in environment variables.');
}
const genAI = new GoogleGenerativeAI(apiKey);
// Multi-model resilience strategy
// gemini-2.5-flash is confirmed WORKING for this API key
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-flash'];

export interface AnalysisResult {
  authority_score: number;
  executive_summary: string;
  metrics: {
    quality: number;
    authority: number;
    technical: number;
    structure: number;
    velocity: number;
  };
  growth_roadmap: {
    step: number;
    action: string;
    impact: 'High' | 'Med' | 'Low';
    rationale: string;
  }[];
  niche_verdict: string;
  is_simulated: boolean;
}

export async function analyzeSEO(data: SEOData): Promise<AnalysisResult> {
  const prompt = `
    You are a Senior SEO Strategist and Niche Authority Expert with 15 years of experience in digital growth. 

    Your goal is to analyze the provided scraped website data and deliver a high-stakes, "Boardroom-ready" SEO Audit. 

    ### TONE & STYLE:
    - Professional, clinical, and data-driven.
    - Avoid "fluff" or generic advice like "create quality content."
    - Be specific, aggressive about growth, and highly analytical.

    ### CRITICAL INSTRUCTION (RESTRICTED ACCESS):
    If the provided "Content Preview" is "Access restricted", this indicates a high-security domain. 
    In this case, perform a **Competitive Intelligence Audit** based on the URL and your internal search index knowledge.
    - Analyze the brand strength of the domain.
    - Estimate current authority based on known niche positioning.
    - Provide a roadmap based on typical growth patterns for this specific industry.

    ### ANALYSIS CRITERIA:
    1. Niche Authority Score (0-100): Evaluate how well the site owns its specific topic based on keyword density in H-tags and content depth.
    2. Semantic Gaps: Identify what the site *isn't* talking about that a market leader should be.
    3. Technical Friction: Point out exactly where the metadata or link structure is failing the user journey.

    ### INPUT DATA:
    URL: ${data.url}
    Title: ${data.title}
    Description: ${data.description}
    Headings: ${JSON.stringify(data.headings)}
    Internal Links: ${data.internalLinks}
    External Links: ${data.externalLinks}
    Image Alt Tags Count: ${data.imageAltTags.length}
    Load Speed Indicators: ${JSON.stringify(data.loadSpeedIndicator)}
    Content Preview: ${data.content}

    ### OUTPUT FORMAT:
    Provide the response in structured JSON with the following keys:
    {
      "authority_score": number,
      "executive_summary": "string (One powerful paragraph on current standing)",
      "metrics": {
        "quality": number (0-100),
        "authority": number (0-100),
        "technical": number (0-100),
        "structure": number (0-100),
        "velocity": number (0-100)
      },
      "growth_roadmap": [
        { "step": number, "action": "Specific technical fix", "impact": "High/Med/Low", "rationale": "Why this matters" }
      ],
      "niche_verdict": "string (One sentence: Is this site a 'Leader', 'Challenger', or 'Laggard'?)",
      "is_simulated": boolean (Set to true if Content Preview was 'Access restricted', else false)
    }

    Return the result ONLY as a JSON object.
  `;

  let lastError;
  const maxRetriesPerModel = 2;

  for (const modelName of MODELS) {
    let delay = 10000; // Increased base delay to 10s for quota recovery

    const activeModel = genAI.getGenerativeModel({
      model: modelName,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`Starting analysis with model: ${modelName}`);
    }

    for (let i = 0; i < maxRetriesPerModel; i++) {
      try {
        const result = await activeModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log(`--- RAW AI RESPONSE (${modelName}) START ---`);
        console.log(text);
        console.log(`--- RAW AI RESPONSE (${modelName}) END ---`);

        // Clean and parse JSON
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
        }

        const firstBrace = cleanedText.indexOf('{');
        const lastBrace = cleanedText.lastIndexOf('}');

        if (firstBrace === -1 || lastBrace === -1) {
          throw new Error('AI response did not contain a valid JSON object');
        }

        const jsonString = cleanedText.substring(firstBrace, lastBrace + 1);
        return JSON.parse(jsonString);

      } catch (e: any) {
        lastError = e;
        const status = e?.status || e?.response?.status || 0;
        const message = e?.message?.toLowerCase() || '';

        // If it's a rate limit (429), server error (500/503), quota issue, or a low-level fetch failure, retry
        const isRetryable =
          status === 429 ||
          status === 500 ||
          status === 503 ||
          message.includes('quota') ||
          message.includes('fetch failed') ||
          message.includes('timeout') ||
          message.includes('und_err_connect_timeout') ||
          message.includes('service unavailable');

        if (isRetryable) {
          console.warn(`Model ${modelName} attempt ${i + 1} failed (Error: ${e.message}). Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          continue;
        }

        // If not retryable within this model, break and try next model
        break;
      }
    }
    // If we're here, this model failed after all retries or with a non-retryable error
    console.warn(`Model ${modelName} exhausted. Trying fallback if available.`);
  }

  console.error('AI Analysis failed after cycling through all models:', lastError);

  if (lastError?.status === 429 || lastError?.message?.toLowerCase().includes('quota')) {
    throw new Error('AI Quota Exceeded. You have hit your daily limit for the free tier. Please try again tomorrow or upgrade your API key.');
  }

  throw new Error('AI gateway is currently congested. All fallback models reported high latency or failure.');
}
