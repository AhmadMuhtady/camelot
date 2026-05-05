import { getFullProfile } from './KnightsConfig.js';

export class Knight {
	constructor(config) {
		this.id = config.id;
		this.model = config.model;
		this.active = config.active;

		const profile = getFullProfile();
		this.name = profile.name;
		this.emoji = profile.emoji;
		this.personality = profile.personality;
		this.hex = profile.hex;
		this.glow = profile.glow;
	}

	getTokens(mode) {
		const map = { sharp: 150, normal: 250, detailed: 400 };
		return map[mode] ?? 150;
	}

	getSystemPrompt(mode) {
		return `You are ${this.name} at the AI Round Table. ${this.personality}. 
Respond in maximum ${this.getTokens(mode)} tokens. 
Be direct, stay in character, no lengthy introductions.`;
	}

	formatResponse(text) {
		return text
			.trim()
			.replace(/^[\s\S]*?<\/think>/i, '')
			.replace(/^(As Sir \w+,?\s*)/i, '')
			.replace(/^(I'?m\s+\w+[^.]*\.\s*)/i, '')
			.replace(/^(I am\s+\w+[^.]*\.\s*)/i, '')
			.trim();
	}
}
