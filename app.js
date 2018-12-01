var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var ignoreRouter = require('./config/ignoreRouter');
var indexRouter = require('./routes/index.js');
var usersRouter = require('./routes/users.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//静态托管文件public
app.use(express.static(path.join(__dirname, 'public')));


//自己实现的中间件函数，用来判断用户是否登录
app.use(function(req,res,next){


  //排除登录和注册；  如果cookie里面存在就可以实现跳转。
  if(ignoreRouter.indexOf(req.url) > -1){
      next();
      return;
  }

  //得到的保存在cookie中的一个值
  var username = req.cookies.username; 
  if(username){
    //如果username存在于cookie里的话就不用再到登录页面中去
    next();
  }else{
    //如果username不存在，就跳转到登录页面(用地址重定向。)
    res.redirect('/login.html');
  }
    //中间件执行了，要往下面走用next()
})

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
