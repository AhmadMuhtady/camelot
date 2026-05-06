export class DebateStore {
	constructor() {
		this.key = 'camelot-chronicles';
	}

	save(topic, responses, knights, verdict) {
		const chronicles = this.getAll();
		chronicles.unshift({
			topic,
			date: new Date().toISOString(),
			verdict,
			responses: knights.map((k, i) => ({
				id: k.id,
				name: k.name,
				emoji: k.emoji,
				hex: k.hex,
				glow: k.glow,
				model: k.model,
				response: responses[i],
			})),
		});
		localStorage.setItem(this.key, JSON.stringify(chronicles.slice(0, 20)));
	}

	getAll() {
		return JSON.parse(localStorage.getItem(this.key) || '[]');
	}

	clear() {
		localStorage.removeItem(this.key);
	}
}
