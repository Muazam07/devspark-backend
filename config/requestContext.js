const { AsyncLocalStorage } = require("async_hooks");

const storage = new AsyncLocalStorage();

exports.middleware = (req, res, next) => {
  const context = { requestId: req.id };
  res.locals.context = context;
  storage.run(context, next);
};

exports.get = () => storage.getStore();

exports.setEmail = (email) => {
  const context = storage.getStore();
  if (context) context.email = email;
};

exports.setHandler = (handler, handlerLocation) => {
  const context = storage.getStore();
  if (!context) return;

  context.handler = handler;
  context.handlerLocation = handlerLocation;
};
