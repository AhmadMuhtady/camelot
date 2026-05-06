import { UIManager } from './services/UIManager.js';
import { CamelotManager } from './core/CamelotManager.js';
import { DebateStore } from './services/DebateStore.js';

class App {
	constructor(ui, camelot) {
		this.store = new DebateStore();
		this.ui = new UIManager(this.store);
		this.camelot = new CamelotManager(this.ui, this.store);
	}
}

const app = new App();
