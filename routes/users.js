var express = require('express');
var router = express.Router();
var MongoClient   =  require('mongodb').MongoClient;

var url = 'mongodb://127.0.0.1:27017';
/* GET users listing. */
//通过localhost:3000/users能够访问到users中的页面
router.get('/', function(req, res, next) {
  //连接数据库
  MongoClient.connect(url,function(err,client){
   
    //如果连接数据库失败把报错的原因显示出来。
    if(err){
      //连接数据库失败
      console.log('连接数据库失败',err);
      res.render('error',{
        message:'链接数据库失败',
        error:err
      });
      return;
    }
    //连接数据库名
    var db = client.db('project');
    //查询数据集合
    db.collection('user').find().toArray(function(err,data){

      if(err){

        console.log('查询用户数据失败',err);
        //有错误渲染一个error.ejs
        res.render('error',{
            message:'查询失败',
            error:err
        })
      }else{
        console.log(data);

        res.render('users',{
          //把得到的list的值传递个list前端调用。
            list:data
        });
      }
      //关闭数据库连接
      client.close();
    })
  });
});

//登录操作 localhost:3000/users/login
router.post('/login',function(req,res){
    //1：获取到前端传递过来的参数
    var username = req.body.name;
    var password = req.body.pwd;

    //2:验证参数的有效性
    if(!username){
        res.render('error',{
            message:'用户名不能为空',
            error: new Error('用户名不能为空')
        })
        return;
    }
    if(!password){
      res.render('error',{
        message:'密码不能为空',
        error: new Error('密码不能为空')
      })
      return; 
    }
    // res.send('');
    //3:  连接数据库做验证
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
        username:username,
        password:password
    }).toArray(function(err, data) {
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
             maxAge: 10 * 60 * 1000
        });

        res.redirect('/');
      }
      client.close();
    })
  })
  // res.send(''); 注意这里，因为 mongodb 的操作时异步操作。
})

module.exports = router;
