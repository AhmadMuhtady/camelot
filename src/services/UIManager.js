import { BusEvent } from '../core/EventBus.js';

export class UIManager {
	constructor(store) {
		this.isModalOpen = false;
		this.currentMode = 'sharp';
		this.currentTab = 'roundtable';
		this.store = store;
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

		this.knightPanel = document.getElementById('knight-panel');
		this.panelList = document.getElementById('panel-knights-list');
		this.knightCount = document.getElementById('knight-count');

		this.imagePanel = document.getElementById('image-panel');
		this.imagePanelList = document.getElementById('panel-image-list');
		this.imageKnightCount = document.getElementById('image-knight-count');
	}

	initListeners() {
		this.modeContainer.addEventListener('click', (e) => this.toggleMode(e));
		this.navLinks.addEventListener('click', (e) => this.handleNavigation(e));

		this.debateInput.addEventListener('keydown', (e) => {
			if (e.key !== 'Enter') return;
			const topic = this.debateInput.value.trim();
			if (!topic) return;
			this.handleSearchIcon();
			if (this.currentTab === 'squire') {
				BusEvent.emit('squire:generate', topic);
			} else {
				BusEvent.emit('debate:start', { topic, mode: this.currentMode });
			}
		});

		BusEvent.on('knight:response', this.renderKnightCard.bind(this));
		BusEvent.on('knight:complete', this.handleKingCard.bind(this));
		BusEvent.on('knights:render', (knights) => {
			this.renderAll(knights);
			this._updateRemoveBtns();
		});

		this.themeBtn.addEventListener('click', () => this._toggleTheme());
		this.infoBtn.addEventListener('click', this._showModal.bind(this));
		this.closeModalBtn.addEventListener('click', this._hideModal.bind(this));
		document.addEventListener('click', (e) => this._handleClickOutside(e));

		this.addBtn.addEventListener('click', () => {
			if (this.currentTab === 'squire') {
				this.imagePanel.classList.toggle('hidden');
			} else {
				this.knightPanel.classList.toggle('hidden');
			}
		});

		this.panelList.addEventListener('click', (e) => {
			const btn = e.target.closest('[data-add]');
			if (!btn) return;
			BusEvent.emit('knight:add', btn.dataset.add);
		});

		this.KnightsContainer.addEventListener('click', (e) => {
			const btn = e.target.closest('[data-remove]');
			if (!btn) return;
			BusEvent.emit('knight:remove', btn.dataset.remove);
		});

		BusEvent.on('panel:update', ({ inactive, activeCount }) => {
			this._renderPanel(inactive);
			this.knightCount.textContent = `${activeCount}/6 active`;
		});

		BusEvent.on('verdict:reset', () => {
			this.kingSection.classList.add('hidden');
			this.kingText.textContent = '';
		});

		BusEvent.on('chronicles:update', (debates) =>
			this._renderChronicles(debates),
		);

		document
			.getElementById('chronicles-clear')
			?.addEventListener('click', () => {
				BusEvent.emit('chronicles:clear');
			});

		BusEvent.on('chronicles:clear', () => {
			document.getElementById('chronicles-list').innerHTML = '';
		});

		// Replace the chronicles-list click listener:
		document
			.getElementById('chronicles-list')
			?.addEventListener('click', (e) => {
				const chip = e.target.closest('[data-index]');
				if (!chip) return;
				const debates = this.store ? this.store.getAll() : [];
				const debate = debates[chip.dataset.index];
				if (debate) BusEvent.emit('chronicles:replay', debate);
			});

		this.debateBtn.addEventListener('click', () => {
			const topic = this.debateInput.value.trim();
			if (!topic) return;
			this.handleSearchIcon();
			if (this.currentTab === 'squire') {
				BusEvent.emit('squire:generate', topic);
			} else {
				BusEvent.emit('debate:start', { topic, mode: this.currentMode });
			}
		});

		BusEvent.on('squire:loading', (isLoading) => {
			document
				.getElementById('squire-loading')
				.classList.toggle('hidden', !isLoading);
			document
				.getElementById('squire-gallery')
				.classList.toggle('hidden', isLoading);
		});

		BusEvent.on('squire:results', (results) =>
			this._renderSquireResults(results),
		);
		BusEvent.on('squire:error', (msg) => {
			const gallery = document.getElementById('squire-gallery');
			if (gallery)
				gallery.innerHTML = `<p class="text-sm col-span-3 text-center py-8" style="color:var(--text-muted)">Generation failed: ${msg}</p>`;
		});
		BusEvent.on('squire:image:render', (models) =>
			this._renderImageKnights(models),
		);

		this.imagePanelList.addEventListener('click', (e) => {
			const btn = e.target.closest('[data-image-add]');
			if (!btn) return;
			BusEvent.emit('image:add', Number(btn.dataset.imageAdd));
		});

		BusEvent.on('image:panel:update', ({ inactive, activeCount }) => {
			this._renderImagePanel(inactive);
			this.imageKnightCount.textContent = `${activeCount}/3 active`;
		});
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

		const tab = NavBtn.dataset.nav;

		const isSquire = tab === 'squire';
		const isChronicles = tab === 'chronicles';
		const isRoundtable = tab === 'roundtable';

		document
			.getElementById('mode-section')
			.classList.toggle('hidden', !isRoundtable);
		document
			.getElementById('knights-grid')
			.classList.toggle('hidden', !isRoundtable);
		document
			.getElementById('chronicles-section')
			.classList.toggle('hidden', !isRoundtable && !isChronicles);
		document
			.getElementById('squire-section')
			.classList.toggle('hidden', !isSquire);

		if (isSquire) {
			this.debateInput.placeholder = 'Describe your vision for the Squire...';
			this.debateBtn.querySelector('span').textContent = 'brush';
			document.getElementById('verdict-section').classList.add('hidden');
		} else {
			this.debateInput.placeholder = 'Summon a debate topic...';
			this.debateBtn.querySelector('span').textContent = 'gavel';
		}

		this.currentTab = tab;

		BusEvent.emit('nav:change', tab);
	}

	_createCard(data) {
		const KnightCard = `
			<div
				data-id="${data.id}"
				style="border-left: 3px solid ${data.hex}; box-shadow: 0 0 20px ${data.glow}20; min-height: 400px"
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

						<button data-remove="${data.id}" 
            class="text-xs px-2 py-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
            style="color: var(--text-muted)"><span class="material-symbols-outlined text-base">close</span></button>
				</div>
				<div
					data-knight="${data.id}"
					class="flex-1 rounded-xl p-4 min-h-[120px]"
					style="background: var(--input-bg); border-left: 2px solid ${data.hex}"
				>
    <div class="loading-state flex items-center gap-2 pt-2">
        <div class="w-2 h-2 rounded-full animate-pulse" style="background: ${data.hex}"></div>
        <div class="w-2 h-2 rounded-full animate-pulse" style="background: ${data.hex}; animation-delay: 0.2s"></div>
        <div class="w-2 h-2 rounded-full animate-pulse" style="background: ${data.hex}; animation-delay: 0.4s"></div>
    </div>
    <!-- Response text (hidden until response arrives) -->
    <p class="response-text text-sm leading-relaxed hidden" style="color: var(--text-muted)"></p>
				</div>
			</div>
		`;

		this.KnightsContainer.insertAdjacentHTML('beforeend', KnightCard);
	}

	renderKnightCard(data) {
		const card = this.KnightsContainer.querySelector(
			`[data-knight="${data.id}"]`,
		);
		if (!card) return;
		card.querySelector('.loading-state').classList.add('hidden');
		const p = card.querySelector('.response-text');
		p.textContent = data.response;
		p.classList.remove('hidden');
	}

	renderAll(knights) {
		this.KnightsContainer.innerHTML = '';
		knights.forEach((knight) => this._createCard(knight));
	}

	// Render image knight cards (called on init and when models change)
	_renderImageKnights(models) {
		const grid = document.getElementById('image-knights-grid');
		if (!grid) return;
		grid.innerHTML = '';
		models.forEach((m) => {
			grid.insertAdjacentHTML(
				'beforeend',
				`
            <div class="glass-card rounded-[24px] p-6 flex flex-col gap-4"
                 style="border-left: 3px solid ${m.hex}; box-shadow: 0 0 20px ${m.glow}20">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center"
                         style="border: 1px solid ${m.hex}; box-shadow: 0 0 15px ${m.glow}">
                        <span class="text-xl">${m.emoji}</span>
                    </div>
                    <div>
                        <h4 class="font-semibold text-sm" style="color: var(--text)">${m.name}</h4>
                        <p class="text-xs" style="color: var(--text-muted)">${m.model}</p>
                    </div>
                </div>
            </div>
        `,
			);
		});
	}

	// Render generated image results
	_renderSquireResults(results) {
		const gallery = document.getElementById('squire-gallery');
		if (!gallery) return;
		gallery.innerHTML = '';
		results.forEach((r, idx) => {
			gallery.insertAdjacentHTML(
				'beforeend',
				`<div class="glass-card rounded-[24px] overflow-hidden flex flex-col"
			     style="border: 1px solid ${r.hex || 'var(--border)'}">
			    <div class="relative aspect-square" style="background:var(--input-bg)">
			        <div data-skeleton="${idx}" class="absolute inset-0 flex flex-col items-center justify-center gap-3">
			            <div class="flex gap-2">
			                <div class="w-2 h-2 rounded-full animate-pulse" style="background:${r.hex}"></div>
			                <div class="w-2 h-2 rounded-full animate-pulse" style="background:${r.hex};animation-delay:0.2s"></div>
			                <div class="w-2 h-2 rounded-full animate-pulse" style="background:${r.hex};animation-delay:0.4s"></div>
			            </div>
			            <p class="text-xs" style="color:var(--text-muted)">Painting...</p>
			        </div>
			        <img data-img="${idx}" src="${r.url}" alt="${r.title}"
			             referrerpolicy="no-referrer"
			             class="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"/>
			        <div class="absolute inset-0 flex items-end opacity-0 hover:opacity-100 transition-opacity duration-300"
			             style="background:linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)">
			            <p class="text-xs leading-relaxed p-4 pb-12" style="color:rgba(255,255,255,0.9)">${r.prompt}</p>
			        </div>
			        <button data-dl="${idx}"
			                class="hidden absolute bottom-3 right-3 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
			                style="background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.15);color:#fff"
			                title="Download image">
			            <span class="material-symbols-outlined text-[18px]">download</span>
			        </button>
			    </div>
			    <div class="p-4 space-y-1">
			        <p class="font-semibold text-sm" style="color:var(--primary)">${r.title}</p>
			        <p class="text-xs" style="color:var(--text-muted)">${r.style}</p>
			    </div>
			</div>`,
			);

			const img = gallery.querySelector(`[data-img="${idx}"]`);
			const skeleton = gallery.querySelector(`[data-skeleton="${idx}"]`);
			const dlBtn = gallery.querySelector(`[data-dl="${idx}"]`);

			img.addEventListener('load', () => {
				skeleton.classList.add('hidden');
				img.classList.remove('opacity-0');
				dlBtn.classList.remove('hidden');
			});
			img.addEventListener('error', async () => {
				await new Promise((r) => setTimeout(r, 4000));
				const url = new URL(img.src);
				url.searchParams.set('seed', Math.floor(Math.random() * 99999));
				img.src = url.toString();
			});
			dlBtn.addEventListener('click', async () => {
				try {
					const res = await fetch(r.url, { referrerPolicy: 'no-referrer' });
					const blob = await res.blob();
					const a = document.createElement('a');
					a.href = URL.createObjectURL(blob);
					a.download = `${r.title.replace(/\s+/g, '_')}.jpg`;
					a.click();
					URL.revokeObjectURL(a.href);
				} catch (e) {
					console.error('Download failed:', e);
				}
			});
		});
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

		const clickedPanel = this.knightPanel.contains(e.target);
		const clickedAddBtn = this.addBtn.contains(e.target);

		if (
			!this.knightPanel.classList.contains('hidden') &&
			!clickedPanel &&
			!clickedAddBtn
		) {
			this.knightPanel.classList.add('hidden');
		}
	}

	_renderPanel(inactive) {
		this.panelList.innerHTML = '';

		if (inactive.length === 0) {
			this.panelList.innerHTML = `<p class="text-xs text-center py-2" style="color: var(--text-muted)">All knights are active!</p>`;
			return;
		}

		inactive.forEach((k) => {
			const knightsPanel = `
            <div class="flex items-center justify-between p-2 rounded-xl"
                 style="background: var(--input-bg)">
                <span class="text-sm" style="color: var(--text)">${k.id}</span>
                <button data-add="${k.id}" class="text-xs px-2 py-1 rounded-lg"
                        style="background: var(--primary); color: var(--bg)">
                    + Add
                </button>
            </div>
        `;
			this.panelList.insertAdjacentHTML('beforeend', knightsPanel);
		});
	}

	_updateRemoveBtns() {
		const activeCount = document.querySelectorAll('[data-id]').length;
		document.querySelectorAll('[data-remove]').forEach((btn) => {
			btn.style.display = activeCount <= 2 ? 'none' : 'block';
		});
	}

	_renderChronicles(debates) {
		const list = document.getElementById('chronicles-list');
		if (!list) return;
		list.innerHTML = '';
		debates.forEach((d, i) => {
			list.insertAdjacentHTML(
				'beforeend',
				`
            <button data-index="${i}" 
                    class="text-xs px-3 py-1.5 rounded-full glass-card chronicle-chip"
                    style="color: var(--text-muted)">
                ${d.topic}
            </button>
        `,
			);
		});
	}

	_renderImagePanel(inactive) {
		this.imagePanelList.innerHTML = '';

		if (inactive.length === 0) {
			this.imagePanelList.innerHTML = `<p class="text-xs text-center py-2" style="color: var(--text-muted)">All image knights active!</p>`;
			return;
		}

		inactive.forEach((m) => {
			this.imagePanelList.insertAdjacentHTML(
				'beforeend',
				`
            <div class="flex items-center justify-between p-2 rounded-xl"
                 style="background: var(--input-bg)">
                <div class="flex items-center gap-2">
                    <span>${m.emoji}</span>
                    <span class="text-sm" style="color: var(--text)">${m.name}</span>
                </div>
                <button data-image-add="${m.id}" class="text-xs px-2 py-1 rounded-lg"
                        style="background: var(--primary); color: var(--bg)">
                    + Add
                </button>
            </div>
        `,
			);
		});
	}
}
