const { AsyncLocalStorage } = require("async_hooks");

const storage = new AsyncLocalStorage();

exports.middleware = (req, res, next) => {
  storage.run({ requestId: req.id }, next);
};

exports.get = () => storage.getStore();

exports.setHandler = (handler, handlerLocation) => {
  const context = storage.getStore();
  if (!context) return;

  context.handler = handler;
  context.handlerLocation = handlerLocation;
};
