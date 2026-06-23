export async function searchWeb(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!resp.ok) {
      throw new Error(`DuckDuckGo returned status ${resp.status}`);
    }

    const html = await resp.text();
    const snippetRegex = /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    const titleRegex = /class="result__a"[^>]*>([\s\S]*?)<\/a>/g;

    const snippets = [];
    const titles = [];

    let match;
    while ((match = snippetRegex.exec(html)) !== null && snippets.length < 5) {
      snippets.push(cleanText(match[1]));
    }

    let titleMatch;
    while ((titleMatch = titleRegex.exec(html)) !== null && titles.length < 5) {
      titles.push(cleanText(titleMatch[1]));
    }

    if (snippets.length === 0) {
      return "No web search results found.";
    }

    return snippets
      .map((snippet, idx) => `[Result ${idx + 1}] Title: ${titles[idx] || "N/A"}\nSnippet: ${snippet}`)
      .join("\n\n");
  } catch (e) {
    console.error("Web Search error:", e);
    return `Failed to fetch search results: ${e.message}`;
  }
}

function cleanText(text) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
