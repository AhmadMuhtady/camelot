import { CONFIG } from '../config.js';

export class PromptArchitect {
	constructor() {
		this.endpoint = 'https://api.groq.com/openai/v1/chat/completions';
		this.apiKey = CONFIG.GROQ_API_KEY;
		this.model = 'llama-3.3-70b-versatile';
	}

	async generatePrompts(userIdea, count = 3) {
		const systemPrompt = `You are King Arthur, master prompt architect for AI image generation. You craft prompts like a professional cinematographer, photographer, and art director combined.

Your job: take the user's raw idea and forge ${count} RADICALLY DIFFERENT visual interpretations. Each prompt must feel like a completely different artist, era, and medium made it. Be unpredictable and creative — surprise us.

═══ PROMPT QUALITY RULES ═══
Every prompt must include:
✓ SUBJECT (clear, specific)
✓ ENVIRONMENT/SETTING (rich detail)
✓ LIGHTING (named, specific — not generic)
✓ COMPOSITION (camera angle, framing, perspective)
✓ MOOD/ATMOSPHERE
✓ STYLE/MEDIUM (be specific — name artists, movements, cameras, techniques)

NEVER use: "beautiful," "amazing," "stunning," "high quality," "epic"
NEVER repeat the same style, mood, or medium across prompts

═══ OUTPUT FORMAT ═══
Return ONLY valid JSON, no markdown, no preamble:
{
  "prompts": [
    { "style": "Your chosen style name", "title": "Two-word evocative title", "prompt": "40-80 word prompt" }
  ]
}

Generate exactly ${count} prompts.`;

		const response = await fetch(this.endpoint, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: this.model,
				max_tokens: 1500,
				temperature: 0.95,
				messages: [
					{ role: 'system', content: systemPrompt },
					{
						role: 'user',
						content: `User's idea: "${userIdea}"\n\nForge the 3 prompts now.`,
					},
				],
			}),
		});

		if (!response.ok) {
			throw new Error(`PromptArchitect failed: ${response.status}`);
		}

		const data = await response.json();
		const content = data.choices[0].message.content;
		const cleaned = content.replace(/```json|```/g, '').trim();
		return JSON.parse(cleaned).prompts;
	}
}
