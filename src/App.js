import { UIManager } from './services/UIManager.js';
import { CamelotManager } from './core/CamelotManager.js';
import { DebateStore } from './services/DebateStore.js';
import { SquireManager } from './core/SquireManager.js';

class App {
	constructor(ui, camelot, store, squire) {
		this.store = new DebateStore();
		this.ui = new UIManager(this.store);
		this.camelot = new CamelotManager(this.ui, this.store);
		this.squire = new SquireManager();
	}
}

const app = new App();
