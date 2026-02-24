/* ─────────────────────────────────────────────────────────────────
   suggestPrice — powered by Groq (free, fast, no billing needed)
   Uses Groq's OpenAI-compatible API with llama-3.1-8b-instant.
   Returns { price: number, reason: string }.
───────────────────────────────────────────────────────────────── */
export const suggestPrice = async ({ title, category, condition, originalPrice, description }) => {
    const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
    if (!API_KEY) throw new Error("VITE_GROQ_API_KEY is not set in your .env file.");

    const prompt = `You are a pricing expert for a college second-hand marketplace in India (Campus Bazaar).
A student wants to sell the following item:

- Title: ${title || "Unknown item"}
- Category: ${category || "General"}
- Condition: ${condition || "Unknown"}
- Original purchase price: ${originalPrice ? "₹" + Number(originalPrice).toLocaleString() : "Not provided"}
- Description: ${description || "None"}

Suggest a fair resale price in INR for Indian college students. Consider depreciation, condition, and student budgets.

Respond ONLY with valid JSON (no markdown):
{"price": <integer in INR>, "reason": "<one concise sentence explaining the price>"}`;

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            max_tokens: 120,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Groq API error: ${res.status}`);
    }

    const data = await res.json();
    const rawText = data.choices?.[0]?.message?.content?.trim() ?? "";

    // Strip accidental markdown fences
    const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

    let parsed;
    try { parsed = JSON.parse(cleaned); }
    catch { throw new Error("AI returned an unexpected response. Try again."); }

    if (!parsed.price || typeof parsed.price !== "number") {
        throw new Error("Could not extract a price from the AI response.");
    }

    // Round to nearest ₹50 for a cleaner display
    parsed.price = Math.round(parsed.price / 50) * 50;
    return { price: parsed.price, reason: parsed.reason || "" };
};
