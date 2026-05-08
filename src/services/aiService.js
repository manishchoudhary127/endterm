import { HfInference } from "@huggingface/inference";

const hfToken = import.meta.env.VITE_AI_TOKEN;
const hf = new HfInference(hfToken || "dummy_token_for_init");
const MODEL = "meta-llama/Meta-Llama-3-8B-Instruct";

export async function getChatCompletion(userMessage, ctx) {
  if (!hfToken || hfToken === 'your_huggingface_KEY') {
    return "⚠️ Hugging Face API token missing. Add VITE_AI_TOKEN to your .env file.";
  }

  const astronautList = ctx.astronautNames?.length
    ? ctx.astronautNames.map(p => `  • ${p.name} (${p.craft})`).join('\n')
    : '  • Data unavailable';

  const newsHeadlines = ctx.newsArticles?.length
    ? ctx.newsArticles.map((n, i) => `  ${i+1}. "${n.title}" — ${n.source?.name || 'Unknown'} (${new Date(n.publishedAt).toLocaleDateString()})`).join('\n')
    : '  • No articles loaded';

  const systemPrompt = `You are an AI assistant embedded in a live ISS & News Dashboard.

STRICT RULES:
1. ONLY answer using the dashboard data below. Do NOT use outside knowledge.
2. If the question is not answerable from this data, say: "I can only answer questions based on the current dashboard data."
3. Be concise, factual, and friendly.

CURRENT DASHBOARD DATA:
ISS Position:
  Latitude: ${ctx.lat}°, Longitude: ${ctx.lng}°
  Altitude: ${ctx.altitude} km above sea level
  Speed: ${ctx.speed} km/h (orbital velocity)
  Nearest Location: ${ctx.location}

People in Space: ${ctx.astronautsCount} astronauts
${astronautList}

Latest News Headlines:
${newsHeadlines}`;

  try {
    const response = await hf.chatCompletion({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      max_tokens: 300,
      temperature: 0.1,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("AI Service Error:", error);
    return "I'm having trouble connecting to the AI model. Please try again in a moment.";
  }
}
