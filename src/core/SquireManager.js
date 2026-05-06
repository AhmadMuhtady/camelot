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

			results = prompts.map((p, i) => ({
				style: p.style,
				title: p.title,
				prompt: p.prompt,
				url: this.image.generateUrl(p.prompt, { model: activeModels[i].model }),
				hex: activeModels[i].hex,
				glow: activeModels[i].glow,
			}));
		} catch (err) {
			console.error('Squire failed:', err.message);
			BusEvent.emit('squire:error', err.message);
		} finally {
			this.isGenerating = false;
			BusEvent.emit('squire:loading', false);
			if (results) BusEvent.emit('squire:results', results);
		}
	}
}
