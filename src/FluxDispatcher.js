'use strict';

import Disposable from 'metal/src/disposable/Disposable';

/**
 * The dispatcher class for use in a Flux architecture
 * (https://facebook.github.io/flux/).
 */
class FluxDispatcher extends Disposable {
	constructor() {
		super();
		this.callbacks_ = {};
		this.hasStarted_ = {};
		this.isDone_ = {};
		this.nextId_ = 1;
	}

	/**
	 * Dispatches the given payload to all registered callbacks.
	 * @param {!Object} payload
	 */
	dispatch(payload) {
		if (this.isDispatching_) {
			throw new Error('FluxDispatcher.dispatch: Can\'t dispatch during another dispatch');
		}

		try {
			this.isDispatching_ = true;
			this.currentPayload_ = payload;
			var ids = Object.keys(this.callbacks_);
			for (var i = 0; i < ids.length; i++) {
				if (!this.hasStarted_[ids[i]]) {
					this.runCallback_(ids[i]);
				}
			}
		} finally {
			this.isDispatching_ = false;
			this.currentPayload_ = null;
			this.isDone_ = {};
			this.hasStarted_ = {};
		}
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		this.callbacks_ = null;
		this.currentPayload_ = null;
		this.hasStarted_ = null;
		this.isDone_ = null;
	}

	/**
	 * Registers the given callback, so it can receive payloads from dispatches.
	 * @param {!function(!Object)} callback [description]
	 * @return {number} The registered callback's id. Can be used to unregister it.
	 */
	register(callback) {
		var id = this.nextId_++;
		this.callbacks_[id] = callback;
		return id;
	}

	/**
	 * Runs the callback for the given id. Also updates the callback's state info.
	 * @param {number} id
	 * @protected
	 */
	runCallback_(id) {
		this.hasStarted_[id] = true;
		this.callbacks_[id](this.currentPayload_);
		this.isDone_[id] = true;
	}

	/**
	 * Unregisters the callback with the given id.
	 * @param {number} id The id of a callback registered through `FluxDispatcher.register`.
	 */
	unregister(id) {
		delete this.callbacks_[id];
	}

	/**
	 * Waits until the callbacks for the given ids are done being called on this dispatch.
	 * @param {!Array<number>|number} ids
	 */
	waitFor(ids) {
		if (!this.isDispatching_) {
			throw new Error('FluxDispatcher.waitFor: Must be called during dispatch.');
		}

		ids = Array.isArray(ids) ? ids : [ids];
		for (var i = 0; i < ids.length; i++) {
			if (this.hasStarted_[ids[i]]) {
				if (!this.isDone_[ids[i]]) {
					throw new Error(
						`FluxDispatcher.waitFor: Circular dependency detected while waiting for ${ids[i]}.`
					);
				}
			} else if (!this.callbacks_[ids[i]]) {
				throw new Error(`FluxDispatcher.waitFor: No registered callback with id ${ids[i]}.`);
			} else {
				this.runCallback_(ids[i]);
			}
		}
	}
}

export default FluxDispatcher;
