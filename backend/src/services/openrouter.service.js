export async function generateAssistantReply({ systemText, messages }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const baseUrl = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY missing in .env");
  }

  const payload = {
    model,
    messages: [
      ...(systemText ? [{ role: "system", content: systemText }] : []),
      ...(messages || []),
    ],
    temperature: 0.2,
    max_tokens: 300,
  };

  const resp = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "Chatbot Platform",
    },
    body: JSON.stringify(payload),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(`OpenRouter error: ${resp.status} ${JSON.stringify(data)}`);
  }

  const text = data?.choices?.[0]?.message?.content;

  return (text || "").trim();
}
