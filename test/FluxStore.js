'use strict';

import EventEmitter from 'metal/src/events/EventEmitter';
import FluxDispatcher from '../src/FluxDispatcher';
import FluxStore from '../src/FluxStore';

describe('FluxStore', function() {
	var store;

	afterEach(function() {
		store.dispose();
	});

	it('should extend from EventEmitter', function() {
		store = new FluxStore(new FluxDispatcher());
		assert.ok(store instanceof EventEmitter);
	});

	it('should call `handleDispatch_` method automatically for subclasses on dispatch', function() {
		var receivedPayload;
		class TestStore extends FluxStore {
			handleDispatch_(payload) {
				receivedPayload = payload;
			}
		}

		var dispatcher = new FluxDispatcher();
		store = new TestStore(dispatcher);
		var sentPayload = {};
		dispatcher.dispatch(sentPayload);

		assert.strictEqual(receivedPayload, sentPayload);
	});

	it('should throw error if `handleDispatch_` is not implemented by subclass', function() {
		class TestStore extends FluxStore {
		}
		var dispatcher = new FluxDispatcher();
		store = new TestStore(dispatcher);
		assert.throws(() => dispatcher.dispatch());
	});

	it('should not call `handleDispatch_` method automatically for subclasses after dispose', function() {
		var called;
		class TestStore extends FluxStore {
			handleDispatch_() {
				called = true;
			}
		}

		var dispatcher = new FluxDispatcher();
		store = new TestStore(dispatcher);
		store.dispose();
		dispatcher.dispatch({});

		assert.ok(!called);
	});
});
