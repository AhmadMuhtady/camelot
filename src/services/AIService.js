import { PROVIDERS } from './Providers.js';

export class AIService {
	async askKnight(knight, topic, mode) {
		try {
			const text = await this._call(
				knight.provider,
				knight.model,
				knight.getSystemPrompt(mode),
				topic,
				knight.getTokens(mode),
			);
			return knight.formatResponse(text);
		} catch (err) {
			console.error(`${knight.name} failed:`, err.message);
			return `[${knight.name} could not respond]`;
		}
	}

	async _callArthur(topic, knightResponses, knights) {
		try {
			const summary = knightResponses
				.map((r, i) => `${knights[i].name}: "${r}"`)
				.join('\n');

			const prompt = `You are King Arthur, the wise sovereign of the Round Table.
Your knights have debated: "${topic}"

${summary}

Synthesize their views into one final verdict. Be decisive, wise, and concise. Max 150 tokens.`;

			return await this._call('gemini', 'gemini-2.5-flash', null, prompt, 300);
		} catch (err) {
			console.error('King API Call Failed:', err.message);
			return '[The King is silent]';
		}
	}

	async _call(providerKey, model, systemPrompt, userPrompt, maxTokens) {
		const provider = PROVIDERS[providerKey];
		if (!provider) throw new Error(`Unknown provider: ${providerKey}`);

		// Gemini counts tokens differently — multiply for same output length
		const adjustedTokens = providerKey === 'gemini' ? maxTokens * 3 : maxTokens;

		const messages = systemPrompt
			? [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: `Topic: ${userPrompt}` },
				]
			: [{ role: 'user', content: userPrompt }];

		const response = await fetch(provider.baseUrl, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${provider.apiKey}`,
				'Content-Type': 'application/json',
				...provider.headers,
			},
			body: JSON.stringify({ model, max_tokens: adjustedTokens, messages }),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			throw new Error(`${providerKey} ${response.status}: ${errorBody}`);
		}

		const data = await response.json();
		return data.choices[0].message.content.trim();
	}
}
