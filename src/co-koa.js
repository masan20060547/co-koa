const http = require('http');
const url = require('url');
const URL = url.URL;
const Stream = require('stream');

module.exports = class coKoa {
  constructor() {
    this.middleware = [];
    this.body = '';
  }

  use (fn) {
    this.middleware.push(fn);
  }

  compose (middleware) {
    if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
	  for (const fn of middleware) {
	    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
	  }

	  return function (context, next) {

	    let index = -1
	    return dispatch(0)
	    function dispatch (i) {
	      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
	      index = i
	      let fn = middleware[i]
	      // if (i === middleware.length) fn = next
	      if (!fn) return Promise.resolve()
	      try {
	        return Promise.resolve(fn(context, function next () {
	          return dispatch(i + 1)
	        }))
	      } catch (err) {
	        return Promise.reject(err)
	      }
	    }
	  }
  }

  handleRequest (req, res) {
    let ctx = {};
    ctx.req = req;
    ctx.res = res;
    ctx.path = url.parse(req.url).pathname;
    ctx.method = req.method;
    res.statusCode = 404;
    const fnMiddleware = this.compose(this.middleware);
    return fnMiddleware(ctx).then(() => {
      // TODO 其他数据类型
      let body = ctx.body; 

      if (ctx.res.headersSent) {
        res.end();
      } else {
        res.statusCode = 200;
      }
      if (body === undefined) {
        res.statusCode = 404;
      }

      if (body instanceof Stream) {
        return body.pipe(res);
      }

      if (typeof body !== 'string') {
        body = JSON.stringify(body);
      }
      res.end(body || 'not found');
    }).catch(err => {
      console.log(err);
    })
  };

  listen(port, cb) {
    const server = http.createServer(this.handleRequest.bind(this));
    return server.listen(port, cb);
  }

};