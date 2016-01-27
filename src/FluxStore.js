'use strict';

import EventEmitter from 'metal/src/events/EventEmitter';

/**
 * The store base class for use in a Flux architecture
 * (https://facebook.github.io/flux/).
 */
class FluxStore extends EventEmitter {
	constructor(dispatcher) {
		super();
		this.dispatcher_ = dispatcher;
		this.dispatcherId_ = dispatcher.register(this.handleDispatch_.bind(this));
	}

	/**
	 * @inheritDoc
	 */
	disposeInternal() {
		super.disposeInternal();
		this.dispatcher_.unregister(this.dispatcherId_);
		this.dispatcher_ = null;
	}

	/**
	 * Handles a dispatch from this store's dispatcher. Should be overridden
	 * by subclasses.
	 * @protected
	 */
	handleDispatch_() {
		throw new Error('FluxStore.handleDispatch_: Needs to be implemented by subclasses.');
	}
}

/**
 * The name of the event that `FluxStore` should emit when a dispatch causes
 * the store's data to change.
 * @type {string}
 * @static
 */
FluxStore.EVENT_CHANGE = 'change';

export default FluxStore;
