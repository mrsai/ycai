var express = require("express");
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var multipart = require('connect-multiparty');

// 这几个是处理session必须的
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var port = process.env.PORT || 3000;
var app = express();
var dbUrl = 'mongodb://localhost/imovie';
// 输出错误信息
var morgan = require('morgan');
app.locals.moment = require('moment');

mongoose.connect(dbUrl);
app.set('views','./app/view/pages');
app.set('view engine','jade');

// models loading 单元测试模块
var models_path = __dirname+'/app/models';
var walk = function (path) {
    fs.readdirSync(path).forEach(function(file){
        var newPath = path+'/'+file;
        var stat = fs.statSync(newPath);
        if(stat.isFile()){
            if(/(.*)\.(js|coffee)/.test(file)){
                require(newPath);
            }
        }else if(stat.isDirectory()){
            walk(newPath);
        }
    });
}
walk(models_path);
// bodyParser 新旧用法有所区别
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(session({
    secret:'imooc',
    store:new mongoStore({
        url:dbUrl,
        collection:'session'
    }),
    resave: true,
    saveUninitialized: true 
}));
app.use(express.static(path.join(__dirname,'node_modules')));
app.use(multipart());
app.listen(port);
console.log('immoc started on port ', port);

require('./config/routes.js')(app);
// 配置

if('development'===app.get('env')){
    app.set('showStackError',true);
    app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
    app.locals.pretty = true;
    mongoose.set('debug',true);
}