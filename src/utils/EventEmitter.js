// Minimal event emitter — the backbone of the Experience pattern.
// Every core system extends or instantiates this so modules can talk
// without tight coupling (sizes -> resize, time -> tick, etc.).
export default class EventEmitter {
  constructor() {
    this.callbacks = {};
  }

  on(name, callback) {
    if (!name || typeof callback !== 'function') return this;
    (this.callbacks[name] ||= []).push(callback);
    return this;
  }

  off(name, callback) {
    if (!this.callbacks[name]) return this;
    if (!callback) {
      delete this.callbacks[name];
    } else {
      this.callbacks[name] = this.callbacks[name].filter((c) => c !== callback);
    }
    return this;
  }

  trigger(name, args = []) {
    if (!this.callbacks[name]) return;
    // copy so a handler that removes itself doesn't disturb iteration
    [...this.callbacks[name]].forEach((callback) => callback(...args));
  }
}
