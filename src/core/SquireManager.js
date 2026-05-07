import { BusEvent } from './EventBus.js';
import { PromptArchitect } from '../services/PromptArchitect.js';
import { ImageService } from '../services/ImageService.js';
import { IMAGE_MODELS } from '../models/KnightsConfig.js';

export class SquireManager {
	constructor() {
		this.architect = new PromptArchitect();
		this.image = new ImageService();
		this.isGenerating = false;

		BusEvent.on('squire:generate', (idea) => this._generate(idea));
		BusEvent.on('image:add', (id) => this._toggleImageKnight(id));
		BusEvent.on('image:remove', (id) => this._toggleImageKnight(id));
		this._updateImagePanel();
	}

	async _generate(idea) {
		if (this.isGenerating) return;
		this.isGenerating = true;
		let results = null;

		try {
			BusEvent.emit('squire:loading', true);

			const activeModels = IMAGE_MODELS.filter((m) => m.active);

			const prompts = await this.architect.generatePrompts(
				idea,
				activeModels.length,
			);

			results = [];
			for (let i = 0; i < prompts.length; i++) {
				results.push({
					style: prompts[i].style,
					title: prompts[i].title,
					prompt: prompts[i].prompt,
					url: this.image.generateUrl(prompts[i].prompt, {
						model: activeModels[i].model,
					}),
					hex: activeModels[i].hex,
					glow: activeModels[i].glow,
				});
				if (i < prompts.length - 1) {
					await new Promise((r) => setTimeout(r, 3000));
				}
			}
		} catch (err) {
			console.error('Squire failed:', err.message);
			BusEvent.emit('squire:error', err.message);
		} finally {
			this.isGenerating = false;
			BusEvent.emit('squire:loading', false);
			if (results) BusEvent.emit('squire:results', results);
		}
	}

	_toggleImageKnight(id) {
		const model = IMAGE_MODELS.find((m) => m.id === id);
		if (!model) return;

		const activeCount = IMAGE_MODELS.filter((m) => m.active).length;
		if (!model.active && activeCount >= 3) return; // max 3
		if (model.active && activeCount <= 1) return; // min 1

		model.active = !model.active;

		BusEvent.emit(
			'squire:image:render',
			IMAGE_MODELS.filter((m) => m.active),
		);
		this._updateImagePanel();
	}

	_updateImagePanel() {
		const inactive = IMAGE_MODELS.filter((m) => !m.active);
		const activeCount = IMAGE_MODELS.filter((m) => m.active).length;
		BusEvent.emit('image:panel:update', { inactive, activeCount });
	}
}
