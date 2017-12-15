const coKoa = require('./src/co-koa.js');
const app = new coKoa();
const router = require('./src/middleware/koa-router.js');
const bodyparser = require('./src/middleware/koa-bodyparser.js');
const port = 3000;

app.use(bodyparser())

app.use(async function (ctx, next) {
    console.log('1');
    await next();
    console.log('1.1');
});
app.use(async function (ctx, next) {
    console.log('2');
    ctx.body = 'middle';
    await next();
    console.log('2.2');
});
app.use(async function (ctx, next) {
    console.log('3');
    await next();
    console.log('3.3');
});

app.use(ctx => {
	console.log('last')
    ctx.body='hello world';
});


app.listen(port, () => {
  console.log(`listening ${port}`);
});