import { BusEvent } from '../core/EventBus.js';

export class UIManager {
	constructor() {
		this.isModalOpen = false;
		this.currentMode = 'sharp';
		this.init();
		this._applySavedTheme();
		this.initListeners();
	}

	init() {
		this.debateInput = document.getElementById('debate-input');
		this.debateBtn = document.getElementById('debate-btn');
		this.themeBtn = document.getElementById('theme-btn');

		this.modeContainer = document.getElementById('ai-mode');
		this.KnightsContainer = document.getElementById('knights-grid');
		this.kingSection = document.getElementById('verdict-section');
		this.kingText = document.getElementById('verdict-text');
		this.addBtn = document.getElementById('add-ai-btn');

		this.infoBtn = document.getElementById('info-btn');
		this.modal = document.getElementById('info-modal');
		this.modalCard = document.getElementById('info-modal-card');
		this.closeModalBtn = document.getElementById('closeInfo');

		this.navLinks = document.querySelector('nav');
	}

	initListeners() {
		this.modeContainer.addEventListener('click', (e) => this.toggleMode(e));
		this.navLinks.addEventListener('click', (e) => this.handleNavigation(e));

		this.debateBtn.addEventListener('click', () => {
			const topic = this.debateInput.value.trim();
			if (!topic) return;
			this.handleSearchIcon();
			BusEvent.emit('debate:start', { topic, mode: this.currentMode });
		});
		this.debateInput.addEventListener('keydown', (e) => {
			if (e.key !== 'Enter') return;
			const topic = this.debateInput.value.trim();
			if (!topic) return;
			this.handleSearchIcon();
			BusEvent.emit('debate:start', { topic, mode: this.currentMode });
		});

		BusEvent.on('knight:response', this.renderKnightCard.bind(this));
		BusEvent.on('knight:complete', this.handleKingCard.bind(this));
		BusEvent.on('knights:render', this.renderAll.bind(this));

		this.themeBtn.addEventListener('click', () => this._toggleTheme());
		this.infoBtn.addEventListener('click', this._showModal.bind(this));
		this.closeModalBtn.addEventListener('click', this._hideModal.bind(this));
		document.addEventListener('click', (e) => this._handleClickOutside(e));
		this.addBtn.addEventListener('click', () =>
			BusEvent.emit('nav:change', 'armory'),
		);
	}

	handleSearchIcon() {
		this.debateBtn.style.color = 'var(--primary)';
		setTimeout(() => {
			this.debateBtn.style.color = 'var(--text-muted)';
		}, 100);
	}

	toggleMode(e) {
		const btn = e.target.closest('[data-mode]');
		if (!btn) return;

		document.querySelectorAll('[data-mode]').forEach((b) => {
			b.classList.remove('mode-btn-active', 'shadow-lg');
			b.classList.add('mode-btn-inactive', 'transition-colors');
		});

		btn.classList.remove('mode-btn-inactive', 'transition-colors');
		btn.classList.add('mode-btn-active', 'shadow-lg');

		this.currentMode = btn.dataset.mode;
	}

	handleNavigation(e) {
		const NavBtn = e.target.closest('[data-nav]');
		if (!NavBtn) return;

		document.querySelectorAll('[data-nav]').forEach((b) => {
			b.style.color = 'var(--text-muted)';
			b.style.filter = '';
		});

		NavBtn.style.color = 'var(--primary)';
		NavBtn.style.filter = 'drop-shadow(0 0 8px var(--selection))';

		BusEvent.emit('nav:change', NavBtn.dataset.nav);
	}

	_createCard(data) {
		const KnightCard = `
			<div
				data-id="${data.id}"
				style="border-left: 3px solid ${data.hex}; box-shadow: 0 0 20px ${data.glow}20"
				class="glass-card rounded-[24px] p-6 flex flex-col space-y-6 hover:translate-y-[-4px] transition-transform duration-300"
			>
				<div class="flex items-center gap-4">
					<div
						style="border: 1px solid ${data.hex}; box-shadow: 0 0 20px ${data.glow}"
						class="w-12 h-12 rounded-full flex items-center justify-center"
					>
						<span class="text-2xl">${data.emoji}</span>
					</div>
					<div>
						<h4 class="font-semibold" style="color: var(--text)">${data.name}</h4>
						<p class="text-xs mt-0.5" style="color: var(--text-muted)">${data.model}</p>
					</div>
				</div>
				<div
					data-knight="${data.id}"
					class="flex-1 rounded-xl p-4 min-h-[120px]"
					style="background: var(--input-bg); border-left: 2px solid ${data.hex}"
				>
					<p class="text-sm leading-relaxed" style="color: var(--text-muted)">
						"Awaiting the council..."
					</p>
				</div>
			</div>
		`;

		this.KnightsContainer.insertAdjacentHTML('beforeend', KnightCard);
	}

	renderKnightCard(data) {
		console.log('renderKnightCard called', data);
		const card = this.KnightsContainer.querySelector(
			`[data-knight="${data.id}"]`,
		);
		console.log('found card:', card);
		if (!card) return;
		card.querySelector('p').textContent = data.response;
	}

	renderAll(knights) {
		this.KnightsContainer.innerHTML = '';
		knights.forEach((knight) => this._createCard(knight));
	}

	handleKingCard(verdict) {
		this.kingSection.classList.remove('hidden');
		this.kingText.textContent = verdict;
		this.kingSection.scrollIntoView({ behavior: 'smooth' });
	}

	_applySavedTheme() {
		const saved = localStorage.getItem('camelot-theme') || 'dark';
		this._setTheme(saved);
	}

	_toggleTheme() {
		const current =
			document.documentElement.getAttribute('data-theme') || 'dark';
		this._setTheme(current === 'dark' ? 'light' : 'dark');
	}

	_setTheme(theme) {
		if (theme !== 'light' && theme !== 'dark') theme = 'dark';
		const root = document.documentElement;
		root.setAttribute('data-theme', theme);
		if (theme === 'dark') root.classList.add('dark');
		else root.classList.remove('dark');
		localStorage.setItem('camelot-theme', theme);

		if (this.themeBtn) {
			this.themeBtn.setAttribute(
				'aria-label',
				theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
			);
		}
	}

	_showModal() {
		this.modal.classList.remove('hidden');
		this.modal.classList.add('flex');
		this.isModalOpen = true;
	}

	_hideModal() {
		this.modal.classList.add('hidden');
		this.modal.classList.remove('flex');
		this.isModalOpen = false;
	}

	_handleClickOutside(e) {
		const clickedModalCard = document
			.getElementById('info-modal-card')
			.contains(e.target);
		const clickedModalBtn = this.infoBtn.contains(e.target);

		if (this.isModalOpen && !clickedModalCard && !clickedModalBtn) {
			this._hideModal();
		}
	}
}
