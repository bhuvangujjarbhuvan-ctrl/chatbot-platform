export async function streamAssistantReply({ systemText, messages, onChunk, onEnd }) {
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
    stream: true,
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

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`OpenRouter error: ${resp.status} ${errorText}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let fullContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (trimmed === "data: [DONE]") continue;

      if (trimmed.startsWith("data: ")) {
        const rawJson = trimmed.slice(6);
        try {
          const parsed = JSON.parse(rawJson);
          const chunkText = parsed.choices?.[0]?.delta?.content || "";
          if (chunkText) {
            fullContent += chunkText;
            onChunk(chunkText);
          }
        } catch (e) {
          // ignore malformed chunks
        }
      }
    }
  }

  if (buffer) {
    const trimmed = buffer.trim();
    if (trimmed && trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
      const rawJson = trimmed.slice(6);
      try {
        const parsed = JSON.parse(rawJson);
        const chunkText = parsed.choices?.[0]?.delta?.content || "";
        if (chunkText) {
          fullContent += chunkText;
          onChunk(chunkText);
        }
      } catch (e) {}
    }
  }

  if (onEnd) {
    onEnd(fullContent);
  }
}
