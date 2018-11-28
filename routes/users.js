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


// router.get('/')



module.exports = router;
