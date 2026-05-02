class EventBus {
	storage = {};

	on(event, callback) {
		if (!this.storage[event]) {
			this.storage[event] = [];
		}

		if (!this.storage[event].include(callback)) {
			this.storage[event].push(callback);
		}

		console.log(this.storage);
	}

	emit(event, data) {
		const events = this.storage[event];

		if (!events) return;

		events.forEach((callback) => {
			callback(data);
		});

		console.log(this.storage, events);
	}

	off(event, callback) {
		const events = this.storage[event];
		if (!events) return;

		this.storage[event] = events.filter((cb) => cb !== callback);

		console.log(this.storage);
	}
}

export const BusEvent = new EventBus();
