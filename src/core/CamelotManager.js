import { BusEvent } from './EventBus.js';
import { Knight } from '../models/Knight.js';
import { KNIGHTS_CONFIG } from '../models/KnightsConfig.js';
import { AIService } from '../services/AIService.js';

export class CamelotManager {
	constructor(ui) {
		this.ui = ui;
		this.ai = new AIService();
		this.knights = KNIGHTS_CONFIG.filter((k) => k.active).map(
			(k) => new Knight(k),
		);

		BusEvent.on('debate:start', (data) => {
			this._startDebate(data.topic, data.mode);
		});
	}

	async _startDebate(topic, mode) {
		this.ui.renderAll(this.knights);

		const responses = [];
		for (const knight of this.knights) {
			const res = await this.ai.askKnight(knight, topic, mode);
			responses.push(res);
			BusEvent.emit('knight:response', { id: knight.id, response: res });
			await new Promise((r) => setTimeout(r, 3000));
		}

		await new Promise((r) => setTimeout(r, 10000));
		const verdict = await this.ai._callArthur(topic, responses, this.knights);
		BusEvent.emit('knight:complete', verdict);
	}
}
