// src/setupProxy.js
// NOTE: the old version proxied /api to http://localhost:3000 (the app
// itself) and required http-proxy-middleware, which is not installed.
// The frontend calls the backend directly at http://localhost:5001/api,
// so no proxy is needed here. This file only adds the ngrok header.
module.exports = function(app) {
  app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
  });
};
