'use strict';

import FluxDispatcher from '../src/FluxDispatcher';

describe('FluxDispatcher', function() {
	var dispatcher;

	beforeEach(function() {
		dispatcher = new FluxDispatcher();
	});

	afterEach(function() {
		dispatcher.dispose();
	});

	it('should run registered callbacks passing the dispatched payload', function() {
		var callback1 = sinon.stub();
		var callback2 = sinon.stub();

		dispatcher.register(callback1);
		dispatcher.register(callback2);

		var payload = {};
		dispatcher.dispatch(payload);

		assert.strictEqual(1, callback1.callCount);
		assert.strictEqual(payload, callback1.args[0][0]);
		assert.strictEqual(1, callback2.callCount);
		assert.strictEqual(payload, callback2.args[0][0]);
	});

	it('should not run unregistered callbacks when payload is dispatched', function() {
		var callback1 = sinon.stub();
		var callback2 = sinon.stub();

		dispatcher.register(callback1);
		var id2 = dispatcher.register(callback2);
		dispatcher.unregister(id2);

		var payload = {};
		dispatcher.dispatch(payload);

		assert.strictEqual(1, callback1.callCount);
		assert.strictEqual(payload, callback1.args[0][0]);
		assert.strictEqual(0, callback2.callCount);
	});

	it('should throw error if trying to dispatch during another dispatch', function() {
		dispatcher.register(() => dispatcher.dispatch({}));
		assert.throws(function() {
			dispatcher.dispatch({});
		});
	});

	it('should be able to dispatch again after a dispatch caused an error', function() {
		var id = dispatcher.register(() => {
			throw new Error();
		});
		var callback = sinon.stub();
		dispatcher.register(callback);

		assert.throws(function() {
			dispatcher.dispatch({});
		});
		assert.strictEqual(0, callback.callCount);

		dispatcher.unregister(id);
		dispatcher.dispatch({});
		assert.strictEqual(1, callback.callCount);
	});

	describe('waitFor', function() {
		it('should throw error if `waitFor` is called outside a dispatch', function() {
			var id = dispatcher.register(sinon.stub());
			assert.throws(() => dispatcher.waitFor(id));
		});

		it('should allow a callback to wait for another callback to finish', function() {
			var callback1 = sinon.spy(() => {
				assert.strictEqual(0, callback2.callCount);
				assert.strictEqual(0, callback3.callCount);

				dispatcher.waitFor(id2);
				assert.strictEqual(1, callback2.callCount);
				assert.strictEqual(0, callback3.callCount);
			});

			var callback2 = sinon.stub();
			var callback3 = sinon.stub();
			dispatcher.register(callback1);
			var id2 = dispatcher.register(callback2);
			dispatcher.register(callback3);

			dispatcher.dispatch({});
			assert.strictEqual(1, callback1.callCount);
		});

		it('should allow a callback to wait for multiple another callbacks to finish', function() {
			var callback1 = sinon.spy(() => {
				assert.strictEqual(0, callback2.callCount);
				assert.strictEqual(0, callback3.callCount);

				dispatcher.waitFor([id2, id3]);
				assert.strictEqual(1, callback2.callCount);
				assert.strictEqual(1, callback3.callCount);
			});

			var callback2 = sinon.stub();
			var callback3 = sinon.stub();
			dispatcher.register(callback1);
			var id2 = dispatcher.register(callback2);
			var id3 = dispatcher.register(callback3);

			dispatcher.dispatch({});
			assert.strictEqual(1, callback1.callCount);
		});

		it('should run callback immediately if it waits for another that has already run', function() {
			var callback1 = sinon.stub();
			var callback2 = sinon.spy(() => {
				assert.strictEqual(1, callback1.callCount);
				dispatcher.waitFor(id1);
			});
			var id1 = dispatcher.register(callback1);
			dispatcher.register(callback2);

			dispatcher.dispatch({});
			assert.strictEqual(1, callback2.callCount);
		});

		it('should throw error if circular dependency is detected while waiting for callbacks', function() {
			var callback1 = sinon.spy(() => {
				dispatcher.waitFor(id2);
			});
			var callback2 = sinon.spy(() => {
				assert.throws(() => dispatcher.waitFor(id1));
			});
			var id1 = dispatcher.register(callback1);
			var id2 = dispatcher.register(callback2);

			dispatcher.dispatch({});
			assert.strictEqual(1, callback1.callCount);
			assert.strictEqual(1, callback2.callCount);
		});

		it('should throw error if callback requests waiting for unregistered callback', function() {
			var callback = sinon.spy(() => {
				assert.throws(() => dispatcher.waitFor(3));
			});
			dispatcher.register(callback);
			dispatcher.dispatch({});
		});
	});
});
