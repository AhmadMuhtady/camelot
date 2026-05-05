import { CONFIG } from '../config.js';

export const PROVIDERS = {
	openrouter: {
		baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
		apiKey: CONFIG.OPENROUTER_API_KEY,
		headers: {
			'HTTP-Referer': 'http://localhost:5500',
			'X-Title': 'Camelot',
		},
	},
	groq: {
		baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
		apiKey: CONFIG.GROQ_API_KEY,
		headers: {},
	},
	cerebras: {
		baseUrl: 'https://api.cerebras.ai/v1/chat/completions',
		apiKey: CONFIG.CEREBRAS_API_KEY,
		headers: {},
	},
	gemini: {
		baseUrl:
			'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
		apiKey: CONFIG.GEMINI_API_KEY,
		headers: {},
	},
};
