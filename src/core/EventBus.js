class EventBus {
	storage = {};

	on(event, callback) {
		if (!this.storage[event]) {
			this.storage[event] = [];
		}

		if (!this.storage[event].includes(callback)) {
			this.storage[event].push(callback);
		}
	}

	emit(event, data) {
		const events = this.storage[event];

		if (!events) return;

		events.forEach((callback) => {
			callback(data);
		});
	}

	off(event, callback) {
		const events = this.storage[event];
		if (!events) return;

		this.storage[event] = events.filter((cb) => cb !== callback);
	}
}

export const BusEvent = new EventBus();
