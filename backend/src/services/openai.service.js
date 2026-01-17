export async function generateAssistantReply({ systemPrompt, userMessage }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";
  const baseUrl =
    process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY missing in .env");
  }

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",

      // recommended by OpenRouter (helps with rate limits / analytics)
      "HTTP-Referer": "http://localhost:4000/api",
      "X-Title": "Chatbot Platform",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt || "You are a helpful assistant.",
        },
        { role: "user", content: userMessage },
      ],
    }),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(`OpenRouter error: ${resp.status} ${JSON.stringify(data)}`);
  }

  return data?.choices?.[0]?.message?.content || "";
}
