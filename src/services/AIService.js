import { CONFIG } from '../config.js';

export class AIService {
	constructor() {
		this.apiKey = CONFIG.OPENROUTER_API_KEY;
		this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
	}

	async askKnight(knight, topic, mode) {
		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
					'HTTP-Referer': 'http://localhost:5500',
					'X-Title': 'Camelot',
				},
				body: JSON.stringify({
					model: knight.model,
					max_tokens: knight.getTokens(mode),
					messages: [
						{
							role: 'user',
							content: `${knight.getSystemPrompt(mode)}\n\nNow respond to this topic: ${topic}`,
						},
					],
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log('Full error:', JSON.stringify(data));
			const text = data.choices[0].message.content;
			return knight.formatResponse(text);
		} catch (error) {
			console.error('Knight API Call Failed:', error.message);
			return `[${knight.name} could not respond]`;
		}
	}

	async _callArthur(topic, knightResponses, knights) {
		try {
			const summary = knightResponses
				.map((r, i) => `${knights[i].name}: "${r}"`)
				.join('\n');

			const arthurPrompt = `You are King Arthur, the wise sovereign of the Round Table.
Your knights have debated this topic: "${topic}"

Here are their perspectives:
${summary}

Synthesize their views into one final verdict. Be decisive, wise, and concise.
Maximum 150 tokens.`;

			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${this.apiKey}`,
					'Content-Type': 'application/json',
					'HTTP-Referer': 'http://localhost:5500',
					'X-Title': 'Camelot',
				},
				body: JSON.stringify({
					model: 'meta-llama/llama-3.3-70b-instruct:free',
					max_tokens: 150,
					messages: [{ role: 'user', content: arthurPrompt }],
				}),
			});

			if (!response.ok) {
				throw new Error(`Arthur HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log('Full error:', JSON.stringify(data));
			return data.choices[0].message.content.trim();
		} catch (error) {
			console.error('King API Call Failed:', error.message);
		}
	}
}
