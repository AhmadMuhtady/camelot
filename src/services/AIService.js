import { CONFIG } from '../config.js';

export class AIService {
	constructor() {
		this.apiKey = CONFIG.OPENROUTER_API_KEY;
		this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
	}

	async ask(knight, topic, mode) {
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
						{ role: 'system', content: knight.getSystemPrompt(mode) },
						{ role: 'user', content: topic },
					],
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const text = data.choices[0].message.content;
			return knight.formatResponse(text);
		} catch (error) {
			console.error('API Call Failed:', error.message);
		}
	}
}
