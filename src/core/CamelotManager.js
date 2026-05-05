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

		this._updatePanel();

		BusEvent.on('debate:start', (data) => {
			this._startDebate(data.topic, data.mode);
		});

		BusEvent.on('knight:add', (id) => this._toggleKnight(id, true));
		BusEvent.on('knight:remove', (id) => this._toggleKnight(id, false));
	}

	async _startDebate(topic, mode) {
		BusEvent.emit('verdict:reset');

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

	_updatePanel() {
		const inactive = KNIGHTS_CONFIG.filter((k) => !k.active);
		const activeCount = KNIGHTS_CONFIG.filter((k) => k.active).length;

		BusEvent.emit('panel:update', { inactive, activeCount });
	}

	_toggleKnight(id) {
		console.log('toggleKnight called with id:', id);
		console.log(
			'KNIGHTS_CONFIG ids:',
			KNIGHTS_CONFIG.map((k) => k.id),
		);
		const config = KNIGHTS_CONFIG.find((k) => k.id === id);
		console.log('found config:', config);
		if (!config) return;

		const activeCount = KNIGHTS_CONFIG.filter((k) => k.active).length;

		if (!config.active && activeCount >= 6) return;

		if (config.active && activeCount <= 2) return;

		config.active = !config.active;

		this.knights = KNIGHTS_CONFIG.filter((k) => k.active).map(
			(k) => new Knight(k),
		);

		BusEvent.emit('knights:render', this.knights);
		this._updatePanel();
	}
}
