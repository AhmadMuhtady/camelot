export class ImageService {
	generateUrl(prompt, opts = {}) {
		const params = new URLSearchParams({
			width: opts.width || 1024,
			height: opts.height || 1024,
			model: opts.model || 'flux',
			nologo: 'true',
			seed: opts.seed || Math.floor(Math.random() * 99999),
		});

		return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
	}
}
