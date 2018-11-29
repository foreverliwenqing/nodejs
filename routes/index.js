var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.get('/users.html', function(req, res) {

//   //结束表示；
//   res.render('users');
// });


// 注册页面的路由
router.get('/register.html', function(req, res) {
  res.render('register');
})


router.get('/brand.html', function(req, res) {
  res.render('brand');
});

router.get('/login.html',function(req,res,next){
    res.render('login');
})

router.get('/phone.html', function(req, res) {
  res.render('phone');
})


module.exports = router;
