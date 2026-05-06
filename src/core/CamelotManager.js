import { BusEvent } from './EventBus.js';
import { Knight } from '../models/Knight.js';
import { KNIGHTS_CONFIG } from '../models/KnightsConfig.js';
import { AIService } from '../services/AIService.js';

export class CamelotManager {
	constructor(ui, store) {
		this.isDebating = false;
		this.ui = ui;
		this.ai = new AIService();
		this.store = store;
		this.knights = KNIGHTS_CONFIG.filter((k) => k.active).map(
			(k) => new Knight(k),
		);

		this._updatePanel();

		BusEvent.on('debate:start', (data) => {
			this._startDebate(data.topic, data.mode);
		});

		BusEvent.on('knight:add', (id) => this._toggleKnight(id, true));
		BusEvent.on('knight:remove', (id) => this._toggleKnight(id, false));

		BusEvent.emit('chronicles:update', this.store.getAll());

		BusEvent.on('chronicles:clear', () => {
			this.store.clear();
		});

		BusEvent.on('chronicles:replay', (debate) => {
			BusEvent.emit('verdict:reset');
			this.ui.renderAll(debate.responses);
			debate.responses.forEach((r) => {
				BusEvent.emit('knight:response', { id: r.id, response: r.response });
			});
			BusEvent.emit('knight:complete', debate.verdict);
		});

		BusEvent.on('squire:generate', () => {
			BusEvent.emit('verdict:reset');
		});
	}

	async _startDebate(topic, mode) {
		if (this.isDebating) return;
		this.isDebating = true;

		try {
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

			this.store.save(topic, responses, this.knights, verdict);
			BusEvent.emit('chronicles:update', this.store.getAll());
		} finally {
			this.isDebating = false;
		}
	}

	_updatePanel() {
		const inactive = KNIGHTS_CONFIG.filter((k) => !k.active);
		const activeCount = KNIGHTS_CONFIG.filter((k) => k.active).length;

		BusEvent.emit('panel:update', { inactive, activeCount });
	}

	_toggleKnight(id) {
		const config = KNIGHTS_CONFIG.find((k) => k.id === id);

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
