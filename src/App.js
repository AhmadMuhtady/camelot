import { UIManager } from './services/UIManager.js';
import { CamelotManager } from './core/CamelotManager.js';

class App {
	constructor(ui, camelot) {
		this.ui = new UIManager();
		this.camelot = new CamelotManager(this.ui);
	}
}

const app = new App();
