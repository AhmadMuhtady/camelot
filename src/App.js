import { UIManager } from './services/UIManager.js';

class App {
	constructor(ui) {
		this.ui = new UIManager();
	}
}

const app = new App();
