
var express = require('express');
var router = express.Router();
var async = require('async');

var ObjectId = require('mongodb').ObjectId;
//串行有关联。
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://127.0.0.1:27017';
/* GET users listing. */
//通过localhost:3000/users能够访问到users中的页面
router.get('/', function (req, res, next) {

  //当进来首页的时候进行分页
  var page = parseInt(req.query.page) || 1; //页码
  var pageSize = parseInt(req.query.pageSize) || 5; //每页显示的条数
  var totalSize = 0;  //总条数
  var data = [];
  //连接数据库
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      res.render('error', {
        message: '链接失败',
        error: err
      })
      return;
    }
    //使用串行无关链
    var db = client.db('project');
    async.series([
      //里面两个异步操作   
      function (cb) {
        //在数据库中查询全部数据；
        db.collection('user').find().count(function (err, num) {
          if (err) {
            cb(err);
          } else {
            totalSize = num;
            cb(null); //会执行下面的代码
          }
        })
      },

      function (cb) {

        //数据库操作
        //limit()   skip();
        db.collection('user').find().limit(pageSize).skip(page * pageSize - pageSize).toArray(function (err, data) {
          if (err) {
            cb(err)
          } else {
            // data = data;
            cb(null, data)
          }
        });
      }
    ], function (err, results) {    //从上一个函数中获取到了两个数据data
      if (err) {
        res.render('error', {
          message: '错误',
          error: err
        })
      } else {

        var totalPage = Math.ceil(totalSize / pageSize); // 总页数
        res.render('users', {
          list: results[1],
          totalPage: totalPage,
          pageSize: pageSize,
          // //当前的页数；
          currentPage: page
        });
      }
      client.close();
    });
  });
});



//登录操作 localhost:3000/users/login
router.post('/login', function (req, res) {
  //1：获取到前端传递过来的参数
  var username = req.body.name;
  var password = req.body.pwd;

  //2:验证参数的有效性
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
  // res.send('');
  //3:  连接数据库做验证
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
    if (err) {
      console.log('连接失败', err);
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('project');

    // db.collection('user').find({ 
    //     username:username,
    //     password:password
    // //进行单独的登录验证判断mongodb里面是否存在。
    // }).count(function(err,num){
    //   if(err){
    //     console.log('查询失败',err);
    //     res.render('error',{
    //         message:'查询失败',
    //         error:err
    //     })
    //   }else if(num > 0){
    //       // 注意，当前url地址是 location:3000/users/login。 
    //       //如果直接使用 render() .页面地址是不会改变的。
    //       // res.redirect('http://localhost:3000/');
    //       res.redirect('/');
    //   }else{
    //       //登录失败
    //       res.render('error',{

    //           message:'登录失败',
    //           error: new Error('登录失败')
    //       })
    //   }
    //   client.close();
    // }) 

    db.collection('user').find({
      //把获取到的值赋值
      username: username,
      password: password
    }).toArray(function (err, data) {
      if (err) {
        console.log('查询失败', err);
        res.render('error', {
          message: '查询失败',
          error: err
        })
      } else if (data.length <= 0) {
        // 没找到接收到的值data的长度为0，登录失败
        res.render('error', {
          message: '登录失败',
          error: new Error('登录失败')
        })
      } else {
        // 登录成功
        // cookie操作把昵称报错在cookie里面
        res.cookie('nickname', data[0].nickname, {
          //在cookie中保存的最长的时间。
          maxAge: 60 * 60 * 1000
        });

        res.redirect('/');
      }
      client.close();
    })
  })
  // res.send(''); 注意这里，因为 mongodb 的操作时异步操作。
})


///这次操作localhost:3000/users/register
router.post('/register', function (req, res) {

  var name = req.body.name;
  var pwd = req.body.pwd;
  var sex = req.body.sex;
  var isAdmin = req.body.isAdmin === '是' ? true : false;

  console.log(name, pwd, sex, isAdmin);
  //连接mongodb数据库
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {

    if (err) {
      res.render('error', {

        message: '连接失败',
        error: err
      })
      return;
    }
    //连接数据表
    var db = client.db('project');

    //使用一个串行有关联

    async.series([

      function (cb) {

        //在数据表中查找如果存在某个名字就
        db.collection('user').find({ username: name }).count(function (err, num) {
          if (err) {
            //跳转错误显示的。
            cb(err);
          } else if (num > 0) {
            // 这个人已经注册过了，
            cb(new Error('已经注册'));
          } else {
            // 可以注册了
            cb(null);
          }
        })
      },

      //如果注册的用户不存在，就执行插入语句。 
      function (cb) {
        db.collection('user').insertOne({
          username: name,
          password: pwd,
          sex: sex,
          isAdmin: isAdmin
        }, function (err) {
          if (err) {
            cb(err);
          } else {
            cb(null);
          }
        })
      }
    ], function (err, result) {
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
})

//删除操作，localhost:3000/users/delete
router.get('/delete', function (req, res) {

  var id = req.query.id;

  MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {

    if (err) {
      res.render('error', {
        message: '连接失败',
        error: err
      })
      return;
    }
    var db = client.db('project');

    db.collection('user').deleteOne({

      _id: ObjectId(id)
    }, function (err) {
      if (err) {
        res.render('error', {

          message: '删除失败',
          error: err
        })
      } else {
        //删除成功页面就刷新
        res.redirect('/users');
      }
    })
    client.close();
  })
})

module.exports = router;
