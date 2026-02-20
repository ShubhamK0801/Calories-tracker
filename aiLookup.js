/**
 * aiLookup.js
 * AI-powered calorie lookup via Anthropic API.
 * Separated so it can be mocked in tests or swapped for another provider.
 */

/**
 * Look up calories for a food item via the Anthropic API.
 * @param {string} foodName
 * @param {number} grams
 * @returns {Promise<number|null>}
 */
export async function aiLookup(foodName, grams) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 80,
        messages: [
          {
            role: "user",
            content: `Calories in ${grams}g of "${foodName}"? Reply with ONE integer only.`,
          },
        ],
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data?.content?.[0]?.text?.trim();
    const calories = parseInt(text, 10);
    return isNaN(calories) ? null : calories;
  } catch {
    return null;
  }
}
