var express = require('express');
var bodyparser = require('body-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var cors = require('cors');
var pbkfd2Password = require('pbkdf2-password');
var hasher = pbkfd2Password();
var jwk = require('jsonwebtoken');
//서버구동
var app = express();
app.use(logger('dev'));
app.use(bodyparser.json());
app.use(methodOverride());
app.use(cors());

//데이터베이스 접속
var mysql = require('mysql');
var conn = mysql.createConnection({
	host:"testdatabase.c3asktw2nxxm.ap-northeast-2.rds.amazonaws.com",
    user:"root",
    password:"11131113",
    database:"mockup"
})
conn.connect(function(){
    console.log("connected database!!")
});

//아마존 접속
var AWS = require('aws-sdk');
AWS.config.region = 'ap-northeast-2';
var s3 = new AWS.S3();

var user = require('./routes/user.js')(app);
app.use('/user',user);


app.get('/',function(req,res){
	res.send('health test');
});

function verify (req,res,next){
    const token = req.body.tokens;
    console.log("verified: "+ token);
    if(!token || token == undefined){
        return res.send({
            login:'login'
        });
    }else{
        jwk.verify(token,'secretkey',(err,code)=>{
            if(err){
                console.log("jwk verify err: "+ err);
            }else{
                req.code = code;
                console.log(code);
                next();
            }
        });
    }
}

app.listen(9000, function(){
    console.log("connected server!!")
});
