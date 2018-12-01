var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var async = require('async');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: 'C:/temp'});
var url = 'mongodb://127.0.0.1:27017';
var fs = require('fs');
var path = require('path');


// location:3000/users
router.get('/', function(req, res, next) {
  var page = parseInt(req.query.page) || 1; // 页码
  var pageSize = parseInt(req.query.pageSize) || 5; // 每页显示的条数
  var username = req.query.username;
  var totalSize = 0;  // 总条数
  var data = [];

  MongoClient.connect(url, { useNewUrlParser: true}, function(err, client) {
    if (err) {
      res.render('error', {
        message: '链接失败',
        error: err
      })
      return;
    }

    var db = client.db('project');

    async.series([
      function(cb) {
        db.collection('user').find().count(function(err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },

      function(cb) {
        db.collection('user').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function(err, data) {
          if (err) {
            cb(err)
          } else {
            // data = data;
            cb(null, data)
          }
        })

      }
    ], function(err, results) {
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        var totalPage = Math.ceil(totalSize / pageSize); // 总页数

        res.render('users', {
          list: results[1],
          // totalSize: totalSize,
          username:username,
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page
        })
      }
    })
  })
});




//登录操作localhost:3000/users/phone
router.get('/phone', function(req, res, next) {
  var page = parseInt(req.query.page) || 1; // 页码
  var pageSize = parseInt(req.query.pageSize) || 5; // 每页显示的条数
  var totalSize = 0;  // 总条数
  var data = [];

  MongoClient.connect(url, { useNewUrlParser: true}, function(err, client) {
    if (err) {
      res.render('error', {
        message: '链接失败',
        error: err
      })
      return;
    }

    var db = client.db('project');

    async.series([
      function(cb) {
        db.collection('shop').find().count(function(err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null);
          }
        })
      },

      function(cb) {
        db.collection('shop').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function(err, data) {
          if (err) {
            cb(err)
          } else {
            // data = data;
            cb(null, data)
          }
        })

      }
    ], function(err, results) {
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        var totalPage = Math.ceil(totalSize / pageSize); // 总页数

        res.render('phone', {
          shopList: results[1],
          // totalSize: totalSize,
          // username:username,
          totalPage: totalPage,
          pageSize: pageSize,
          currentPage: page
        })
      }
    })
  })
});



// 登录操作 location:3000/users/login
router.post('/login', function(req, res) {
  // 1. 获取前端传递过来的参数
  var username = req.body.name;
  var password = req.body.pwd;
  // 2. 验证参数的有效性
  if (!username) {
    res.render('error', {
      message: '用户名不能为空',
      error: new Error('用户名不能为空')
    })
    return;
  }

  if (!password) {
    res.render('error', {
      message: '密码不能为空',
      error: new Error('密码不能为空')
    })
    return;
  }

  // 3. 链接数据库做验证
  MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      console.log('连接失败', err);
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }

    var db = client.db('project');

    db.collection('user').find({
      username: username,
      password: password
    }).toArray(function(err, data) {
      if (err) {
        console.log('查询失败', err);
        res.render('error', {
          message: '查询失败',
          error: err
        })
      } else if (data.length <= 0) {
        // 没找到，登录失败
        res.render('error', {
          message: '登录失败',
          error: new Error('登录失败')
        })
      } else {
        // 登录成功

        // cookie操作
        res.cookie('username', data[0].username, {
          maxAge: 60 * 60 * 1000
        });

        res.redirect('/');
      }
      client.close();
    })

  })
  // res.send(''); 注意这里，因为 mongodb 的操作时异步操作。
});

// 注册操作 localhost:3000/users/register
router.post('/register', function(req, res) {
  var name = req.body.name;
  var pwd = req.body.pwd;
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin === '是' ? '是' : '否';

  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
    if (err) {
      res.render('error', {
        message: '链接失败',
        error: err
      })
      return;
    }

    var db = client.db('project');

    async.series([
      function(cb) {
        db.collection('user').find({username: name}).count(function(err, num) {
          if (err) {
            cb(err)
          } else if (num > 0) {
            // 这个人已经注册过了，
            cb(new Error('已经注册'));
          } else {
            // 可以注册了
            cb(null);
          }
        })
      },

      function(cb) {
        db.collection('user').insertOne({
          username: name,
          password: pwd,
          sex: sex,
          isAdmin: isAdmin
        }, function(err) {
          if (err) {
            cb(err);
          } else {
            cb(null);
          }
        })
      }
    ], function(err, result) {
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {
        res.redirect('/login.html');
      }
      // 不管成功or失败，
      client.close();
    })
  })
});



// 删除操作 localhost:3000/users/delete
router.get('/delete', function(req, res){
  var id = req.query.id;

  MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {
    if (err) {
      res.render('error', {
        message: '链接失败',
        error: err
      })
      return;
    }
    var db = client.db('project');
    db.collection('user').deleteOne({
      _id: ObjectId(id)
    }, function(err, data) {
      console.log(data);
      if (err) {
        res.render('error', {
          message: '删除失败',
          error: err
        })
      } else {
        res.redirect('/users');
      }

      client.close();
    })
  })
})


router.get('/remake',function(req,res){
  
  // var id = req.query.id;
  // //喧嚷选择下的id
  // MongoClient.connect(url,{useNewUrlParser:true},function(err,client){

  //   if
  // })
})


// 新增手机
router.post('/addPhone', upload.single('file'), function(req, res) {
  var name= req.body.name;
  var pinpai= req.body.pinpai;
  var price=req.body.price;
  console.log(req.file);
  // 如果想要通过浏览器访问到这张图片的话，是不是需要将图片放到public里面去
  var filename = 'phoneImg/' + new Date().getTime() + '_' + req.file.originalname;
  var newFileName = path.resolve(__dirname, '../public/', filename);
  try {
    // fs.renameSync(req.file.path, newFileName);
    var data = fs.readFileSync(req.file.path);
    fs.writeFileSync(newFileName, data);
    console.log(req.file);
    // console.log(req.body);
    // res.send('上传成功');
    // 操作数据库写入
    MongoClient.connect(url, {useNewUrlParser: true}, function(err, client) {

      var db = client.db('project');
      db.collection('shop').insertOne({
        name: req.body.name,
        pinpai: req.body.pinpai,
        price:req.body.price,
        fileName: filename
      }, function(err) {
        res.redirect('/users/phone');
      })
      client.close();
    })
    } catch (error) {
      res.render('error', {
        message: '新增手机失败',
        error: error
      })
  }

})

module.exports = router;
