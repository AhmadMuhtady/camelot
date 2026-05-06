export class ImageService {
	generateUrl(prompt, opts = {}) {
		const seed = opts.seed || Math.floor(Math.random() * 99999);
		const width = opts.width || 1024;
		const height = opts.height || 1024;
		const model = opts.model || 'flux';
		const encoded = encodeURIComponent(prompt);
		return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=${model}&seed=${seed}`;
	}
}
