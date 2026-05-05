import { getFullProfile } from './KnightsConfig.js';

export class Knight {
	constructor(config) {
		this.id = config.id;
		this.model = config.model;
		this.active = config.active;
		this.provider = config.provider;

		const profile = getFullProfile();
		this.name = profile.name;
		this.emoji = profile.emoji;
		this.personality = profile.personality;
		this.hex = profile.hex;
		this.glow = profile.glow;
	}

	getTokens(mode) {
		const map = { sharp: 200, normal: 350, detailed: 600 };
		return map[mode] ?? 200;
	}

	getSystemPrompt(mode) {
		return `You are ${this.name} at the AI Round Table. ${this.personality}. 
Respond in maximum ${this.getTokens(mode)} tokens. 
Be direct, stay in character, no lengthy introductions.`;
	}

	formatResponse(text) {
		return text
			.trim()
			.replace(/^[\s\S]*?<\/think>/i, '') // strip thinking blocks
			.replace(/^(As Sir \w+,?\s*)/i, '') // strip "As Sir X,"
			.replace(/^(I'?m\s+\w+[^.]*\.\s*)/i, '') // strip "I'm X..."
			.replace(/^(I am\s+\w+[^.]*\.\s*)/i, '') // strip "I am X..."
			.replace(/\*\*(.*?)\*\*/g, '$1') // bold
			.replace(/\*(.*?)\*/g, '$1') // italic
			.replace(/\*{1,3}/g, '') // leftover stars
			.replace(/#{1,6}\s/g, '') // headers
			.replace(/`{1,3}(.*?)`{1,3}/gs, '$1') // code blocks
			.replace(/^---+$/gm, '') // horizontal rules
			.replace(/^--+$/gm, '') // double dashes
			.replace(/^[-•]\s/gm, '') // bullet points
			.replace(/^\d+\.\s/gm, '') // numbered lists
			.replace(/\+\+(.*?)\+\+/g, '$1') // ++text++
			.replace(/~~(.*?)~~/g, '$1') // strikethrough
			.trim();
	}
}
