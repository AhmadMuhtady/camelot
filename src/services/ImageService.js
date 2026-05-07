export class ImageService {
	generateUrl(prompt, opts = {}) {
		const seed = Math.floor(Math.random() * 99999);
		const model = opts.model || 'flux';
		const cleanPrompt = this._sanitize(prompt);
		const encoded = encodeURIComponent(cleanPrompt);
		return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&model=${model}&seed=${seed}&nologo=true`;
	}

	_sanitize(prompt) {
		return prompt
			.replace(/[éèêë]/g, 'e')
			.replace(/[àâä]/g, 'a')
			.replace(/[îï]/g, 'i')
			.replace(/[ôö]/g, 'o')
			.replace(/[ûü]/g, 'u')
			.replace(/[ç]/g, 'c')
			.replace(/['']/g, "'")
			.replace(/[""]/g, '"')
			.replace(/—/g, '-')
			.replace(/[^\x00-\x7F]/g, '');
	}
}
